---
name: regex-vs-llm-structured-text
description: 구조화된 텍스트 파싱 시 regex와 LLM 중 무엇을 선택할지에 대한 의사결정 프레임워크 — regex로 시작하고, 신뢰도가 낮은 엣지 케이스에만 LLM 추가.
origin: ECC
---

# 구조화된 텍스트 파싱: Regex vs LLM

구조화된 텍스트(퀴즈, 양식, 청구서, 문서) 파싱을 위한 실용적인 의사결정 프레임워크. 핵심 인사이트: regex는 95-98%의 케이스를 저렴하고 결정론적으로 처리합니다. 나머지 엣지 케이스에만 비용이 많이 드는 LLM 호출을 예약하세요.

## 활성화 시점

- 반복 패턴이 있는 구조화된 텍스트 파싱 (질문, 양식, 표)
- 텍스트 추출을 위해 regex와 LLM 중 선택
- 두 가지 방식을 결합한 하이브리드 파이프라인 구축
- 텍스트 처리에서 비용/정확도 트레이드오프 최적화

## 의사결정 프레임워크

```
텍스트 형식이 일관되고 반복적인가?
├── 예 (>90%가 패턴을 따름) → Regex로 시작
│   ├── Regex가 95%+ 처리 → 완료, LLM 불필요
│   └── Regex가 <95% 처리 → 엣지 케이스에만 LLM 추가
└── 아니요 (자유 형식, 매우 가변적) → LLM 직접 사용
```

## 아키텍처 패턴

```
소스 텍스트
    │
    ▼
[Regex 파서] ─── 구조 추출 (95-98% 정확도)
    │
    ▼
[텍스트 클리너] ─── 노이즈 제거 (마커, 페이지 번호, 아티팩트)
    │
    ▼
[신뢰도 채점기] ─── 신뢰도 낮은 추출 플래그 지정
    │
    ├── 높은 신뢰도 (≥0.95) → 직접 출력
    │
    └── 낮은 신뢰도 (<0.95) → [LLM 검증기] → 출력
```

## 구현

### 1. Regex 파서 (대부분 처리)

```python
import re
from dataclasses import dataclass

@dataclass(frozen=True)
class ParsedItem:
    id: str
    text: str
    choices: tuple[str, ...]
    answer: str
    confidence: float = 1.0

def parse_structured_text(content: str) -> list[ParsedItem]:
    """regex 패턴을 사용하여 구조화된 텍스트 파싱."""
    pattern = re.compile(
        r"(?P<id>\d+)\.\s*(?P<text>.+?)\n"
        r"(?P<choices>(?:[A-D]\..+?\n)+)"
        r"Answer:\s*(?P<answer>[A-D])",
        re.MULTILINE | re.DOTALL,
    )
    items = []
    for match in pattern.finditer(content):
        choices = tuple(
            c.strip() for c in re.findall(r"[A-D]\.\s*(.+)", match.group("choices"))
        )
        items.append(ParsedItem(
            id=match.group("id"),
            text=match.group("text").strip(),
            choices=choices,
            answer=match.group("answer"),
        ))
    return items
```

### 2. 신뢰도 채점

LLM 검토가 필요할 수 있는 항목 플래그 지정:

```python
@dataclass(frozen=True)
class ConfidenceFlag:
    item_id: str
    score: float
    reasons: tuple[str, ...]

def score_confidence(item: ParsedItem) -> ConfidenceFlag:
    """추출 신뢰도를 채점하고 문제를 플래그 지정."""
    reasons = []
    score = 1.0

    if len(item.choices) < 3:
        reasons.append("선택지_적음")
        score -= 0.3

    if not item.answer:
        reasons.append("답변_없음")
        score -= 0.5

    if len(item.text) < 10:
        reasons.append("텍스트_짧음")
        score -= 0.2

    return ConfidenceFlag(
        item_id=item.id,
        score=max(0.0, score),
        reasons=tuple(reasons),
    )

def identify_low_confidence(
    items: list[ParsedItem],
    threshold: float = 0.95,
) -> list[ConfidenceFlag]:
    """신뢰도 임계값 미만의 항목 반환."""
    flags = [score_confidence(item) for item in items]
    return [f for f in flags if f.score < threshold]
```

### 3. LLM 검증기 (엣지 케이스만)

```python
def validate_with_llm(
    item: ParsedItem,
    original_text: str,
    client,
) -> ParsedItem:
    """신뢰도 낮은 추출을 수정하기 위해 LLM 사용."""
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",  # 검증을 위한 가장 저렴한 모델
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": (
                f"이 텍스트에서 질문, 선택지, 답변을 추출하세요.\n\n"
                f"텍스트: {original_text}\n\n"
                f"현재 추출: {item}\n\n"
                f"필요하면 수정된 JSON을 반환하거나, 정확하면 'CORRECT'를 반환하세요."
            ),
        }],
    )
    # LLM 응답을 파싱하고 수정된 항목 반환...
    return corrected_item
```

### 4. 하이브리드 파이프라인

```python
def process_document(
    content: str,
    *,
    llm_client=None,
    confidence_threshold: float = 0.95,
) -> list[ParsedItem]:
    """전체 파이프라인: regex -> 신뢰도 확인 -> 엣지 케이스에 LLM."""
    # 1단계: Regex 추출 (95-98% 처리)
    items = parse_structured_text(content)

    # 2단계: 신뢰도 채점
    low_confidence = identify_low_confidence(items, confidence_threshold)

    if not low_confidence or llm_client is None:
        return items

    # 3단계: LLM 검증 (플래그된 항목만)
    low_conf_ids = {f.item_id for f in low_confidence}
    result = []
    for item in items:
        if item.id in low_conf_ids:
            result.append(validate_with_llm(item, content, llm_client))
        else:
            result.append(item)

    return result
```

## 실제 지표

프로덕션 퀴즈 파싱 파이프라인 (410개 항목) 기준:

| 지표 | 값 |
|--------|-------|
| Regex 성공률 | 98.0% |
| 낮은 신뢰도 항목 | 8개 (2.0%) |
| 필요한 LLM 호출 | ~5회 |
| 전체 LLM 대비 비용 절감 | ~95% |
| 테스트 커버리지 | 93% |

## 모범 사례

- **regex로 시작** — 불완전한 regex도 개선할 기준선을 제공합니다
- **신뢰도 채점 사용** — LLM 도움이 필요한 것을 프로그래밍적으로 식별
- **가장 저렴한 LLM 사용** — 검증에는 Haiku급 모델로 충분
- **파싱된 항목을 절대 변경하지 말 것** — 정리/검증 단계에서 새 인스턴스 반환
- **TDD가 파서에 잘 맞음** — 알려진 패턴에 대한 테스트를 먼저 작성하고, 그 다음 엣지 케이스
- **지표 로깅** (regex 성공률, LLM 호출 수) — 파이프라인 상태 추적

## 피해야 할 안티패턴

- regex가 95%+ 케이스를 처리하는데 모든 텍스트를 LLM으로 전송 (비싸고 느림)
- 자유 형식, 매우 가변적인 텍스트에 regex 사용 (여기서는 LLM이 더 나음)
- 신뢰도 채점 건너뛰고 regex가 "그냥 작동"하기를 바람
- 정리/검증 단계에서 파싱된 객체 변경
- 엣지 케이스 테스트 안 함 (잘못된 입력, 누락된 필드, 인코딩 문제)

## 사용 시기

- 퀴즈/시험 문제 파싱
- 양식 데이터 추출
- 청구서/영수증 처리
- 문서 구조 파싱 (헤더, 섹션, 표)
- 비용이 중요한 반복 패턴이 있는 모든 구조화된 텍스트
