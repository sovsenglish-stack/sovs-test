// 사용법: node scripts/build.js data/go2.json out/
// 문제지(1p) + 정답지(1p) = 2p A4 PDF
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [dataPath, outDir = 'out'] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const logo = fs.readFileSync(path.join(__dirname, '..', 'assets', 'sovs-logo.png')).toString('base64');

const COLORS = {
  green: { fg: '#1e7a46', bg: '#e8f4ee' },
  blue:  { fg: '#1f4f9c', bg: '#e9f0fb' },
  red:   { fg: '#c0392b', bg: '#fbeeea' },
};

const words = [];
data.bands.forEach(b => b.words.forEach(([en, ko]) => words.push({ en, ko, band: b })));
if (words.length !== 50) throw new Error(`단어 수가 50이 아닙니다: ${words.length}`);

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function rows(answer) {
  const col = (from, to) => words.slice(from, to).map((w, i) => {
    const n = from + i + 1;
    const numColor = answer ? COLORS[w.band.color].fg : '#182557';
    return `<div class="row">
      <span class="num" style="color:${numColor}">${n}</span>
      <span class="en">${esc(w.en)}</span>
      ${answer ? `<span class="ko">${esc(w.ko)}</span>` : `<span class="blank"></span><span class="box"></span>`}
    </div>`;
  }).join('');
  return `<div class="cols"><div class="col">${col(0, 25)}</div><div class="col">${col(25, 50)}</div></div>`;
}

function page(answer) {
  const g = data.title_tag || data.grade;
  const badges = data.bands.map(b => `<div class="badge" style="background:${COLORS[b.color].bg};color:${COLORS[b.color].fg}">
      <span>${esc(b.label)}</span><b>${b.words.length}문항</b></div>`).join('');
  return `<section class="page ${answer ? "answer" : ""}">
    <div class="card">
      <header>
        <div class="title"><span class="bar"></span>SOVS VOCA TEST <em>${answer ? '정답 · ' : ''}${esc(g)}</em></div>
        ${answer ? '<div class="field">DATE <span class="line"></span></div>' : ''}
      </header>
      ${answer ? '' : '<div class="idbox"><span>학교</span><i></i><span>학년</span><i></i><span>이름</span><i></i><span>날짜</span><i></i><span>점수</span><i></i></div>'}
      <div class="instr">
        <div>
          <p>※ ${answer ? '채점용 정답지입니다. 표시는 문제지에 합니다.' : '주어진 영어 단어를 보고 알맞은 우리말 뜻을 쓰시오.'}</p>
          ${answer ? '<small>구간별 오답 수가 진단 리포트의 어휘 수준 판정에 사용됩니다.</small>' : ''}
        </div>
        ${answer ? '<div class="fields"><div class="field">SCORE <span class="line"></span></div></div>' : ''}
      </div>
      ${answer ? `<div class="badges">${badges}</div>` : ''}
      ${rows(answer)}
      <img class="logo" src="data:image/png;base64,${logo}">
    </div>
    <footer>${answer ? 'ANSWER KEY' : 'VOCA TEST'}(${esc(g)}) · SOVS ENGLISH</footer>
  </section>`;
}

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Noto+Sans+KR:wght@500;700;900&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 210mm; }
body { font-family: 'Poppins', 'Noto Sans KR', sans-serif; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; padding: 20pt 20pt 0; page-break-after: always; position: relative; }
.page.blank { background: #fff; }
.card { border: 1px solid #d8d8e0; border-radius: 8pt; height: 790pt; padding: 0 0 8pt; position: relative; overflow: hidden; }
header { display: flex; justify-content: space-between; align-items: center; padding: 8pt 12pt 6pt 0; border-bottom: 2px solid #182557; margin: 0 12pt 0 0; }
.title { font-weight: 800; font-size: 15.5pt; color: #182557; letter-spacing: -0.2pt; display: flex; align-items: center; }
.title .bar { display: inline-block; width: 4pt; height: 24pt; background: #182557; margin-right: 12pt; border-radius: 0 2pt 2pt 0; }
.title em { font-style: normal; font-family: 'Noto Sans KR'; font-weight: 900; color: #d9a400; margin-left: 8pt; font-size: 14pt; }
.field { font-weight: 700; font-size: 9pt; letter-spacing: 1pt; color: #182557; display: flex; align-items: flex-end; gap: 8pt; }
.field.kr { font-family: 'Noto Sans KR'; letter-spacing: 0; }
.field .line { display: inline-block; width: 78pt; border-bottom: 1.5px solid #182557; height: 12pt; }
.instr { display: flex; justify-content: space-between; align-items: flex-end; padding: 9pt 12pt 6pt 8pt; font-family: 'Noto Sans KR'; }
.instr p { font-weight: 700; font-size: 10.5pt; }
.instr small { display: block; font-size: 7.5pt; color: #666; font-weight: 500; margin-top: 2pt; }
.fields { display: flex; gap: 14pt; }
.idbox { margin: 8pt 12pt 0 8pt; border: 1.2pt solid #182557; border-radius: 6pt; display: grid; grid-template-columns: auto 1.3fr auto .7fr auto 1.3fr auto 1fr auto .8fr; align-items: center; padding: 5pt 10pt; gap: 0 7pt; font-family: 'Noto Sans KR'; font-size: 8.5pt; }
.idbox span { font-weight: 700; color: #182557; white-space: nowrap; }
.idbox i { border-bottom: 1pt solid #111; height: 13pt; display: block; }
.page:not(.answer) .instr { padding-top: 6pt; }
.page:not(.answer) .row { height: 26.6pt; }
.badges { display: flex; gap: 6pt; padding: 2pt 12pt 6pt 12pt; font-family: 'Noto Sans KR'; }
.badge { flex: 1; display: flex; justify-content: space-between; align-items: center; border-radius: 4pt; padding: 4pt 10pt; font-size: 8pt; font-weight: 700; }
.badge:nth-child(2) { flex: 1.35; }
.cols { display: flex; padding: 4pt 0 0 0; }
.col { flex: 1; padding: 0 10pt 0 8pt; }
.col:first-child { border-right: 1px dashed #d0d0d8; }
.row { display: flex; align-items: center; height: 27.2pt; border-bottom: 1px solid #eeeef2; gap: 6pt; }
.num { width: 16pt; text-align: right; font-weight: 700; font-size: 9.5pt; flex: none; }
.en { font-weight: 600; font-size: 11pt; flex: none; padding-left: 2pt; }
.blank { flex: 1; border-bottom: 1px solid #c2c2cc; height: 11pt; margin: 0 2pt 0 6pt; }
.box { width: 9.5pt; height: 9.5pt; border: 1px solid #b8b8c0; border-radius: 2pt; flex: none; }
.ko { font-family: 'Noto Sans KR'; font-weight: 500; font-size: 9pt; margin-left: 4pt; color: #222; }
.logo { position: absolute; right: 10pt; bottom: 5pt; width: 84pt; }
.answer .row { height: 26.2pt; }
footer { text-align: center; font-size: 6.5pt; color: #777; letter-spacing: 0.5pt; margin-top: 4pt; font-family: 'Poppins','Noto Sans KR'; }
</style></head><body>
${page(false)}${page(true)}
</body></html>`;

fs.mkdirSync(outDir, { recursive: true });
const base = path.join(outDir, `SOVS_${data.grade}_단어테스트`);
fs.writeFileSync(base + '.html', html);

(async () => {
  const browser = await chromium.launch();
  const pg = await browser.newPage();
  await pg.setContent(html, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.pdf({ path: base + '.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('wrote', base + '.pdf');
})();
