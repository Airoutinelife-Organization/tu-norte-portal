const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    window.addEventListener('error', (event) => {
      console.log('UNCAUGHT:', event.error ? event.error.stack : event.message);
    });
    window.addEventListener('unhandledrejection', (event) => {
      console.log('UNHANDLED PROMISE:', event.reason ? event.reason.stack : event.reason);
    });
    const originalConsoleError = console.error;
    console.error = function(...args) {
      console.log('CONSOLE.ERROR:', ...args.map(a => a instanceof Error ? a.stack : a));
      originalConsoleError.apply(console, args);
    }
  });

  page.on('console', msg => console.log('LOG:', msg.text()));
  
  await page.goto('http://localhost:8000', {waitUntil: 'networkidle0'}).catch(e => console.log(e));
  await browser.close();
})();
