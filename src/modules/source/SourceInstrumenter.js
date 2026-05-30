// src/modules/source/SourceInstrumenter.js

import { parse } from "@babel/parser";
import * as t from "@babel/types";

import _traverse from "@babel/traverse";
const traverse = _traverse.default || _traverse;

import _generator from "@babel/generator";
const generator = _generator.default || _generator;

window.MyDevTool = window.MyDevTool || {};
window.MyDevTool.SourceInstrumenter = (function () {

  function instrument(code, url , lineOffset = 0, shouldWrap = true) {
    const SourceDebugger = window.MyDevTool.SourceDebugger;

    if (!SourceDebugger || !parse || !traverse || !generator || !t) {
      return code;
    }

    let ast;
    try {
      ast = parse(code, {
        locations: true,
        sourceType: 'module',
        sourceFilename: url,
        plugins: ["classProperties", "topLevelAwait"] 
      });
    } catch (e) {
      console.error(e);
      return code;
    }

    // ========== Helpers ==========
    
    function createSafeVariableAccess(varName) {
      if (varName === 'this') return t.callExpression(t.identifier('eval'), [t.stringLiteral('this')]);
      const evalCode = `(function(){try{return ${varName};}catch(e){return undefined;}})()`;
      return t.callExpression(t.identifier('eval'), [t.stringLiteral(evalCode)]);
    }

    function createScopeObject(path) {
        const varsToCapture = new Set(['this']);
        if (path.scope) {
            const bindings = path.scope.getAllBindings();
            for (const key in bindings) {
                if (key !== 'arguments' && key !== 'undefined' && !key.startsWith('_')) {
                    varsToCapture.add(key);
                }
            }
        }
        const props = Array.from(varsToCapture).map(v => 
            t.objectProperty(t.identifier(v), createSafeVariableAccess(v))
        );
        return t.objectExpression(props);
    }

    function createStepNode(path, line, isAsync, startCol = 0, endCol = 0) {
      const stepFuncName = 'stepAsync'; 
      const callee = t.memberExpression(
        t.memberExpression(t.identifier("MyDevTool"), t.identifier("SourceDebugger")),
        t.identifier(stepFuncName)
      );
      const adjustedLine = line + lineOffset;
      const scopeObj = createScopeObject(path);
      const args = [
        t.stringLiteral(url),
        t.numericLiteral(adjustedLine),
        t.numericLiteral(startCol),
        t.numericLiteral(endCol),
        t.memberExpression(t.newExpression(t.identifier("Error"), []), t.identifier("stack")),
        scopeObj 
      ];
      return t.awaitExpression(t.callExpression(callee, args));
    }
    
    function wrapExpressionWithStep(node, path, isAsync) {      
      if (!node || !node.loc) return node;
      if (!isAsync) return node;

      const line = node.loc.start.line - 1;
      const stepNode = createStepNode(path, line, true, node.loc.start.column, node.loc.end.column);
      
      if (t.isCallExpression(node)) {
        const calleeName = t.isIdentifier(node.callee) ? node.callee.name : null;
        const nativeAsyncs = ['fetch', 'setTimeout', 'setInterval', 'requestAnimationFrame', 'import'];

        if (calleeName && nativeAsyncs.includes(calleeName)) {
            return t.sequenceExpression([stepNode, node]);
        }
        return t.sequenceExpression([stepNode, t.awaitExpression(node)]);
      }
      return t.sequenceExpression([stepNode, node]);
    }

    // ========== Compatibility Checker ==========
    
    function shouldSkipInstrumentation(path) {
        if (path.node.generator) return true;
        // Promise Executor still needs to be skipped because it expects sync return
        if (path.parentPath.isNewExpression() && t.isIdentifier(path.parentPath.node.callee) && path.parentPath.node.callee.name === 'Promise') {
            return true;
        }
        return false;
    }

    // ========== Scope Analyzer ==========
    
    function handleFunctionScope(path, isAsync) {
        if (shouldSkipInstrumentation(path)) return;

        if (path.isClassMethod()) {
            if (path.node.kind === 'constructor') return;
            if (path.node.kind === 'get') return; 
            if (path.node.kind === 'set') return; 
        }

        if (!path.node.async) path.node.async = true;
        
        const bodyPath = path.get('body');
        
        if (bodyPath.isBlockStatement()) {
            const varsToCapture = new Set(['this']);
            path.node.params.forEach(p => { if (t.isIdentifier(p)) varsToCapture.add(p.name); });
             
            if (path.scope) {
                const allBindings = path.scope.getAllBindings(); 
                for(const k in allBindings) {
                    if (!k.startsWith('_') && k !== 'arguments' && k !== 'undefined') varsToCapture.add(k);
                }
            }

            const props = Array.from(varsToCapture).map(v => 
                t.objectProperty(t.identifier(v), createSafeVariableAccess(v))
            );
            const callee = t.memberExpression(t.memberExpression(t.identifier("MyDevTool"), t.identifier("SourceDebugger")), t.identifier("__captureScope"));
            const stmt = t.expressionStatement(t.awaitExpression(t.callExpression(callee, [t.objectExpression(props)])));
            
            bodyPath.node.body.unshift(stmt);
            bodyPath.traverse(rootVisitor, { isAsync: true });
        } else {
            const wrapped = wrapExpressionWithStep(bodyPath.node, path, true);
            const ret = t.returnStatement(wrapped);
            const line = bodyPath.node.loc ? bodyPath.node.loc.start.line - 1 : 0;
            const step = t.expressionStatement(createStepNode(path, line, true));
            path.get('body').replaceWith(t.blockStatement([step, ret]));
        }
        path.skip();
    }

    // ========== Loop Handler ==========
    function handleLoop(path, isAsync) {
        const funcParent = path.getFunctionParent();
        if (funcParent && shouldSkipInstrumentation(funcParent)) return;

        isAsync = isAsync !== undefined ? isAsync : true;
        
        if (path.node.init && !t.isVariableDeclaration(path.node.init)) path.node.init = wrapExpressionWithStep(path.node.init, path, isAsync);
        if (path.node.test) path.node.test = wrapExpressionWithStep(path.node.test, path, isAsync);
        if (path.node.update) path.node.update = wrapExpressionWithStep(path.node.update, path, isAsync);
        if (path.node.right) path.node.right = wrapExpressionWithStep(path.node.right, path, isAsync);

        const body = path.get('body');
        if (!body.isBlockStatement()) body.replaceWith(t.blockStatement([body.node]));
        
        if (body.node.loc) {
            const line = body.node.loc.start.line - 1;
            const step = t.expressionStatement(createStepNode(path, line, isAsync, body.node.loc.start.column, body.node.loc.start.column+1));
            body.node.body.unshift(step);
            const endLine = body.node.loc.end.line - 1;
            const endStep = t.expressionStatement(createStepNode(path, endLine, isAsync, body.node.loc.end.column-1, body.node.loc.end.column));
            body.node.body.push(endStep);
        }
        body.traverse(rootVisitor, { isAsync });
        path.skip();
    }

    // ========== Visitor ==========
    const rootVisitor = {
      Program(path) {
        path.node.async = true;
        const scopeVars = [];
        const globalsToExport = [];
        path.node.body.forEach(node => {
            if (t.isFunctionDeclaration(node) && node.id) { scopeVars.push(node.id.name); globalsToExport.push(node.id.name); }
            else if (t.isVariableDeclaration(node)) {
                node.declarations.forEach(decl => { if (t.isIdentifier(decl.id)) { scopeVars.push(decl.id.name); globalsToExport.push(decl.id.name); } });
            }
        });
        path.node._scopeVars = scopeVars;
        if (scopeVars.length > 0) {
            const properties = scopeVars.map(v => t.objectProperty(t.identifier(v), t.identifier('undefined')));
            const callee = t.memberExpression(t.memberExpression(t.identifier("MyDevTool"), t.identifier("SourceDebugger")), t.identifier("__captureScope"));
            path.node.body.unshift(t.expressionStatement(t.awaitExpression(t.callExpression(callee, [t.objectExpression(properties)]))));
        }
        if (globalsToExport.length > 0) {
            const exportStatements = globalsToExport.map(name => t.expressionStatement(t.assignmentExpression("=", t.memberExpression(t.identifier("window"), t.identifier(name)), t.identifier(name))));
            path.pushContainer('body', exportStatements);
        }
      },

      CallExpression(path) {
          // Check if it is .forEach
          if (t.isMemberExpression(path.node.callee) && 
              t.isIdentifier(path.node.callee.property) && 
              path.node.callee.property.name === 'forEach') {
              
              const arrayExp = path.node.callee.object;
              const callback = path.node.arguments[0];

              // Only transform if callback is Arrow or Function Expression
              if (t.isArrowFunctionExpression(callback) || t.isFunctionExpression(callback)) {
                  // Only handle standard 1-arg usage: array.forEach(item => ...)
                  if (callback.params.length === 1 && t.isIdentifier(callback.params[0])) {
                      const paramName = callback.params[0];
                      const body = callback.body;
                      
                      // Convert to BlockStatement if it's an implicit return arrow function
                      let blockBody = body;
                      if (!t.isBlockStatement(body)) {
                          blockBody = t.blockStatement([t.expressionStatement(body)]);
                      }

                      // Create: for (const item of array) { body }
                      const forOf = t.forOfStatement(
                          t.variableDeclaration("const", [t.variableDeclarator(paramName)]),
                          arrayExp,
                          blockBody
                      );
                      
                      // Replace the .forEach() call with the for...of loop
                      if (path.parentPath.isExpressionStatement()) {
                           path.parentPath.replaceWith(forOf);
                      } else {
                           // If forEach is part of a chain (less likely in this snippet), we can't easily replace.
                           // But for "L.forEach(...)" as a statement, this works.
                           path.replaceWith(forOf);
                      }
                      
                      // Now, visit the new loop to instrument it!
                      // We need to verify if the replacement actually happened to avoid infinite loops
                      if (path.parentPath.isForOfStatement() || t.isForOfStatement(path.node)) {
                          // Success
                      }
                  }
              }
          }
      },

      "Statement|Declaration"(path) {
        if (!path.node.loc || path.isBlockStatement() || path.isProgram()) return;
        if (path.parentPath.isForStatement() && path.key === 'init') return;
        
        const funcParent = path.getFunctionParent();
        if (funcParent) {
            if (shouldSkipInstrumentation(funcParent)) return;
            if (funcParent.isClassMethod()) {
                if (funcParent.node.kind === 'constructor') return;
                if (funcParent.node.kind === 'get') return;
                if (funcParent.node.kind === 'set') return;
            }
        }

        const isAsync = this.isAsync !== undefined ? this.isAsync : true;
        if (!isAsync) return;

        if (path.isVariableDeclaration()) {
          path.node.declarations.forEach(d => { if (d.init) d.init = wrapExpressionWithStep(d.init, path, true); });
        } else if (path.isExpressionStatement()) {
          path.node.expression = wrapExpressionWithStep(path.node.expression, path, true);
        } else if (path.isReturnStatement() && path.node.argument) {
          path.node.argument = wrapExpressionWithStep(path.node.argument, path, true);
        }
      },
      
      ArrowFunctionExpression(path) { handleFunctionScope(path, this.isAsync); },
      Function(path) { handleFunctionScope(path, this.isAsync); },
      
      TryStatement(path) {
        const isAsync = this.isAsync !== undefined ? this.isAsync : true;
        const funcParent = path.getFunctionParent();
        if (funcParent && shouldSkipInstrumentation(funcParent)) return;

        path.get('block').traverse(rootVisitor, { isAsync });
        if (path.has('handler')) {
          const handlerPath = path.get('handler');
          const catchBodyPath = handlerPath.get('body');
          if (catchBodyPath.isBlockStatement()) {
              const line = handlerPath.node.loc ? handlerPath.node.loc.start.line - 1 : 0;
              const scopeObj = createScopeObject(handlerPath); 
              const checkCall = t.callExpression(t.memberExpression(t.memberExpression(t.identifier("MyDevTool"), t.identifier("SourceBreakpointManager")),t.identifier("shouldPauseOnCaught")), []);
              const pauseCall = t.awaitExpression(t.callExpression(t.memberExpression(t.memberExpression(t.identifier("MyDevTool"), t.identifier("SourceDebugger")),t.identifier("pause")),
                  [t.stringLiteral(url),t.numericLiteral(line),t.memberExpression(t.newExpression(t.identifier("Error"), []), t.identifier("stack")), scopeObj])); 
              catchBodyPath.node.body.unshift(t.ifStatement(checkCall, t.blockStatement([t.expressionStatement(pauseCall)])));
          }
          catchBodyPath.traverse(rootVisitor, { isAsync });
        }
        if (path.has('finalizer')) path.get('finalizer').traverse(rootVisitor, { isAsync });
        path.skip();
      },
      
      IfStatement(path) {
        const funcParent = path.getFunctionParent();
        if (funcParent && shouldSkipInstrumentation(funcParent)) return;

        if (path.node.test) path.node.test = wrapExpressionWithStep(path.node.test, path, true);
        const consequent = path.get('consequent');
        if (!consequent.isBlockStatement()) consequent.replaceWith(t.blockStatement([consequent.node]));
        consequent.traverse(rootVisitor, { isAsync: true });
        if (path.has('alternate')) {
            const alternate = path.get('alternate');
            if (!alternate.isBlockStatement() && !alternate.isIfStatement()) alternate.replaceWith(t.blockStatement([alternate.node]));
            alternate.traverse(rootVisitor, { isAsync: true });
        }
        path.skip();
      },
      
      ForStatement(path) { handleLoop(path, this.isAsync); },
      WhileStatement(path) { handleLoop(path, this.isAsync); },
      DoWhileStatement(path) { handleLoop(path, this.isAsync); },
      ForOfStatement(path) { handleLoop(path, this.isAsync); },
      ForInStatement(path) { handleLoop(path, this.isAsync); },
      
      SwitchStatement(path) {
        const funcParent = path.getFunctionParent();
        if (funcParent && shouldSkipInstrumentation(funcParent)) return;

        const isAsync = this.isAsync !== undefined ? this.isAsync : true;
        if (path.node.discriminant) path.node.discriminant = wrapExpressionWithStep(path.node.discriminant, path, isAsync);
        path.node.cases.forEach(caseNode => {
          if (caseNode.test) caseNode.test = wrapExpressionWithStep(caseNode.test, path, isAsync);
          if (caseNode.consequent && caseNode.consequent.length > 0) {
            const firstStmt = caseNode.consequent[0];
            if (firstStmt.loc) {
              const line = firstStmt.loc.start.line - 1;
              const stepNode = t.expressionStatement(createStepNode(path, line, isAsync, firstStmt.loc.start.column, firstStmt.loc.start.column + 1));
              caseNode.consequent.unshift(stepNode);
            }
          }
        });
        path.traverse(rootVisitor, { isAsync });
        path.skip();
      },
      
      ConditionalExpression(path) {
        const funcParent = path.getFunctionParent();
        if (funcParent && shouldSkipInstrumentation(funcParent)) return;

        if (path.node._instrumented) return;
        path.node._instrumented = true;
        path.node.test = wrapExpressionWithStep(path.node.test, path, true);
        path.node.consequent = wrapExpressionWithStep(path.node.consequent, path, true);
        path.node.alternate = wrapExpressionWithStep(path.node.alternate, path, true);
      },
      LogicalExpression(path) {
        const funcParent = path.getFunctionParent();
        if (funcParent && shouldSkipInstrumentation(funcParent)) return;

        if (path.node._instrumented) return;
        path.node._instrumented = true;
        path.node.left = wrapExpressionWithStep(path.node.left, path, true);
        path.node.right = wrapExpressionWithStep(path.node.right, path, true);
      },
      
      DebuggerStatement(path) {
          const funcParent = path.getFunctionParent();
          if (funcParent) {
             if (shouldSkipInstrumentation(funcParent)) return;
             if (funcParent.isClassMethod()) {
                if (funcParent.node.kind === 'constructor') return;
                if (funcParent.node.kind === 'get') return;
                if (funcParent.node.kind === 'set') return;
             }
          }
          
          const line = path.node.loc ? path.node.loc.start.line - 1 : 0;
          const scopeObj = createScopeObject(path);

          const callee = t.memberExpression(t.memberExpression(t.identifier("MyDevTool"), t.identifier("SourceDebugger")), t.identifier("pause"));
          const args = [
              t.stringLiteral(url), 
              t.numericLiteral(line), 
              t.memberExpression(t.newExpression(t.identifier("Error"), []), t.identifier("stack")),
              scopeObj 
          ];
          path.replaceWith(t.expressionStatement(t.awaitExpression(t.callExpression(callee, args))));
      }
    };

    traverse(ast, rootVisitor, { isAsync: true });
    
    const { code: newCode } = generator(ast, {
      sourceMaps: true, 
      sourceFileName: url,
      retainLines: false 
    });

    const isModule = ast.program._isModule;
    
    if (shouldWrap && !isModule) {
        return `(async function() { \n${newCode}\n })();`;
    }

    return newCode;
  }

  return { instrument };

})();