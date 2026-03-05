---
name: security-scan
description: AgentShield를 사용하여 Claude Code 구성(.claude/ 디렉토리)의 보안 취약점, 잘못된 구성, 인젝션 위험을 검사합니다. CLAUDE.md, settings.json, MCP 서버, 훅, 에이전트 정의를 확인합니다.
origin: ECC
---

# 보안 스캔 Skill

[AgentShield](https://github.com/affaan-m/agentshield)를 사용하여 Claude Code 구성의 보안 문제를 감사합니다.

## 활성화 시점

- 새 Claude Code 프로젝트 설정 시
- `.claude/settings.json`, `CLAUDE.md`, 또는 MCP 구성 수정 후
- 구성 변경 사항 커밋 전
- 기존 Claude Code 구성이 있는 새 저장소 온보딩 시
- 정기적인 보안 위생 점검 시

## 스캔 대상

| 파일 | 검사 항목 |
|------|--------|
| `CLAUDE.md` | 하드코딩된 시크릿, 자동 실행 지침, 프롬프트 인젝션 패턴 |
| `settings.json` | 과도하게 허용적인 허용 목록, 누락된 거부 목록, 위험한 우회 플래그 |
| `mcp.json` | 위험한 MCP 서버, 하드코딩된 환경 시크릿, npx 공급망 위험 |
| `hooks/` | 보간을 통한 명령 인젝션, 데이터 유출, 자동 오류 억제 |
| `agents/*.md` | 무제한 도구 접근, 프롬프트 인젝션 표면, 누락된 모델 사양 |

## 사전 요구 사항

AgentShield가 설치되어 있어야 합니다. 확인 및 필요 시 설치:

```bash
# Check if installed
npx ecc-agentshield --version

# Install globally (recommended)
npm install -g ecc-agentshield

# Or run directly via npx (no install needed)
npx ecc-agentshield scan .
```

## 사용법

### 기본 스캔

현재 프로젝트의 `.claude/` 디렉토리에 대해 실행:

```bash
# Scan current project
npx ecc-agentshield scan

# Scan a specific path
npx ecc-agentshield scan --path /path/to/.claude

# Scan with minimum severity filter
npx ecc-agentshield scan --min-severity medium
```

### 출력 형식

```bash
# Terminal output (default) — colored report with grade
npx ecc-agentshield scan

# JSON — for CI/CD integration
npx ecc-agentshield scan --format json

# Markdown — for documentation
npx ecc-agentshield scan --format markdown

# HTML — self-contained dark-theme report
npx ecc-agentshield scan --format html > security-report.html
```

### 자동 수정

안전한 수정 사항 자동 적용(자동 수정 가능으로 표시된 항목만 수정):

```bash
npx ecc-agentshield scan --fix
```

수행 내용:
- 하드코딩된 시크릿을 환경 변수 참조로 교체
- 와일드카드 권한을 범위가 지정된 대안으로 강화
- 수동 전용 제안 사항은 수정하지 않음

### Opus 4.6 심층 분석

더 깊은 분석을 위한 적대적 3-에이전트 파이프라인 실행:

```bash
# Requires ANTHROPIC_API_KEY
export ANTHROPIC_API_KEY=your-key
npx ecc-agentshield scan --opus --stream
```

실행 순서:
1. **공격자(Red Team)** — 공격 벡터 탐색
2. **방어자(Blue Team)** — 강화 권장 사항 제시
3. **감사자(최종 평결)** — 양쪽 관점 종합

### 보안 구성 초기화

새로운 보안 `.claude/` 구성을 처음부터 스캐폴딩:

```bash
npx ecc-agentshield init
```

생성 항목:
- 범위가 지정된 권한 및 거부 목록이 있는 `settings.json`
- 보안 모범 사례가 포함된 `CLAUDE.md`
- `mcp.json` 플레이스홀더

### GitHub Action

CI 파이프라인에 추가:

```yaml
- uses: affaan-m/agentshield@v1
  with:
    path: '.'
    min-severity: 'medium'
    fail-on-findings: true
```

## 심각도 수준

| 등급 | 점수 | 의미 |
|-------|-------|---------|
| A | 90-100 | 안전한 구성 |
| B | 75-89 | 경미한 문제 |
| C | 60-74 | 주의 필요 |
| D | 40-59 | 심각한 위험 |
| F | 0-39 | 치명적 취약점 |

## 결과 해석

### 치명적 발견 사항 (즉시 수정)
- 구성 파일의 하드코딩된 API 키 또는 토큰
- 허용 목록의 `Bash(*)` (무제한 셸 접근)
- `${file}` 보간을 통한 훅의 명령 인젝션
- 셸 실행 MCP 서버

### 높은 위험 발견 사항 (프로덕션 전 수정)
- CLAUDE.md의 자동 실행 지침(프롬프트 인젝션 벡터)
- 권한에 거부 목록 누락
- 불필요한 Bash 접근 권한이 있는 에이전트

### 중간 위험 발견 사항 (권장)
- 훅의 자동 오류 억제 (`2>/dev/null`, `|| true`)
- PreToolUse 보안 훅 누락
- MCP 서버 구성의 `npx -y` 자동 설치

### 정보성 발견 사항 (인식)
- MCP 서버의 설명 누락
- 모범 사례로 올바르게 표시된 금지 지침

## 링크

- **GitHub**: [github.com/affaan-m/agentshield](https://github.com/affaan-m/agentshield)
- **npm**: [npmjs.com/package/ecc-agentshield](https://www.npmjs.com/package/ecc-agentshield)
