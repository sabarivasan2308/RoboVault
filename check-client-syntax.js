const http = require('http');
const vm = require('vm');

http.get('http://127.0.0.1:3000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Received HTML, length:', data.length);
    const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
    let match;
    let idx = 0;
    while ((match = scriptRegex.exec(data)) !== null) {
      idx++;
      const scriptCode = match[1];
      console.log(`\n--- Checking <script> tag #${idx} (length: ${scriptCode.length} chars) ---`);
      try {
        new vm.Script(scriptCode, { filename: `inline-script-${idx}.js` });
        console.log(`Script #${idx}: SYNTAX VALID!`);
      } catch (err) {
        console.error(`Script #${idx}: SYNTAX ERROR!`);
        console.error(err.message);
        console.error(err.stack);
        
        // Print lines around error
        const lines = scriptCode.split('\n');
        // If stack has line number
        const lineMatch = err.stack.match(/inline-script-\d+\.js:(\d+)/);
        if (lineMatch) {
          const errLine = parseInt(lineMatch[1], 10);
          console.log(`Context around line ${errLine}:`);
          for (let l = Math.max(1, errLine - 5); l <= Math.min(lines.length, errLine + 5); l++) {
            console.log(`${l === errLine ? '>>>' : '   '} ${l}: ${lines[l - 1]}`);
          }
        }
      }
    }
  });
}).on('error', (err) => {
  console.error('HTTP request failed:', err.message);
});
