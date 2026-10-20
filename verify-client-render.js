const http = require('http');
const vm = require('vm');

http.get('http://127.0.0.1:3000', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', async () => {
    console.log('========================================================');
    console.log('🧪 CLIENT-SIDE DOM & NAVIGATION RENDER TEST');
    console.log('========================================================');

    // Extract HTML body and script
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
    if (!scriptMatch) {
      console.error('FAIL: No script tag found in HTML');
      process.exit(1);
    }
    const clientScript = scriptMatch[1];

    // Build a lightweight mock DOM environment
    const elements = {};
    function createMockElement(id, tag = 'div') {
      const el = {
        id: id,
        tagName: tag.toUpperCase(),
        innerHTML: '',
        innerText: '',
        style: {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        setAttribute(k, v) { this[k] = v; },
        getAttribute(k) { return this[k]; },
        addEventListener() {},
        querySelector() { return null; },
        querySelectorAll() { return []; }
      };
      elements[id] = el;
      return el;
    }

    // Pre-populate known static DOM IDs from HTML
    const idRegex = /id="([^"]+)"/g;
    let m;
    while ((m = idRegex.exec(html)) !== null) {
      createMockElement(m[1]);
    }

    // Mock window & document
    const sandbox = {
      window: {
        addEventListener: () => {},
        removeEventListener: () => {}
      },
      document: {
        getElementById(id) {
          if (!elements[id]) {
            elements[id] = createMockElement(id);
          }
          return elements[id];
        },
        createElement(tag) {
          return createMockElement('dyn_' + Math.random().toString(36).substring(7), tag);
        },
        querySelectorAll(selector) {
          return [];
        },
        querySelector(selector) {
          return null;
        },
        addEventListener() {},
        body: createMockElement('body')
      },
      navigator: { userAgent: 'NodeTestBrowser/1.0' },
      location: { href: 'http://localhost:3000', search: '', pathname: '/' },
      console: {
        log: () => {},
        warn: console.warn,
        error: console.error
      },
      fetch: async (url, opts) => {
        return new Promise((resolve, reject) => {
          const reqUrl = url.startsWith('http') ? url : `http://127.0.0.1:3000${url}`;
          const method = (opts && opts.method) || 'GET';
          const headers = (opts && opts.headers) || {};
          const body = (opts && opts.body) || null;
          
          const u = new URL(reqUrl);
          const req = http.request({
            hostname: u.hostname,
            port: u.port,
            path: u.pathname + u.search,
            method: method,
            headers: headers
          }, (backendRes) => {
            let resData = '';
            backendRes.on('data', chunk => resData += chunk);
            backendRes.on('end', () => {
              resolve({
                ok: backendRes.statusCode >= 200 && backendRes.statusCode < 300,
                status: backendRes.statusCode,
                json: async () => JSON.parse(resData),
                text: async () => resData
              });
            });
          });
          req.on('error', reject);
          if (body) req.write(body);
          req.end();
        });
      },
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: () => 1,
      clearInterval: () => {},
      requestAnimationFrame: (cb) => setTimeout(cb, 16)
    };

    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;
    sandbox.addEventListener = () => {};
    sandbox.removeEventListener = () => {};

    // Execute client script in sandbox
    const context = vm.createContext(sandbox);
    try {
      vm.runInContext(clientScript, context);
      console.log('[✓] Client script compiled & executed in browser sandbox without error.');
    } catch (err) {
      console.error('[✗] Runtime error executing client script:', err);
      process.exit(1);
    }

    // Test main tab renders
    const tabsToTest = [
      'dashboard',
      'missions',
      'predictive',
      'digitalTwin',
      'research',
      'assets',
      'checkouts',
      'maintenance',
      'scheduling',
      'faults',
      'reports',
      'health'
    ];

    let allPassed = true;
    for (const tab of tabsToTest) {
      try {
        if (typeof context.switchTab === 'function') {
          context.switchTab(tab);
          // Wait for async fetch in tab render
          await new Promise(r => setTimeout(r, 80));
          const mainContent = elements['mainContent'] || elements['contentArea'] || elements['appContent'];
          const renderedHtml = mainContent ? mainContent.innerHTML : '';
          if (renderedHtml.length > 50) {
            console.log(`[✓] Tab '${tab}': PASS (Rendered ${renderedHtml.length} characters of HTML)`);
          } else {
            console.error(`[✗] Tab '${tab}': FAIL (Empty or minimal content: ${renderedHtml.length} chars)`);
            allPassed = false;
          }
        } else {
          console.error('[✗] switchTab is not a function');
          allPassed = false;
          break;
        }
      } catch (tabErr) {
        console.error(`[✗] Tab '${tab}' threw runtime error:`, tabErr.message);
        allPassed = false;
      }
    }

    console.log('========================================================');
    if (allPassed) {
      console.log('🎉 ALL TAB RENDERS & NAVIGATION TEST SUITES PASSED!');
    } else {
      console.error('❌ SOME TAB RENDERS FAILED');
      process.exit(1);
    }
  });
});
