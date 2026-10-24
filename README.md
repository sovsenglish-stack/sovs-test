# SOVS 단어 테스트 생성기

```bash
node scripts/build.js data/go2.json out/
```

- `data/<학년>.json` : 학년, 구간(A/B/C) 라벨·색, 단어 50개(영단어, 뜻)
- `scripts/build.js` : HTML 템플릿 렌더 → Playwright(Chromium)로 A4 PDF 출력 (문제지 · 빈 페이지 · 정답지 · 빈 페이지, 양면 인쇄용)
- `out/` : 생성된 PDF/HTML
- `docs/template-analysis.md` : 원본 중3 템플릿 분석

단어 출처: 능률VOCA 수능 필수 / 수능 고난도 (2025 개정)
