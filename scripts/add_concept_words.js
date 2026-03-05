#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ko = JSON.parse(fs.readFileSync(path.join(__dirname,'..','ko_dict.json'), 'utf8'));
const words = new Set(JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','icon_words.json'), 'utf8')).map(w=>w.word));

// 실존 단어만 필터
const v = (...arr) => arr.filter(w => words.has(w));

const additions = {
  // 수면/휴식
  '잠':          v('sleep','bed','moon','night'),
  '수면':        v('sleep','bed','moon','night'),
  '꿈':          v('sleep','moon','star','night','cloud'),
  '졸음':        v('sleep','tired','moon'),
  '자다':        v('sleep','bed','night'),
  '취침':        v('sleep','bed','moon','night'),
  '낮잠':        v('sleep','moon','sun'),
  '피곤':        v('tired','battery','sleep','low'),
  '피로':        v('tired','battery','sleep'),
  '휴식':        v('sleep','pause','moon'),

  // 감정
  '기쁨':        v('happy','smile','heart','star'),
  '슬픔':        v('sad','rain','cry'),
  '눈물':        v('cry','sad','drop','water'),
  '분노':        v('angry','fire','warning','alert'),
  '화남':        v('angry','fire','warning'),
  '무서움':      v('fear','warning','ghost','danger','skull'),
  '공포':        v('fear','ghost','skull','danger'),
  '놀람':        v('surprise','alert','exclamation'),
  '걱정':        v('warning','alert','question','sad'),
  '불안':        v('warning','alert','question'),
  '지루함':      v('sleep','tired','clock'),
  '행복':        v('happy','smile','heart','sun','star'),
  '설렘':        v('heart','star','love','smile'),
  '외로움':      v('person','sad','moon'),

  // 사랑/관계
  '사랑':        v('love','heart','couple','star'),
  '연인':        v('couple','love','heart','person'),
  '결혼':        v('ring','love','couple','heart'),
  '웨딩':        v('ring','couple','heart'),
  '이별':        v('heart','sad','person'),
  '우정':        v('people','heart','handshake'),
  '포옹':        v('people','heart','love'),
  '키스':        v('kiss','love','heart','couple'),

  // 신체/건강
  '배고픔':      v('food','eat','restaurant'),
  '목마름':      v('drink','water','bottle'),
  '두통':        v('head','brain','medical'),
  '열':          v('temperature','thermometer','hot','medical'),
  '감기':        v('sick','medical','cold','virus','mask'),
  '병':          v('sick','medical','hospital','virus'),
  '아픔':        v('sick','medical','hospital'),
  '회복':        v('medical','health','restore','heart'),
  '다이어트':    v('weight','fitness','food','health'),
  '운동':        v('fitness','sports','run'),
  '스트레칭':    v('fitness','body','exercise','sports'),

  // 일상 활동
  '요리':        v('cook','food','kitchen','meal'),
  '밥':          v('food','eat','meal','restaurant'),
  '식사':        v('food','eat','meal','fork'),
  '청소':        v('clean','wash','trash','vacuum'),
  '빨래':        v('wash','laundry','clean','water'),
  '세탁':        v('wash','laundry','clean'),
  '주문':        v('order','shopping','food','cart'),
  '배달':        v('delivery','truck','food','map'),
  '독서':        v('book','read','library','study'),
  '공부':        v('study','book','school','pencil'),
  '글쓰기':      v('write','pen','pencil','edit','text'),
  '그림그리기':  v('draw','brush','paint','art'),
  '노래':        v('music','sing','microphone','audio'),
  '춤':          v('dance','music','person'),
  '운전':        v('drive','car','road','vehicle'),
  '여행':        v('travel','airplane','luggage','map'),
  '산책':        v('walk','person','road','park'),
  '등산':        v('mountain','hiking','walk','nature'),
  '낚시':        v('fish','water','hook'),
  '수영':        v('swim','water','sport','pool'),
  '달리기':      v('run','sport','fitness','person'),
  '게임하기':    v('game','play','controller','joystick'),
  '사진찍기':    v('camera','photo','picture','image'),
  '캠핑':        v('tent','fire','mountain','nature'),

  // 직업/일
  '직장':        v('work','office','building','business'),
  '출근':        v('work','office','building','person'),
  '퇴근':        v('home','work','person','door'),
  '야근':        v('work','moon','night','office','clock'),
  '회의':        v('meeting','people','video','conference'),
  '발표':        v('presentation','people','screen','microphone'),
  '보고서':      v('report','document','chart','data','file'),
  '기획':        v('plan','document','chart','design'),
  '창업':        v('business','rocket','star','idea'),
  '채용':        v('person','work','briefcase','document'),
  '면접':        v('person','meeting','briefcase','work'),
  '급여':        v('money','cash','pay','dollar','wallet'),
  '계약':        v('document','pen','handshake','file'),

  // 날씨/자연
  '폭풍':        v('storm','wind','lightning','rain'),
  '태풍':        v('storm','wind','rain','cloud','warning'),
  '폭우':        v('rain','storm','cloud','water'),
  '홍수':        v('flood','water','rain','storm','warning'),
  '가뭄':        v('sun','hot','fire','warning'),
  '무지개':      v('rainbow','color','rain','sun'),
  '안개':        v('fog','cloud','weather'),
  '미세먼지':    v('mask','warning','wind','weather'),
  '황사':        v('wind','cloud','warning','mask'),

  // 기술
  '인공지능':    v('ai','brain','robot','automation','chip'),
  '머신러닝':    v('ai','brain','data','chart'),
  '해킹':        v('security','bug','warning','shield','lock'),
  '블록체인':    v('bitcoin','currency','security','network'),
  '가상현실':    v('glasses','headset','game'),
  '자동화':      v('robot','automation','settings','gear','cog'),
  '스트리밍':    v('stream','video','play','music','live'),
  '소셜미디어':  v('social','people','share','network'),

  // 교통
  '길':          v('road','map','navigation','path'),
  '주차':        v('parking','car','garage'),
  '신호등':      v('traffic','light','road','signal'),
  '주유소':      v('gas','fuel','car','station','pump'),
  '충전소':      v('charging','electric','car','battery'),

  // 금융
  '돈':          v('money','cash','coin','dollar','wallet'),
  '지출':        v('money','spend','minus','wallet'),
  '수입':        v('money','income','dollar','wallet'),
  '저축':        v('save','money','bank','wallet'),
  '투자':        v('money','chart','stock','trend'),
  '주식':        v('stock','chart','trend','money'),
  '환율':        v('currency','exchange','money','globe'),
  '대출':        v('money','bank','document'),
  '할부':        v('money','card','credit','payment'),

  // 교육
  '입학':        v('school','education','person','book'),
  '졸업':        v('graduation','school','hat','certificate'),
  '수업':        v('school','study','book','person'),
  '숙제':        v('study','book','pencil','assignment','task'),
  '시험':        v('test','study','document','check'),
  '성적':        v('chart','education','star','check'),
  '유학':        v('airplane','school','globe','travel'),

  // 음식 상세
  '아침식사':    v('food','eat','morning','egg'),
  '점심':        v('food','eat','restaurant','sun'),
  '저녁식사':    v('food','eat','moon','restaurant'),
  '간식':        v('food','eat','cookie'),
  '커피':        v('coffee','drink','cup'),
  '술':          v('beer','wine','drink','glass'),
  '과일':        v('food','apple','eat'),
  '야채':        v('food','leaf','eat','plant'),
  '빵':          v('food','eat','bakery'),
  '피자':        v('pizza','food','eat','restaurant'),
  '햄버거':      v('food','eat','restaurant','fast'),
  '케이크':      v('cake','food','eat','birthday','party'),
  '아이스크림':  v('ice','food','eat','cold','cream'),
  '물':          v('water','drink','drop','bottle'),

  // 집
  '거실':        v('sofa','home','room','family'),
  '주방':        v('kitchen','cook','food','home'),
  '욕실':        v('bath','toilet','shower','home'),
  '침실':        v('bed','sleep','room','home'),
  '현관':        v('door','home','key','walk'),

  // 계절
  '봄':          v('flower','leaf','rain','sun','nature'),
  '여름':        v('sun','hot','beach','swim','water'),
  '가을':        v('leaf','tree','wind','nature'),
  '겨울':        v('snow','cold','ice','moon','snowflake'),

  // 시간대
  '아침':        v('sun','morning','alarm','eat'),
  '낮':          v('sun','day','clock'),
  '새벽':        v('moon','star','night','sleep','dark'),
  '자정':        v('moon','clock','night','star','sleep'),

  // 개념/추상
  '생각':        v('brain','idea','lightbulb','bulb'),
  '아이디어':    v('lightbulb','bulb','idea','brain','spark'),
  '창의성':      v('lightbulb','art','paint','creative','brain'),
  '혁신':        v('rocket','lightbulb','star','idea','spark'),
  '성공':        v('success','trophy','star','check','medal'),
  '실패':        v('error','warning','sad','cross'),
  '목표':        v('target','goal','star','arrow','flag'),
  '꿈(목표)':    v('star','goal','target','rocket','flag'),
  '희망':        v('star','sun','light','heart'),
  '믿음':        v('shield','heart','check','handshake'),
  '약속':        v('handshake','calendar','check','ring'),
  '비밀':        v('lock','key','shield'),
  '기억':        v('brain','history','save','memory','bookmark'),
  '집중':        v('focus','target','eye','zoom'),
  '축제':        v('party','music','star'),
  '파티':        v('party','balloon','music','food'),
  '생일':        v('birthday','cake','party','gift'),
  '선물':        v('gift','box','heart','star'),
  '크리스마스':  v('snow','star','gift','tree'),
  '새해':        v('star','party'),
  '명절':        v('family','food','star','calendar'),

  // 색상 개념어
  '빨강':        v('fire','heart','warning','stop'),
  '파랑':        v('water','sky','ocean','cold'),
  '초록':        v('leaf','nature','tree','check'),
  '노랑':        v('sun','star','warning','bright'),
  '검정':        v('dark','night','ink','shadow'),
  '분홍':        v('flower','heart','love','rose'),

  // 방향 개념어
  '위로':        v('up','arrow','top'),
  '아래로':      v('down','arrow','bottom'),
  '앞으로':      v('forward','arrow','next'),
  '뒤로':        v('back','arrow','previous'),
  '가운데':      v('center','middle','align','focus'),

  // 크기/정도
  '빠름':        v('fast','speed','bolt','rocket','run'),
  '느림':        v('slow','clock'),
  '크기조절':    v('resize','scale','zoom','expand'),

  // 기타
  '새로운':      v('new','star','add','fresh'),
  '오래된':      v('history','clock','archive'),
  '인기':        v('trending','hot','star','fire'),
  '무료':        v('free','gift','open'),
  '유료':        v('money','pay','lock','premium'),
  '중요':        v('flag','star','warning','mark'),
  '긴급':        v('emergency','warning','alarm','alert','fast'),
  '임시':        v('draft','temporary','clock','timer'),
  '완료':        v('check','done','success','complete'),
  '진행중':      v('progress','loading','sync','clock'),
  '대기':        v('clock','timer','pause','wait'),
  '취소됨':      v('cancel','cross','error','close'),
};

let added = 0, skipped = 0;
for (const [k, arr] of Object.entries(additions)) {
  if (arr.length === 0) { skipped++; continue; }
  if (!ko[k]) { ko[k] = arr; added++; }
}

const sorted = {};
for (const key of Object.keys(ko).sort()) sorted[key] = ko[key];
fs.writeFileSync(path.join(__dirname,'..','ko_dict.json'), JSON.stringify(sorted, null, 2));
console.log(`추가: ${added}개 / 스킵(영단어없음): ${skipped}개 / 총: ${Object.keys(sorted).length}개`);

// 검증
const tests = ['잠','꿈','피곤','사랑','분노','슬픔','요리','공부','여행','봄','겨울','생각','아이디어','폭풍','투자','회의','인공지능'];
tests.forEach(t => console.log(`${t}: ${sorted[t]?.join(', ') || '없음'}`));
