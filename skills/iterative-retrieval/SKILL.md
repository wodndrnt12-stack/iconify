---
name: iterative-retrieval
description: 서브에이전트 컨텍스트 문제를 해결하기 위해 컨텍스트 검색을 점진적으로 정제하는 패턴
origin: ECC
---

# 반복적 검색 패턴

서브에이전트가 작업을 시작하기 전까지 어떤 컨텍스트가 필요한지 알 수 없는 멀티 에이전트 워크플로우의 "컨텍스트 문제"를 해결합니다.

## 활성화 시점

- 미리 예측할 수 없는 코드베이스 컨텍스트가 필요한 서브에이전트를 생성할 때
- 컨텍스트가 점진적으로 정제되는 멀티 에이전트 워크플로우를 구축할 때
- 에이전트 작업에서 "컨텍스트 초과" 또는 "컨텍스트 누락" 실패를 만날 때
- 코드 탐색을 위한 RAG 유사 검색 파이프라인을 설계할 때
- 에이전트 오케스트레이션에서 토큰 사용량을 최적화할 때

## 문제

서브에이전트는 제한된 컨텍스트로 생성됩니다. 이들은 다음을 모릅니다:
- 관련 코드가 어느 파일에 있는지
- 코드베이스에 어떤 패턴이 있는지
- 프로젝트에서 어떤 용어를 사용하는지

표준적인 접근 방식은 실패합니다:
- **전부 전송**: 컨텍스트 한계 초과
- **아무것도 전송 안 함**: 에이전트가 중요한 정보 부재
- **필요한 것을 추측**: 종종 틀림

## 해결책: 반복적 검색

컨텍스트를 점진적으로 정제하는 4단계 루프:

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────┐      ┌──────────┐            │
│   │ 발송(DISPATCH) │─────▶│ 평가(EVALUATE) │            │
│   └──────────┘      └──────────┘            │
│        ▲                  │                 │
│        │                  ▼                 │
│   ┌──────────┐      ┌──────────┐            │
│   │   반복(LOOP)   │◀─────│  정제(REFINE)  │            │
│   └──────────┘      └──────────┘            │
│                                             │
│        최대 3사이클, 이후 진행           │
└─────────────────────────────────────────────┘
```

### 1단계: 발송(DISPATCH)

후보 파일 수집을 위한 초기 광범위 쿼리:

```javascript
// 고수준 의도로 시작
const initialQuery = {
  patterns: ['src/**/*.ts', 'lib/**/*.ts'],
  keywords: ['authentication', 'user', 'session'],
  excludes: ['*.test.ts', '*.spec.ts']
};

// 검색 에이전트에 발송
const candidates = await retrieveFiles(initialQuery);
```

### 2단계: 평가(EVALUATE)

검색된 내용의 관련성 평가:

```javascript
function evaluateRelevance(files, task) {
  return files.map(file => ({
    path: file.path,
    relevance: scoreRelevance(file.content, task),
    reason: explainRelevance(file.content, task),
    missingContext: identifyGaps(file.content, task)
  }));
}
```

점수 기준:
- **높음 (0.8-1.0)**: 목표 기능을 직접 구현
- **중간 (0.5-0.7)**: 관련 패턴 또는 타입 포함
- **낮음 (0.2-0.4)**: 간접적으로 관련
- **없음 (0-0.2)**: 관련 없음, 제외

### 3단계: 정제(REFINE)

평가를 바탕으로 검색 기준 업데이트:

```javascript
function refineQuery(evaluation, previousQuery) {
  return {
    // 높은 관련성 파일에서 발견된 새 패턴 추가
    patterns: [...previousQuery.patterns, ...extractPatterns(evaluation)],

    // 코드베이스에서 발견된 용어 추가
    keywords: [...previousQuery.keywords, ...extractKeywords(evaluation)],

    // 확인된 무관한 경로 제외
    excludes: [...previousQuery.excludes, ...evaluation
      .filter(e => e.relevance < 0.2)
      .map(e => e.path)
    ],

    // 특정 누락 부분 타겟팅
    focusAreas: evaluation
      .flatMap(e => e.missingContext)
      .filter(unique)
  };
}
```

### 4단계: 반복(LOOP)

정제된 기준으로 반복 (최대 3사이클):

```javascript
async function iterativeRetrieve(task, maxCycles = 3) {
  let query = createInitialQuery(task);
  let bestContext = [];

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const candidates = await retrieveFiles(query);
    const evaluation = evaluateRelevance(candidates, task);

    // 충분한 컨텍스트가 있는지 확인
    const highRelevance = evaluation.filter(e => e.relevance >= 0.7);
    if (highRelevance.length >= 3 && !hasCriticalGaps(evaluation)) {
      return highRelevance;
    }

    // 정제 후 계속
    query = refineQuery(evaluation, query);
    bestContext = mergeContext(bestContext, highRelevance);
  }

  return bestContext;
}
```

## 실제 예시

### 예시 1: 버그 수정 컨텍스트

```
작업: "인증 토큰 만료 버그 수정"

사이클 1:
  발송: src/**에서 "token", "auth", "expiry" 검색
  평가: auth.ts (0.9), tokens.ts (0.8), user.ts (0.3) 발견
  정제: "refresh", "jwt" 키워드 추가; user.ts 제외

사이클 2:
  발송: 정제된 용어 검색
  평가: session-manager.ts (0.95), jwt-utils.ts (0.85) 발견
  정제: 충분한 컨텍스트 (높은 관련성 파일 2개)

결과: auth.ts, tokens.ts, session-manager.ts, jwt-utils.ts
```

### 예시 2: 기능 구현

```
작업: "API 엔드포인트에 속도 제한 추가"

사이클 1:
  발송: routes/**에서 "rate", "limit", "api" 검색
  평가: 매칭 없음 - 코드베이스가 "throttle" 용어 사용
  정제: "throttle", "middleware" 키워드 추가

사이클 2:
  발송: 정제된 용어 검색
  평가: throttle.ts (0.9), middleware/index.ts (0.7) 발견
  정제: 라우터 패턴 필요

사이클 3:
  발송: "router", "express" 패턴 검색
  평가: router-setup.ts (0.8) 발견
  정제: 충분한 컨텍스트

결과: throttle.ts, middleware/index.ts, router-setup.ts
```

## 에이전트와의 통합

에이전트 프롬프트에서 사용:

```markdown
이 작업의 컨텍스트를 검색할 때:
1. 광범위한 키워드 검색으로 시작
2. 각 파일의 관련성 평가 (0-1 척도)
3. 여전히 누락된 컨텍스트 파악
4. 검색 기준 정제 후 반복 (최대 3사이클)
5. 관련성 >= 0.7 파일 반환
```

## 모범 사례

1. **넓게 시작하고 점진적으로 좁힘** - 초기 쿼리를 지나치게 구체화하지 않음
2. **코드베이스 용어 학습** - 첫 번째 사이클에서 명명 규칙이 드러남
3. **누락된 것 추적** - 명시적인 갭 파악이 정제를 이끔
4. **"충분히 좋은" 수준에서 멈춤** - 높은 관련성 파일 3개가 평범한 파일 10개보다 나음
5. **확신을 가지고 제외** - 낮은 관련성 파일은 관련성이 생기지 않음

## 관련

- [롱폼 가이드](https://x.com/affaanmustafa/status/2014040193557471352) - 서브에이전트 오케스트레이션 섹션
- `continuous-learning` 스킬 - 시간이 지남에 따라 개선되는 패턴용
- `~/.claude/agents/`의 에이전트 정의
