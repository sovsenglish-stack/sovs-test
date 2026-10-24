# 사용법: python3 scripts/fix-leveltest.py leveltest/go1 고1 labels.json
# 레벨테스트 HTML 3종(시험지/정답지/해설지)에 공통 수정(용어 통일, 헤더, 체크박스, 레벨 표, 푸터 등)을 적용
import re, sys, json
P, G = sys.argv[1].rstrip('/') + '/', sys.argv[2]
labs = {int(k): v for k, v in json.load(open(sys.argv[3], encoding='utf-8')).items()}

def rw(f, fn):
    s = open(P + f, encoding='utf-8').read(); s2 = fn(s); open(P + f, 'w', encoding='utf-8').write(s2)

def test(s):
    s = re.sub(r'<div class="idbox top">.*?</div>', '<div class="idbox top"><span>학교</span><i></i><span>학년</span><i></i><span>이름</span><i></i><span>날짜</span><i></i><span>점수</span><i></i></div>', s, count=1, flags=re.S)
    s = s.replace('.idbox.top{margin:0 0 10px;padding:6px 14px;}', '.idbox.top{margin:0 0 10px;padding:6px 14px;grid-template-columns:auto 1.3fr auto .7fr auto 1.3fr auto 1fr auto .8fr;}')
    s = s.replace('.pq-pt{font-weight:500;color:var(--text-light);white-space:nowrap;}', '.pq-pt{font-weight:500;color:var(--text-light);white-space:nowrap;}\n.pq-chk{margin-left:auto;align-self:center;flex-shrink:0;width:13px;height:13px;border:1.3px solid #b8b8c0;border-radius:2.5px;}')
    if 'pq-chk"' not in s:
        s = re.sub(r'(<span class="pq-pt">\[\d+점\]</span></span>)', r'\1<span class="pq-chk"></span>', s)
    for a, b in [('어법 · 심화', '어법 조합 · 심화'), ('순서 · 삽입 · 기본', '삽입 · 기본'), ('순서 · 삽입 · 심화', '순서 · 심화'), ('일치 · 함축 · 기본', '불일치 · 기본'), ('일치 · 함축 · 심화', '함축 · 심화')]:
        s = s.replace('<span class="pq-tag">' + a + '</span>', '<span class="pq-tag">' + b + '</span>')
    # 대의 태그는 해설지의 제목/주제 구분을 따름
    s = s.replace('⁠', '')
    for n in range(1, 5): s = s.replace(f'<div class="page-number">{n}</div>', f'<div class="page-number">{G} LEVEL TEST · {n} / 4 · SOVS ENGLISH</div>')
    s = s.replace('.ansbox.fix td{border:1px solid var(--sky-border);height:40px;}', '.ansbox.fix td{border:1px solid var(--sky-border);height:52px;}')
    s = s.replace('.ansbox.lines .ln{border-bottom:1.2px solid var(--text-dark);height:38px;}', '.ansbox.lines .ln{border-bottom:1.2px solid var(--text-dark);height:46px;}')
    s = s.replace('<div class="ansbox lines"><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>', '<div class="ansbox lines"><div class="ln"></div><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>')
    s = re.sub(r'(<div class="badge"><span class="badge-icon">⭐</span>) 30분 · 100점(</div><div class="page-inner"><div class="header"><div class="header-left"><div class="no-marker"></div><span class="main">SOVS <span class="main-point">[^<]*</span> 레벨테스트</span><span class="header-sub">서답형 2문항)', r'\1 서답형\2', s)
    return s

def key(s):
    s = re.sub(r'난도는 전국 응시자 오답률\(기본 = 오답률 상위 15위 밖, 변별 = 45~65%\)로 잡았습니다\.', '기본 문항은 해당 영역의 대표 유형을, 심화 문항은 변형·조합형으로 한 단계 높은 사고를 요구하도록 구성했습니다.', s)
    s = s.replace('변별', '심화')
    lv = f'''<table class="lvl-t"><thead><tr><th>레벨</th><th>총점</th><th>레벨 확인</th></tr></thead><tbody>
<tr><td><b>최상</b></td><td>90점 이상</td><td class="l">{G} 모의고사 1등급권입니다.<br>모든 영역의 기본·심화 문항을 안정적으로 해결하고 서술형까지 정확하게 씁니다.<br>수능형 고난도 독해와 서술형 심화 훈련으로 바로 들어갑니다.</td></tr>
<tr><td><b>상</b></td><td>75~89점</td><td class="l">{G} 모의고사 2등급권입니다.<br>기본 문항은 거의 다 맞히고 심화 문항에서 일부를 놓칩니다.<br>틀린 영역의 심화 유형을 집중 보강하면 1등급 진입이 가능합니다.</td></tr>
<tr><td><b>중</b></td><td>60~74점</td><td class="l">{G} 모의고사 3등급권입니다.<br>기본 문항은 해결하지만 심화 문항과 서술형에서 점수를 잃습니다.<br>구문 독해의 정확도를 높이고 영역별 풀이 전략을 익히는 단계가 필요합니다.</td></tr>
<tr><td><b>기본</b></td><td>60점 미만</td><td class="l">{G} 모의고사 4등급 이하입니다.<br>기본 문항에서도 오답이 나오므로 어휘·문법 기초와 문장 단위 해석부터 다시 다집니다.<br>기초가 잡히면 점수가 빠르게 오르는 구간입니다.</td></tr>
</tbody></table>'''
    s = re.sub(r'<table class="lvl-t">.*?</table>', lv, s, flags=re.S)
    s = re.sub(r'<p class="ab-d" style="margin-top:7px;font-size:10.5px"><b>보조 꼬리표</b>.*?</p>', '', s, flags=re.S)
    s = s.replace('.lvl-t td.l{text-align:left;}', '.lvl-t td.l{text-align:left;line-height:1.6;padding:6px 8px;}\n.lvl-t td:nth-child(2){white-space:nowrap;}')
    def rep(m):
        n = int(m.group(1)); return m.group(0).split('<td class="lab">')[0] + f'<td class="lab">{labs[n]}</td></tr>'
    s = re.sub(r'<td class="no">(\d+)</td>.*?<td class="lab">.*?</td></tr>', rep, s, flags=re.S)
    s = s.replace('.key td.lab{text-align:left;font-size:11px;line-height:1.45;}', '.key td.lab{text-align:left;font-size:11px;line-height:1.45;white-space:nowrap;}')
    s = re.sub(r'<p class="sa-n">.*?</p>', '', s)
    s = re.sub(r'<div class="pn">[^<]*</div>', f'<div class="pn">{G} LEVEL TEST · ANSWER KEY · 1 / 1 · SOVS ENGLISH</div>', s)
    return s

def sol(s):
    s = s.replace('짝이 뒤바뀌면 0점, 일부만 맞으면 1점', '모두 맞으면 3점, 대부분 맞으면 2점, 일부만 맞으면 1점, 짝이 뒤바뀌면 0점')
    s = s.replace('찾기 3 + 고치기 3. 기호 없이 고친 표현만 써도 어느 밑줄인지 분명하면 찾기 점수 인정', '찾기 3 + 고치기 3. 기호 칸과 틀린 표현 칸 중 하나만 맞게 써도 어느 밑줄인지 분명하면 찾기 점수 인정')
    for n in range(1, 9): s = s.replace(f'<div class="page-number">{n}</div>', f'<div class="page-number">{G} LEVEL TEST · SOLUTIONS · {n} / 8 · SOVS ENGLISH</div>')
    return s.replace('⁠', '')

rw('시험지.html', test); rw('정답지.html', key); rw('해설지.html', sol); print('fixed', P)
