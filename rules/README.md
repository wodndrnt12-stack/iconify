# Rules
## 구조

Rules는 **common** 레이어와 **언어별** 디렉토리로 구성된다:

```
rules/
├── common/          # 언어 무관 원칙 (항상 설치)
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── performance.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   └── security.md
├── typescript/      # TypeScript/JavaScript 특화
├── python/          # Python 특화
├── golang/          # Go 특화
└── swift/           # Swift 특화
```

- **common/**은 범용 원칙을 포함 — 언어 특화 코드 예시 없음.
- **언어 디렉토리**는 프레임워크 특화 패턴, 도구, 코드 예시로 공통 rules를 확장한다. 각 파일은 공통 대응 파일을 참조한다.

## 설치

### 옵션 1: 설치 스크립트 (권장)

```bash
# 공통 + 하나 이상의 언어별 rule 세트 설치
./install.sh typescript
./install.sh python
./install.sh golang
./install.sh swift

# 여러 언어 동시 설치
./install.sh typescript python
```

### 옵션 2: 수동 설치

> **중요:** 전체 디렉토리를 복사 — `/*`로 단순화하지 않는다.
> common과 언어별 디렉토리는 동일한 이름의 파일을 포함한다.
> 하나의 디렉토리로 단순화하면 언어별 파일이 공통 rules를 덮어쓰고,
> 언어별 파일에서 사용하는 `../common/` 상대 참조가 깨진다.

```bash
# 공통 rules 설치 (모든 프로젝트에 필수)
cp -r rules/common ~/.claude/rules/common

# 프로젝트 기술 스택에 따라 언어별 rules 설치
cp -r rules/typescript ~/.claude/rules/typescript
cp -r rules/python ~/.claude/rules/python
cp -r rules/golang ~/.claude/rules/golang
cp -r rules/swift ~/.claude/rules/swift

# 주의 ! ! ! 실제 프로젝트 요구사항에 맞게 설정하라; 여기 설정은 참고용일 뿐이다.
```

## Rules vs Skills

- **Rules**는 광범위하게 적용되는 표준, 규칙, 체크리스트를 정의한다 (예: "80% 테스트 커버리지", "시크릿 하드코딩 금지").
- **Skills** (`skills/` 디렉토리)는 특정 태스크를 위한 심층적이고 실행 가능한 참조 자료를 제공한다 (예: `python-patterns`, `golang-testing`).

언어별 rule 파일은 적절한 경우 관련 skill을 참조한다. Rules는 *무엇을* 해야 하는지를 알려주고, skills는 *어떻게* 하는지를 알려준다.

## 새 언어 추가

새 언어 지원 추가 방법 (예: `rust/`):

1. `rules/rust/` 디렉토리 생성
2. 공통 rules를 확장하는 파일 추가:
   - `coding-style.md` — 포맷팅 도구, 관용구, 오류 처리 패턴
   - `testing.md` — 테스트 프레임워크, 커버리지 도구, 테스트 구성
   - `patterns.md` — 언어별 디자인 패턴
   - `hooks.md` — 포맷터, 린터, 타입 검사기를 위한 PostToolUse 훅
   - `security.md` — 시크릿 관리, 보안 스캐닝 도구
3. 각 파일은 다음으로 시작해야 한다:
   ```
   > 이 파일은 [common/xxx.md](../common/xxx.md)를 <Language> 특화 내용으로 확장한다.
   ```
4. 가능한 경우 기존 skill 참조, 없으면 `skills/` 아래 새 skill 생성.

## Rule 우선순위

언어별 rules와 공통 rules가 충돌하는 경우 **언어별 rules가 우선**한다 (구체적인 것이 일반적인 것을 재정의). 이는 표준 계층형 설정 패턴을 따른다 (CSS 특이성 또는 `.gitignore` 우선순위와 유사).

- `rules/common/`은 모든 프로젝트에 적용되는 범용 기본값을 정의한다.
- `rules/golang/`, `rules/python/`, `rules/typescript/` 등은 언어 관용구가 다른 경우 해당 기본값을 재정의한다.

### 예시

`common/coding-style.md`는 기본 원칙으로 불변성을 권장한다. 언어별 `golang/coding-style.md`는 이를 재정의할 수 있다:

> Go 관용적 코드는 구조체 변경을 위해 포인터 수신자를 사용 — 일반 원칙은 [common/coding-style.md](../common/coding-style.md)를 참조하되, 여기서는 Go 관용적 변경이 선호됨.

### 재정의 가능한 공통 rules 참고사항

`rules/common/`의 rules 중 언어별 파일로 재정의될 수 있는 것은 다음과 같이 표시됨:

> **언어 참고**: 이 패턴이 관용적이지 않은 언어의 경우 언어별 rules로 재정의될 수 있다.
