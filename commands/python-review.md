---
description: PEP 8 준수, 타입 힌트, 보안, Pythonic 관용구에 대한 포괄적인 Python 코드 리뷰. python-reviewer 에이전트를 호출합니다.
---

# Python 코드 리뷰

이 명령어는 Python 특화 포괄적 코드 리뷰를 위해 **python-reviewer** 에이전트를 호출합니다.

## 이 명령어가 하는 일

1. **Python 변경사항 파악**: `git diff`로 수정된 `.py` 파일 탐색
2. **정적 분석 실행**: `ruff`, `mypy`, `pylint`, `black --check` 실행
3. **보안 스캔**: SQL 인젝션, 커맨드 인젝션, 안전하지 않은 역직렬화 확인
4. **타입 안전성 리뷰**: 타입 힌트와 mypy 오류 분석
5. **Pythonic 코드 확인**: PEP 8 및 Python 모범 사례 준수 여부 검증
6. **보고서 생성**: 심각도별 이슈 분류

## 사용 시기

다음 경우에 `/python-review` 사용:
- Python 코드 작성 또는 수정 후
- Python 변경사항 커밋 전
- Python 코드가 포함된 풀 리퀘스트 리뷰 시
- 새로운 Python 코드베이스에 온보딩 시
- Pythonic 패턴과 관용구 학습 시

## 리뷰 카테고리

### 치명적 (반드시 수정)
- SQL/커맨드 인젝션 취약점
- 안전하지 않은 eval/exec 사용
- Pickle 안전하지 않은 역직렬화
- 하드코딩된 자격증명
- YAML 안전하지 않은 로드
- 오류를 숨기는 bare except 구문

### 높음 (수정 권장)
- 공개 함수의 타입 힌트 누락
- 가변 기본 인수
- 예외를 조용히 삼키기
- 리소스에 컨텍스트 매니저 미사용
- 컴프리헨션 대신 C 스타일 루프
- isinstance() 대신 type() 사용
- 락 없는 경쟁 조건

### 중간 (검토 권장)
- PEP 8 형식 위반
- 공개 함수의 docstring 누락
- 로깅 대신 print 문 사용
- 비효율적인 문자열 연산
- 이름 없는 상수(매직 넘버)
- 형식 지정에 f-string 미사용
- 불필요한 리스트 생성

## 실행되는 자동화 검사

```bash
# 타입 검사
mypy .

# 린팅 및 형식 검사
ruff check .
black --check .
isort --check-only .

# 보안 스캔
bandit -r .

# 의존성 감사
pip-audit
safety check

# 테스트
pytest --cov=app --cov-report=term-missing
```

## 사용 예시

```text
사용자: /python-review

에이전트:
# Python 코드 리뷰 보고서

## 리뷰된 파일
- app/routes/user.py (수정됨)
- app/services/auth.py (수정됨)

## 정적 분석 결과
✓ ruff: 이슈 없음
✓ mypy: 오류 없음
⚠️ black: 파일 2개 재형식화 필요
✓ bandit: 보안 이슈 없음

## 발견된 이슈

[치명적] SQL 인젝션 취약점
파일: app/routes/user.py:42
이슈: 사용자 입력이 SQL 쿼리에 직접 삽입됨
```python
query = f"SELECT * FROM users WHERE id = {user_id}"  # 나쁜 예
```
수정: 파라미터화된 쿼리 사용
```python
query = "SELECT * FROM users WHERE id = %s"  # 좋은 예
cursor.execute(query, (user_id,))
```

[높음] 가변 기본 인수
파일: app/services/auth.py:18
이슈: 가변 기본 인수로 인한 공유 상태 발생
```python
def process_items(items=[]):  # 나쁜 예
    items.append("new")
    return items
```
수정: None을 기본값으로 사용
```python
def process_items(items=None):  # 좋은 예
    if items is None:
        items = []
    items.append("new")
    return items
```

[중간] 타입 힌트 누락
파일: app/services/auth.py:25
이슈: 타입 어노테이션 없는 공개 함수
```python
def get_user(user_id):  # 나쁜 예
    return db.find(user_id)
```
수정: 타입 힌트 추가
```python
def get_user(user_id: str) -> Optional[User]:  # 좋은 예
    return db.find(user_id)
```

[중간] 컨텍스트 매니저 미사용
파일: app/routes/user.py:55
이슈: 예외 발생 시 파일이 닫히지 않음
```python
f = open("config.json")  # 나쁜 예
data = f.read()
f.close()
```
수정: 컨텍스트 매니저 사용
```python
with open("config.json") as f:  # 좋은 예
    data = f.read()
```

## 요약
- 치명적: 1
- 높음: 1
- 중간: 2

권고사항: ❌ 치명적 이슈 수정 전까지 병합 차단

## 형식화 필요
실행: `black app/routes/user.py app/services/auth.py`
```

## 승인 기준

| 상태 | 조건 |
|------|------|
| ✅ 승인 | 치명적 또는 높음 이슈 없음 |
| ⚠️ 경고 | 중간 이슈만 있음 (주의하여 병합) |
| ❌ 차단 | 치명적 또는 높음 이슈 발견 |

## 다른 명령어와의 통합

- 테스트 통과 확인을 위해 먼저 `/tdd` 사용
- Python 비특화 우려사항은 `/code-review` 사용
- 커밋 전 `/python-review` 사용
- 정적 분석 도구 실패 시 `/build-fix` 사용

## 프레임워크별 리뷰

### Django 프로젝트
리뷰어가 확인하는 항목:
- N+1 쿼리 문제 (`select_related` 및 `prefetch_related` 사용 권장)
- 모델 변경에 대한 누락된 마이그레이션
- ORM으로 처리 가능한 경우의 Raw SQL 사용
- 다단계 작업에서 `transaction.atomic()` 누락

### FastAPI 프로젝트
리뷰어가 확인하는 항목:
- CORS 잘못된 설정
- 요청 검증을 위한 Pydantic 모델
- 응답 모델 정확성
- 적절한 async/await 사용
- 의존성 주입 패턴

### Flask 프로젝트
리뷰어가 확인하는 항목:
- 컨텍스트 관리 (앱 컨텍스트, 요청 컨텍스트)
- 적절한 오류 처리
- Blueprint 구성
- 설정 관리

## 관련

- 에이전트: `agents/python-reviewer.md`
- 스킬: `skills/python-patterns/`, `skills/python-testing/`

## 일반적인 수정 방법

### 타입 힌트 추가
```python
# 이전
def calculate(x, y):
    return x + y

# 이후
from typing import Union

def calculate(x: Union[int, float], y: Union[int, float]) -> Union[int, float]:
    return x + y
```

### 컨텍스트 매니저 사용
```python
# 이전
f = open("file.txt")
data = f.read()
f.close()

# 이후
with open("file.txt") as f:
    data = f.read()
```

### 리스트 컴프리헨션 사용
```python
# 이전
result = []
for item in items:
    if item.active:
        result.append(item.name)

# 이후
result = [item.name for item in items if item.active]
```

### 가변 기본값 수정
```python
# 이전
def append(value, items=[]):
    items.append(value)
    return items

# 이후
def append(value, items=None):
    if items is None:
        items = []
    items.append(value)
    return items
```

### f-string 사용 (Python 3.6+)
```python
# 이전
name = "Alice"
greeting = "Hello, " + name + "!"
greeting2 = "Hello, {}".format(name)

# 이후
greeting = f"Hello, {name}!"
```

### 루프 내 문자열 연결 수정
```python
# 이전
result = ""
for item in items:
    result += str(item)

# 이후
result = "".join(str(item) for item in items)
```

## Python 버전 호환성

리뷰어는 최신 Python 버전의 기능을 사용하는 코드를 표시합니다:

| 기능 | 최소 Python |
|------|-------------|
| 타입 힌트 | 3.5+ |
| f-string | 3.6+ |
| 왈러스 연산자 (`:=`) | 3.8+ |
| 위치 전용 파라미터 | 3.8+ |
| match 문 | 3.10+ |
| 타입 유니온 (&#96;x &#124; None&#96;) | 3.10+ |

프로젝트의 `pyproject.toml` 또는 `setup.py`에 올바른 최소 Python 버전이 지정되어 있는지 확인하세요.
