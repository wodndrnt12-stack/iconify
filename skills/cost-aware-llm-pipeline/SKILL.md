---
name: cost-aware-llm-pipeline
description: LLM API 사용을 위한 비용 최적화 패턴 — 작업 복잡도에 따른 모델 라우팅, 예산 추적, 재시도 로직, 프롬프트 캐싱.
origin: ECC
---

# 비용 인식 LLM 파이프라인

품질을 유지하면서 LLM API 비용을 제어하는 패턴. 모델 라우팅, 예산 추적, 재시도 로직, 프롬프트 캐싱을 조합 가능한 파이프라인으로 통합합니다.

## 활성화 조건

- LLM API를 호출하는 애플리케이션 개발 시 (Claude, GPT 등)
- 다양한 복잡도를 가진 배치 항목 처리 시
- API 지출 예산 내에 머물러야 할 때
- 복잡한 작업의 품질을 희생하지 않고 비용 최적화 시

## 핵심 개념

### 1. 작업 복잡도에 따른 모델 라우팅

단순한 작업에는 더 저렴한 모델을 자동으로 선택하고, 비용이 큰 모델은 복잡한 작업을 위해 예약합니다.

```python
MODEL_SONNET = "claude-sonnet-4-6"
MODEL_HAIKU = "claude-haiku-4-5-20251001"

_SONNET_TEXT_THRESHOLD = 10_000  # 문자 수
_SONNET_ITEM_THRESHOLD = 30     # 항목 수

def select_model(
    text_length: int,
    item_count: int,
    force_model: str | None = None,
) -> str:
    """작업 복잡도에 따라 모델 선택."""
    if force_model is not None:
        return force_model
    if text_length >= _SONNET_TEXT_THRESHOLD or item_count >= _SONNET_ITEM_THRESHOLD:
        return MODEL_SONNET  # 복잡한 작업
    return MODEL_HAIKU  # 단순한 작업 (3-4배 저렴)
```

### 2. 불변 비용 추적

Frozen 데이터클래스로 누적 지출 추적. 각 API 호출은 새 트래커를 반환 — 상태를 절대 뮤테이션하지 않습니다.

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CostRecord:
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float

@dataclass(frozen=True, slots=True)
class CostTracker:
    budget_limit: float = 1.00
    records: tuple[CostRecord, ...] = ()

    def add(self, record: CostRecord) -> "CostTracker":
        """추가된 레코드로 새 트래커 반환 (self를 절대 뮤테이션하지 않음)."""
        return CostTracker(
            budget_limit=self.budget_limit,
            records=(*self.records, record),
        )

    @property
    def total_cost(self) -> float:
        return sum(r.cost_usd for r in self.records)

    @property
    def over_budget(self) -> bool:
        return self.total_cost > self.budget_limit
```

### 3. 좁은 재시도 로직

일시적 에러에만 재시도. 인증 또는 잘못된 요청 에러에서는 즉시 실패.

```python
from anthropic import (
    APIConnectionError,
    InternalServerError,
    RateLimitError,
)

_RETRYABLE_ERRORS = (APIConnectionError, RateLimitError, InternalServerError)
_MAX_RETRIES = 3

def call_with_retry(func, *, max_retries: int = _MAX_RETRIES):
    """일시적 에러에만 재시도, 나머지는 즉시 실패."""
    for attempt in range(max_retries):
        try:
            return func()
        except _RETRYABLE_ERRORS:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # 지수 백오프
    # AuthenticationError, BadRequestError 등 → 즉시 raise
```

### 4. 프롬프트 캐싱

긴 시스템 프롬프트를 캐싱하여 매 요청마다 재전송을 방지.

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},  # 이것을 캐시
            },
            {
                "type": "text",
                "text": user_input,  # 가변 부분
            },
        ],
    }
]
```

## 조합

네 가지 기법을 단일 파이프라인 함수로 결합:

```python
def process(text: str, config: Config, tracker: CostTracker) -> tuple[Result, CostTracker]:
    # 1. 모델 라우팅
    model = select_model(len(text), estimated_items, config.force_model)

    # 2. 예산 확인
    if tracker.over_budget:
        raise BudgetExceededError(tracker.total_cost, tracker.budget_limit)

    # 3. 재시도 + 캐싱으로 호출
    response = call_with_retry(lambda: client.messages.create(
        model=model,
        messages=build_cached_messages(system_prompt, text),
    ))

    # 4. 비용 추적 (불변)
    record = CostRecord(model=model, input_tokens=..., output_tokens=..., cost_usd=...)
    tracker = tracker.add(record)

    return parse_result(response), tracker
```

## 가격 참조 (2025-2026)

| 모델 | 입력 ($/백만 토큰) | 출력 ($/백만 토큰) | 상대 비용 |
|-------|---------------------|----------------------|---------------|
| Haiku 4.5 | $0.80 | $4.00 | 1x |
| Sonnet 4.6 | $3.00 | $15.00 | ~4x |
| Opus 4.5 | $15.00 | $75.00 | ~19x |

## 모범 사례

- **가장 저렴한 모델로 시작**하고 복잡도 임계값이 충족될 때만 비싼 모델로 라우팅
- 배치 처리 전에 **명시적 예산 한도를 설정** — 과잉 지출보다 일찍 실패
- 실제 데이터를 기반으로 임계값을 조정할 수 있도록 **모델 선택 결정을 로깅**
- 1024 토큰 이상의 시스템 프롬프트에는 **프롬프트 캐싱 사용** — 비용과 지연 시간 모두 절약
- **인증 또는 유효성 검사 에러에서는 절대 재시도하지 않음** — 일시적 실패만 (네트워크, 레이트 리밋, 서버 에러)

## 피해야 할 안티패턴

- 복잡도와 관계없이 모든 요청에 가장 비싼 모델 사용
- 모든 에러에서 재시도 (영구적 실패에서 예산 낭비)
- 비용 추적 상태 뮤테이션 (디버깅과 감사를 어렵게 만듦)
- 코드베이스 전체에 모델 이름 하드코딩 (상수 또는 설정 사용)
- 반복적인 시스템 프롬프트에서 프롬프트 캐싱 무시

## 사용 시점

- Claude, OpenAI 또는 유사한 LLM API를 호출하는 모든 애플리케이션
- 비용이 빠르게 누적되는 배치 처리 파이프라인
- 지능적 라우팅이 필요한 멀티 모델 아키텍처
- 예산 가드레일이 필요한 프로덕션 시스템
