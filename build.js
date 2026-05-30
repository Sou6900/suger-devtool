import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";

const outdir = "build";
if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const sugerOptimizerPlugin = {
  name: "suger-optimizer",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await fs.promises.readFile(args.path, "utf8");
      const result = await esbuild.transform(css, {
        loader: "css",
        minify: true
      });
      return {
        contents: result.code,
        loader: "text"
      };
    });

    build.onLoad({ filter: /\.js$/ }, async (args) => {
      if (args.path.includes(path.join("src", "modules", "console")) || args.path.includes("node_modules")) {
        return;
      }

      const jsCode = await fs.promises.readFile(args.path, "utf8");
      
      const result = await esbuild.transform(jsCode, {
        minifyIdentifiers: false,
        minifySyntax: true,
        minifyWhitespace: true,
        legalComments: 'none'
      });

      return {
        contents: result.code,
        loader: "js"
      };
    });
  },
};

const copySWPlugin = {
  name: "copy-service-worker",
  setup(build) {
    build.onEnd(result => {
      if (result.errors.length > 0) return;
      const swSource = path.join("src", "modules", "source", "devtool-sw.js");
      const swDest = "devtool-sw.js"; 
      try {
        fs.copyFileSync(swSource, swDest);
        console.log(`✅ Service Worker copied`);
      } catch (err) {
        console.error(`❌ SW Error: ${err}`);
      }
    });
  },
};

async function start() {
  const ctx = await esbuild.context({
    entryPoints: ["main.js"],
    bundle: true,
    sourcemap: false, 
    minify: true, 
    format: "iife",
    outfile: "build/suger-dev.min.js",
    loader: {
      ".png": "dataurl"
    },
    define: {
      "process.env": '{"NODE_ENV":"production"}'
    },
    plugins: [sugerOptimizerPlugin, copySWPlugin],
  });

  await ctx.watch();
  console.log("ESbuild watching... (Console folder excluded from operations)");
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
