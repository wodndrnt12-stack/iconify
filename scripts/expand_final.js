#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ko = JSON.parse(fs.readFileSync(path.join(__dirname,'..','ko_dict.json'),'utf8'));
const words = new Set(JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','icon_words.json'),'utf8')).map(w=>w.word));
const v = (...arr) => arr.filter(w => words.has(w));

// 알파벳 단일문자
'abcdefghijklmnopqrstuvwxyz'.split('').forEach(c => {
  if(!ko[c]) ko[c] = v('letter','alphabet','text','font');
});

const final = {
  // UI 인터랙션
  '롤오버':           v('hover','cursor','mouse','pointer'),
  '드래그앤드롭':     v('drag','drop','move','transfer'),
  '핀치투줌':         v('pinch','zoom','gesture','touch'),
  '더블탭':           v('double','tap','touch','click'),
  '롱프레스':         v('hold','press','touch','long'),
  '스와이프제스처':   v('swipe','gesture','slide','touch'),

  // 텍스트
  '글자수':           v('character','count','text','number'),
  '단어수':           v('word','count','text','number'),
  '줄간격':           v('line','height','spacing','text'),
  '단락간격':         v('paragraph','spacing','text','layout'),
  '여백설정':         v('margin','padding','space','layout'),
  '서체선택':         v('font','typeface','text','select'),
  '자간':             v('letter','spacing','text','design'),
  '행간':             v('line','height','text','spacing'),

  // 미디어 컨트롤
  '재생속도':         v('speed','play','video','fast'),
  '자막켜기':         v('subtitle','caption','on','video'),
  '자막끄기':         v('subtitle','caption','off','video'),
  '화질선택':         v('quality','video','settings','hd'),
  '전체화면재생':     v('fullscreen','play','video'),
  '미니플레이어':     v('mini','player','video','small'),

  // 커머스
  '관심상품':         v('wishlist','heart','product','save'),
  '최근본상품':       v('recent','history','product','clock'),
  '선물하기':         v('gift','send','heart','shopping'),
  '상품권':           v('voucher','gift','money','card'),
  '적립예정':         v('pending','point','reward','clock'),
  '내쿠폰':           v('coupon','wallet','discount','card'),
  '포인트사용':       v('point','use','reward','money'),
  '공동구매':         v('group','buy','people','discount'),
  '기프티콘':         v('gift','coupon','ticket','barcode'),

  // 소셜
  '친구목록':         v('friends','list','person','social'),
  '팔로잉':           v('following','list','person','social'),
  '팔로워':           v('follower','list','person','social'),
  '좋아요한것':       v('liked','heart','list','social'),
  '저장한것':         v('saved','bookmark','list','social'),

  // 할일/생산성
  '오늘할일':         v('today','task','todo','calendar'),
  '완료한일':         v('done','task','check','list'),
  '기한지남':         v('overdue','warning','clock','red'),
  '오늘마감':         v('due','today','warning','calendar'),
  '하위작업':         v('subtask','task','indent','list'),
  '담당자지정':       v('assign','person','task'),
  '우선순위높음':     v('priority','high','flag','warning'),
  '우선순위낮음':     v('priority','low','flag','info'),

  // 조직
  '조직도':           v('hierarchy','chart','people','org'),
  '팀구조':           v('team','structure','chart','people'),
  '부서':             v('department','group','office','person'),
  '팀원':             v('team','member','person','group'),
  '리더':             v('leader','crown','person','top'),
  '팀장':             v('manager','badge','team','person'),
  '임원진':           v('executive','person','business','badge'),
  '대표이사':         v('ceo','person','business','top'),

  // 데이터 시각화
  '산점도':           v('scatter','chart','data','dot'),
  '버블차트':         v('bubble','chart','data','circle'),
  '레이더차트':       v('radar','chart','data','polygon'),
  '히트맵':           v('heatmap','chart','color','data'),
  '트리맵':           v('treemap','chart','hierarchy','data'),
  '캔들스틱차트':     v('candlestick','chart','stock','finance'),
  '깔때기차트':       v('funnel','chart','conversion','data'),
  '워터폴차트':       v('waterfall','chart','bar','data'),

  // 글로벌
  '다국어':           v('multilingual','language','globe','translate'),
  '현지화':           v('localization','language','globe','flag'),
  '북미':             v('america','north','map','globe'),
  '남미':             v('america','south','latin','globe'),

  // 프로그래밍
  'REST':             v('api','server','network','code'),
  'GraphQL':          v('api','data','query','code'),
  'MVC':              v('pattern','code','structure','layer'),
  '싱글톤':           v('singleton','pattern','code','single'),
  '의존성주입':       v('dependency','code','inject','arrow'),
  '이벤트드리븐':     v('event','trigger','code','arrow'),
  '마이크로서비스':   v('service','server','cloud','api'),

  // IT 트렌드
  '메타버스':         v('metaverse','virtual','vr','avatar','3d'),
  'NFT':              v('token','digital','art','crypto'),
  '탈중앙화':         v('decentralized','blockchain','network'),
  '스마트컨트랙트':   v('smart','contract','blockchain','code'),
  '클라우드네이티브': v('cloud','native','container','deploy'),
  '서버리스':         v('serverless','cloud','function','code'),
  '로우코드':         v('low','code','drag','build'),
  '노코드':           v('no','code','drag','tool'),
  '디지털전환':       v('digital','transform','business','cloud'),
  '하이퍼오토메이션': v('automation','robot','ai','workflow'),

  // 건강 앱
  '칼로리소모':       v('calorie','burn','fitness','energy'),
  '걸음수':           v('step','walk','count','fitness'),
  '심박수':           v('heart','rate','pulse','fitness'),
  '수면추적':         v('sleep','track','analytics','night'),
  '수분섭취':         v('water','drink','health','drop'),
  '스트레스지수':     v('stress','level','health','warning'),
  '체성분':           v('body','composition','weight','health'),
  '활동량':           v('activity','move','fitness','chart'),

  // 반려동물
  '반려동물':         v('pet','animal','heart','paw'),
  '반려견':           v('dog','pet','paw','heart'),
  '반려묘':           v('cat','pet','paw','heart'),
  '동물병원':         v('vet','animal','medical','hospital'),
  '사료':             v('pet','food','bowl','animal'),
  '목줄':             v('leash','dog','walk','pet'),
  '켄넬':             v('kennel','dog','box','house'),

  // 취미 상세
  '뜨개질':           v('knit','craft','thread','hobby'),
  '자수':             v('embroidery','needle','art','craft'),
  '도예':             v('pottery','art','clay','craft'),
  '목공':             v('woodwork','craft','tool','hammer'),
  '가드닝':           v('garden','plant','grow','hobby'),
  '베이킹':           v('baking','bread','food','oven'),
  '보드게임':         v('board','game','people','fun'),
  '독서모임':         v('reading','book','group','people'),
  '달리기모임':       v('running','group','people','sport'),

  // 뷰티
  '뷰티루틴':         v('beauty','routine','face','skin'),
  '스킨케어':         v('skincare','face','cream','beauty'),
  '메이크업':         v('makeup','face','beauty','color'),
  '헤어스타일':       v('hairstyle','hair','beauty','person'),
  '네일아트':         v('nail','art','beauty','color'),
  '향수':             v('perfume','bottle','beauty','smell'),
  '선크림':           v('sunscreen','skin','sun','protect'),

  // 인테리어
  '미니멀인테리어':   v('minimal','clean','white','interior'),
  '모던인테리어':     v('modern','design','clean','interior'),
  '북유럽스타일':     v('nordic','minimal','clean','interior'),
  '홈오피스':         v('home','office','desk','work'),
  '조명인테리어':     v('lighting','lamp','decoration','home'),
  '식물인테리어':     v('plant','decoration','green','home'),

  // 음악 장르
  '팝음악':           v('pop','music','song','star'),
  '록음악':           v('rock','music','guitar','electric'),
  '힙합음악':         v('hiphop','music','beat','rap'),
  '클래식음악':       v('classical','music','orchestra','violin'),
  '전자음악':         v('electronic','music','dj','beat'),
  '케이팝':           v('kpop','music','dance','pop'),
  '발라드':           v('ballad','music','slow','emotional'),
  '재즈':             v('jazz','music','trumpet','saxophone'),

  // 계절 음식
  '봄나물':           v('spring','food','leaf','plant','nature'),
  '여름음식':         v('summer','food','cool','fresh'),
  '가을음식':         v('autumn','food','harvest','warm'),
  '겨울음식':         v('winter','food','hot','warm','soup'),
  '제철음식':         v('seasonal','food','fresh','calendar'),

  // 세계음식
  '한식':             v('korean','food','rice','traditional'),
  '중식':             v('chinese','food','rice','asian'),
  '일식':             v('japanese','sushi','food','asian'),
  '양식':             v('western','food','restaurant','fork'),
  '인도음식':         v('indian','food','curry','spice'),
  '이탈리아음식':     v('italian','pizza','pasta','food'),
  '멕시코음식':       v('mexican','taco','food','spice'),

  // 문화예술
  '미술작품':         v('art','painting','gallery','museum'),
  '조각품':           v('sculpture','art','3d','museum'),
  '디지털아트':       v('digital','art','design','creative'),
  '일러스트':         v('illustration','art','draw','design'),
  '캐릭터디자인':     v('character','design','art','person'),
  '로고디자인':       v('logo','design','brand','creative'),
  '영화':             v('movie','film','cinema','screen'),
  '드라마':           v('drama','video','screen','story'),
  '애니메이션':       v('animation','cartoon','film','art'),
  '소설':             v('novel','book','write','story'),
  '음악공연':         v('concert','music','person','stage'),

  // 우주
  '우주':             v('space','star','universe','rocket'),
  '별자리':           v('constellation','star','space','night'),
  '은하수':           v('galaxy','star','space','universe'),
  '혜성':             v('comet','star','space','tail'),
  '블랙홀':           v('blackhole','space','dark','gravity'),
  '인공위성':         v('satellite','orbit','space','signal'),

  // 역사
  '고대':             v('ancient','old','history','artifact'),
  '중세':             v('medieval','castle','sword','history'),
  '근대':             v('modern','history','building','clock'),
  '미래':             v('future','rocket','star','tech','robot'),
  '산업혁명':         v('industry','factory','machine','history'),
};

let added = 0;
for(const [k,arr] of Object.entries(final)) {
  if(arr.length === 0) continue;
  if(!ko[k]) { ko[k] = arr; added++; }
}

const sorted = {};
for(const key of Object.keys(ko).sort()) sorted[key] = ko[key];
fs.writeFileSync(path.join(__dirname,'..','ko_dict.json'), JSON.stringify(sorted, null, 2));
console.log(`추가: ${added} / 최종: ${Object.keys(sorted).length}`);
