// 사용법: node scripts/render-leveltest.js leveltest/go2
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const dir = path.resolve(process.argv[2]);
(async () => {
  const b = await chromium.launch();
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html'))) {
    const p = await b.newPage();
    await p.goto('file://' + path.join(dir, f), { waitUntil: 'networkidle' });
    await p.emulateMedia({ media: 'print' }); await p.evaluate(() => document.fonts.ready);
    const over = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => { const pr = pg.getBoundingClientRect(); return [...pg.querySelectorAll('.pq,.card,.subans,.key,.about')].some(el => el.getBoundingClientRect().bottom > pr.bottom - 38) ? i + 1 : 0; }).filter(Boolean));
    await p.pdf({ path: path.join(dir, f.replace('.html', '.pdf')), format: 'A4', printBackground: true, preferCSSPageSize: true });
    console.log(f, over.length ? 'OVERFLOW pages ' + over : 'ok'); await p.close();
  }
  await b.close();
})();
