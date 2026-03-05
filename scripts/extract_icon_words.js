#!/usr/bin/env node
// STEP 1: iconify_db.json → icon_words.json
// Extract meaningful English words from icon names, filter modifiers/noise, count frequency

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'iconify_db.json');
const OUT_PATH = path.join(__dirname, '..', 'data', 'icon_words.json');

// Style modifiers — not meaningful search terms
const MODIFIERS = new Set([
  'rounded','sharp','outlined','filled','outline','line','bold','regular',
  'light','thin','duotone','solid','twotone','fill','off','alt','flat',
  'remix','interface','wordmark','bxs','minimalistic','icon','index','ltr',
  'big','medium','dark','logo','mini','micro','small','large','baseline',
  'round','square','circle','new','old','basic','classic','simple','color',
  'colored','white','black','gray','grey','red','blue','green','yellow',
  'plus','minus','add','remove','delete','close','open','left','right',
  'top','bottom','up','down','in','out','on','off','end','start','begin',
  'horizontal','vertical','diagonal','side','back','front','inner','outer',
  'active','inactive','disabled','enabled','selected','default','custom',
  'check','checked','unchecked','done','clear','reset','refresh','reload',
  'variant','version','type','style','mode','size','state','status',
  'one','two','three','four','five','six','seven','eight','nine','ten',
  'first','second','third','last','next','prev','previous','more','less',
  'all','any','none','other','etc','misc','general','common','main',
  'the','and','or','not','no','yes','is','are','was','be','of','in',
  'to','at','by','for','with','from','into','over','under','after',
  'before','between','through','above','below','around','across','along',
  'set','get','list','item','items','element','elements','component',
  'object','data','info','information','detail','details','content',
  'center','middle','border','margin','padding','space','gap','area',
  'group','batch','bulk','multi','single','dual','triple','double',
  'broken','filled2','outline2','twotone2','linear','line2',
  // numeric suffixes that appear as words
  '1','2','3','4','5','6','7','8','9','0',
]);

console.log('Loading iconify_db.json...');
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

const wordCount = new Map();

const keys = Object.keys(db);
console.log(`Processing ${keys.length} icons...`);

for (const key of keys) {
  const icon = db[key];
  const name = icon.name || '';

  // Split by hyphens and underscores
  const parts = name.split(/[-_]+/);

  for (const part of parts) {
    const word = part.toLowerCase().trim();

    // Skip: empty, single char, 2 chars, pure numbers, modifier words
    if (!word || word.length <= 2) continue;
    if (/^\d+$/.test(word)) continue;
    if (MODIFIERS.has(word)) continue;

    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }
}

console.log(`Total unique words: ${wordCount.size}`);

// Filter: 10+ occurrences
const filtered = [...wordCount.entries()]
  .filter(([, count]) => count >= 10)
  .sort((a, b) => b[1] - a[1])
  .map(([word, count]) => ({ word, count }));

console.log(`Words with 10+ occurrences: ${filtered.length}`);
console.log('Top 20:', filtered.slice(0, 20).map(w => `${w.word}(${w.count})`).join(', '));

fs.writeFileSync(OUT_PATH, JSON.stringify(filtered, null, 2), 'utf8');
console.log(`\nSaved: ${OUT_PATH}`);
