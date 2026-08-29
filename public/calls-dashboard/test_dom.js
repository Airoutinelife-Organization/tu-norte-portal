const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8000', {waitUntil: 'networkidle0'}).catch(e => console.log(e));
  
  // Wait a bit to ensure it finished
  await new Promise(r => setTimeout(r, 2000));
  
  const text = await page.$eval('#kpiLlamadasAtendidas', el => el.textContent);
  console.log('Llamadas Atendidas:', text);
  
  await browser.close();
})();
