# Sessions 명령어

`~/.claude/sessions/`에 저장된 Claude Code 세션 기록을 관리합니다 — 나열, 로드, 별칭 생성, 편집.

## 사용법

`/sessions [list|load|alias|info|help] [options]`

## 액션

### 세션 목록 조회

메타데이터, 필터링, 페이지네이션으로 모든 세션 표시.

```bash
/sessions                              # 모든 세션 나열 (기본값)
/sessions list                         # 위와 동일
/sessions list --limit 10              # 10개 세션 표시
/sessions list --date 2026-02-01       # 날짜로 필터링
/sessions list --search abc            # 세션 ID로 검색
```

**스크립트:**
```bash
node -e "
const sm = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-manager');
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');

const result = sm.getAllSessions({ limit: 20 });
const aliases = aa.listAliases();
const aliasMap = {};
for (const a of aliases) aliasMap[a.sessionPath] = a.name;

console.log('Sessions (showing ' + result.sessions.length + ' of ' + result.total + '):');
console.log('');
console.log('ID        Date        Time     Size     Lines  Alias');
console.log('────────────────────────────────────────────────────');

for (const s of result.sessions) {
  const alias = aliasMap[s.filename] || '';
  const size = sm.getSessionSize(s.sessionPath);
  const stats = sm.getSessionStats(s.sessionPath);
  const id = s.shortId === 'no-id' ? '(none)' : s.shortId.slice(0, 8);
  const time = s.modifiedTime.toTimeString().slice(0, 5);

  console.log(id.padEnd(8) + ' ' + s.date + '  ' + time + '   ' + size.padEnd(7) + '  ' + String(stats.lineCount).padEnd(5) + '  ' + alias);
}
"
```

### 세션 로드

세션 내용 로드 및 표시 (ID 또는 별칭으로).

```bash
/sessions load <id|alias>             # 세션 로드
/sessions load 2026-02-01             # 날짜로 (no-id 세션의 경우)
/sessions load a1b2c3d4               # 짧은 ID로
/sessions load my-alias               # 별칭 이름으로
```

**스크립트:**
```bash
node -e "
const sm = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-manager');
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');
const id = process.argv[1];

// 먼저 별칭으로 확인
const resolved = aa.resolveAlias(id);
const sessionId = resolved ? resolved.sessionPath : id;

const session = sm.getSessionById(sessionId, true);
if (!session) {
  console.log('Session not found: ' + id);
  process.exit(1);
}

const stats = sm.getSessionStats(session.sessionPath);
const size = sm.getSessionSize(session.sessionPath);
const aliases = aa.getAliasesForSession(session.filename);

console.log('Session: ' + session.filename);
console.log('Path: ~/.claude/sessions/' + session.filename);
console.log('');
console.log('Statistics:');
console.log('  Lines: ' + stats.lineCount);
console.log('  Total items: ' + stats.totalItems);
console.log('  Completed: ' + stats.completedItems);
console.log('  In progress: ' + stats.inProgressItems);
console.log('  Size: ' + size);
console.log('');

if (aliases.length > 0) {
  console.log('Aliases: ' + aliases.map(a => a.name).join(', '));
  console.log('');
}

if (session.metadata.title) {
  console.log('Title: ' + session.metadata.title);
  console.log('');
}

if (session.metadata.started) {
  console.log('Started: ' + session.metadata.started);
}

if (session.metadata.lastUpdated) {
  console.log('Last Updated: ' + session.metadata.lastUpdated);
}
" "$ARGUMENTS"
```

### 별칭 생성

세션에 기억하기 쉬운 별칭 생성.

```bash
/sessions alias <id> <name>           # 별칭 생성
/sessions alias 2026-02-01 today-work # "today-work"라는 별칭 생성
```

**스크립트:**
```bash
node -e "
const sm = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-manager');
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');

const sessionId = process.argv[1];
const aliasName = process.argv[2];

if (!sessionId || !aliasName) {
  console.log('Usage: /sessions alias <id> <name>');
  process.exit(1);
}

// 세션 파일명 가져오기
const session = sm.getSessionById(sessionId);
if (!session) {
  console.log('Session not found: ' + sessionId);
  process.exit(1);
}

const result = aa.setAlias(aliasName, session.filename);
if (result.success) {
  console.log('✓ Alias created: ' + aliasName + ' → ' + session.filename);
} else {
  console.log('✗ Error: ' + result.error);
  process.exit(1);
}
" "$ARGUMENTS"
```

### 별칭 삭제

기존 별칭 삭제.

```bash
/sessions alias --remove <name>        # 별칭 삭제
/sessions unalias <name>               # 위와 동일
```

**스크립트:**
```bash
node -e "
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');

const aliasName = process.argv[1];
if (!aliasName) {
  console.log('Usage: /sessions alias --remove <name>');
  process.exit(1);
}

const result = aa.deleteAlias(aliasName);
if (result.success) {
  console.log('✓ Alias removed: ' + aliasName);
} else {
  console.log('✗ Error: ' + result.error);
  process.exit(1);
}
" "$ARGUMENTS"
```

### 세션 정보

세션에 대한 상세 정보 표시.

```bash
/sessions info <id|alias>              # 세션 상세 정보 표시
```

**스크립트:**
```bash
node -e "
const sm = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-manager');
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');

const id = process.argv[1];
const resolved = aa.resolveAlias(id);
const sessionId = resolved ? resolved.sessionPath : id;

const session = sm.getSessionById(sessionId, true);
if (!session) {
  console.log('Session not found: ' + id);
  process.exit(1);
}

const stats = sm.getSessionStats(session.sessionPath);
const size = sm.getSessionSize(session.sessionPath);
const aliases = aa.getAliasesForSession(session.filename);

console.log('Session Information');
console.log('════════════════════');
console.log('ID:          ' + (session.shortId === 'no-id' ? '(none)' : session.shortId));
console.log('Filename:    ' + session.filename);
console.log('Date:        ' + session.date);
console.log('Modified:    ' + session.modifiedTime.toISOString().slice(0, 19).replace('T', ' '));
console.log('');
console.log('Content:');
console.log('  Lines:         ' + stats.lineCount);
console.log('  Total items:   ' + stats.totalItems);
console.log('  Completed:     ' + stats.completedItems);
console.log('  In progress:   ' + stats.inProgressItems);
console.log('  Size:          ' + size);
if (aliases.length > 0) {
  console.log('Aliases:     ' + aliases.map(a => a.name).join(', '));
}
" "$ARGUMENTS"
```

### 별칭 목록 조회

모든 세션 별칭 표시.

```bash
/sessions aliases                      # 모든 별칭 나열
```

**스크립트:**
```bash
node -e "
const aa = require((process.env.CLAUDE_PLUGIN_ROOT||require('path').join(require('os').homedir(),'.claude'))+'/scripts/lib/session-aliases');

const aliases = aa.listAliases();
console.log('Session Aliases (' + aliases.length + '):');
console.log('');

if (aliases.length === 0) {
  console.log('No aliases found.');
} else {
  console.log('Name          Session File                    Title');
  console.log('─────────────────────────────────────────────────────────────');
  for (const a of aliases) {
    const name = a.name.padEnd(12);
    const file = (a.sessionPath.length > 30 ? a.sessionPath.slice(0, 27) + '...' : a.sessionPath).padEnd(30);
    const title = a.title || '';
    console.log(name + ' ' + file + ' ' + title);
  }
}
"
```

## 인수

$ARGUMENTS:
- `list [options]` - 세션 목록 조회
  - `--limit <n>` - 표시할 최대 세션 수 (기본값: 50)
  - `--date <YYYY-MM-DD>` - 날짜로 필터링
  - `--search <pattern>` - 세션 ID로 검색
- `load <id|alias>` - 세션 내용 로드
- `alias <id> <name>` - 세션 별칭 생성
- `alias --remove <name>` - 별칭 삭제
- `unalias <name>` - `--remove`와 동일
- `info <id|alias>` - 세션 통계 표시
- `aliases` - 모든 별칭 나열
- `help` - 이 도움말 표시

## 예시

```bash
# 모든 세션 나열
/sessions list

# 오늘 세션에 별칭 생성
/sessions alias 2026-02-01 today

# 별칭으로 세션 로드
/sessions load today

# 세션 정보 표시
/sessions info today

# 별칭 삭제
/sessions alias --remove today

# 모든 별칭 나열
/sessions aliases
```

## 참고사항

- 세션은 `~/.claude/sessions/`에 마크다운 파일로 저장됩니다
- 별칭은 `~/.claude/session-aliases.json`에 저장됩니다
- 세션 ID는 축약 가능합니다 (첫 4~8자로 보통 충분히 고유함)
- 자주 참조하는 세션에는 별칭 사용 권장
