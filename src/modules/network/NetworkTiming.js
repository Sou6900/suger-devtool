window.MyDevTool = window.MyDevTool || {};

window.MyDevTool.NetworkTiming = (function () {

  let NetworkLog = null;
  let observer = null;

  function init(logModule) {
    NetworkLog = logModule;
    
    // Method 1: PerformanceObserver (Standard way)
    setupPerformanceObserver();
    
    // Method 2: Navigation Timing (Document loading)
    captureNavigationTiming();
    
    // Method 3: Existing entries
    processExistingEntries();
  }

  // ==========================================
  // Method 1: PerformanceObserver
  // ==========================================
  function setupPerformanceObserver() {
    try {
      observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          const timingData = extractDetailedTiming(entry);
          NetworkLog.addTimingData(timingData);
        });
      });
      observer.observe({ entryTypes: ['resource', 'navigation'] });
    } catch (e) {
      console.warn("MyDevTool: PerformanceObserver not supported", e);
    }
  }

  // ==========================================
  // Method 2: Navigation Timing (Document)
  // ==========================================
  function captureNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
          const timingData = extractDetailedTiming(navTiming);
          NetworkLog.addTimingData(timingData);
        }
      }, 100);
    });
  }

  // ==========================================
  // Method 3: Existing entries
  // ==========================================
  function processExistingEntries() {
    if (performance && typeof performance.getEntriesByType === 'function') {
      setTimeout(() => {
        performance.getEntriesByType('resource').forEach(entry => {
          const timingData = extractDetailedTiming(entry);
          NetworkLog.addTimingData(timingData);
        });
      }, 500);
    }
  }

  // ==========================================
  // CORE: Extract Real Timing
  // ==========================================
  function extractDetailedTiming(entry) {
    const baseTime = entry.startTime;
    
    // Check if we have detailed timing (CORS allowed)
    const hasDetailedTiming = (
      entry.domainLookupStart > 0 ||
      entry.connectStart > 0 ||
      entry.requestStart > 0
    );

    let data = {
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration,
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize
    };

    // ==========================================
    // CASE 1: Full timing available (Same-origin or CORS allowed)
    // ==========================================
    if (hasDetailedTiming) {
      data.fetchStart = entry.fetchStart || baseTime;
      data.domainLookupStart = entry.domainLookupStart || 0;
      data.domainLookupEnd = entry.domainLookupEnd || 0;
      data.connectStart = entry.connectStart || 0;
      data.connectEnd = entry.connectEnd || 0;
      data.secureConnectionStart = entry.secureConnectionStart || 0;
      data.requestStart = entry.requestStart || 0;
      data.responseStart = entry.responseStart || 0;
      data.responseEnd = entry.responseEnd || 0;
      data.timingSource = 'real';
    } 
    // ==========================================
    // CASE 2: Limited timing (CORS restricted)
    // ==========================================
    else {
      // guess
      const totalDuration = entry.duration;
      const transferSize = entry.transferSize || 0;
      
      // Check: Cached or not?
      const isCached = (transferSize === 0 && entry.encodedBodySize > 0);
      
      if (isCached) {
        // if Cache - all timing same
        data.fetchStart = baseTime;
        data.domainLookupStart = baseTime;
        data.domainLookupEnd = baseTime;
        data.connectStart = baseTime;
        data.connectEnd = baseTime;
        data.secureConnectionStart = 0;
        data.requestStart = baseTime;
        data.responseStart = baseTime;
        data.responseEnd = baseTime + totalDuration;
        data.timingSource = 'cached';
      } else {
        // Network request - but detailed timing not coming
        // reasonable estimation - based on typical patterns
        
        const isHTTPS = entry.name.startsWith('https://');
        const estimatedDNS = 20; // Typical DNS: 20-50ms
        const estimatedTCP = isHTTPS ? 80 : 50; // TCP: 50ms, +30ms for SSL
        const estimatedTTFB = Math.min(totalDuration * 0.7, 500); // 70% or max 500ms
        const estimatedDownload = totalDuration - estimatedDNS - estimatedTCP - estimatedTTFB;
        
        data.fetchStart = baseTime;
        data.domainLookupStart = baseTime;
        data.domainLookupEnd = baseTime + estimatedDNS;
        data.connectStart = baseTime + estimatedDNS;
        data.connectEnd = baseTime + estimatedDNS + estimatedTCP;
        data.secureConnectionStart = isHTTPS ? (baseTime + estimatedDNS + 10) : 0;
        data.requestStart = baseTime + estimatedDNS + estimatedTCP;
        data.responseStart = baseTime + estimatedDNS + estimatedTCP + estimatedTTFB;
        data.responseEnd = baseTime + totalDuration;
        data.timingSource = 'estimated'; // ⚠️ Estimated
      }
    }

    return data;
  }

  function cleanup() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  return {
    init,
    cleanup
  };

})();