---
name: python-testing
description: pytest, TDD 방법론, 픽스처, 모킹, 매개변수화, 커버리지 요구사항을 사용한 Python 테스트 전략.
origin: ECC
---

# Python 테스트 패턴

pytest, TDD 방법론, 모범 사례를 사용한 Python 애플리케이션을 위한 포괄적인 테스트 전략.

## 활성화 시점

- 새 Python 코드 작성 (TDD 따르기: 빨강, 초록, 리팩토링)
- Python 프로젝트를 위한 테스트 스위트 설계
- Python 테스트 커버리지 검토
- 테스트 인프라 설정

## 핵심 테스트 철학

### 테스트 주도 개발 (TDD)

항상 TDD 사이클을 따르세요:

1. **빨강**: 원하는 동작에 대한 실패하는 테스트 작성
2. **초록**: 테스트를 통과하는 최소한의 코드 작성
3. **리팩토링**: 테스트를 초록으로 유지하면서 코드 개선

```python
# 1단계: 실패하는 테스트 작성 (빨강)
def test_add_numbers():
    result = add(2, 3)
    assert result == 5

# 2단계: 최소한의 구현 작성 (초록)
def add(a, b):
    return a + b

# 3단계: 필요하면 리팩토링 (리팩토링)
```

### 커버리지 요구사항

- **목표**: 80%+ 코드 커버리지
- **중요 경로**: 100% 커버리지 필수
- 커버리지 측정에 `pytest --cov` 사용

```bash
pytest --cov=mypackage --cov-report=term-missing --cov-report=html
```

## pytest 기초

### 기본 테스트 구조

```python
import pytest

def test_addition():
    """기본 덧셈 테스트."""
    assert 2 + 2 == 4

def test_string_uppercase():
    """문자열 대문자 변환 테스트."""
    text = "hello"
    assert text.upper() == "HELLO"

def test_list_append():
    """리스트 추가 테스트."""
    items = [1, 2, 3]
    items.append(4)
    assert 4 in items
    assert len(items) == 4
```

### 어설션

```python
# 동등성
assert result == expected

# 부동등성
assert result != unexpected

# 참/거짓
assert result  # 참
assert not result  # 거짓
assert result is True  # 정확히 True
assert result is False  # 정확히 False
assert result is None  # 정확히 None

# 포함 여부
assert item in collection
assert item not in collection

# 비교
assert result > 0
assert 0 <= result <= 100

# 타입 확인
assert isinstance(result, str)

# 예외 테스트 (권장 방법)
with pytest.raises(ValueError):
    raise ValueError("오류 메시지")

# 예외 메시지 확인
with pytest.raises(ValueError, match="잘못된 입력"):
    raise ValueError("잘못된 입력이 제공됨")

# 예외 속성 확인
with pytest.raises(ValueError) as exc_info:
    raise ValueError("오류 메시지")
assert str(exc_info.value) == "오류 메시지"
```

## 픽스처

### 기본 픽스처 사용

```python
import pytest

@pytest.fixture
def sample_data():
    """샘플 데이터를 제공하는 픽스처."""
    return {"name": "Alice", "age": 30}

def test_sample_data(sample_data):
    """픽스처를 사용하는 테스트."""
    assert sample_data["name"] == "Alice"
    assert sample_data["age"] == 30
```

### 설정/해제가 있는 픽스처

```python
@pytest.fixture
def database():
    """설정 및 해제가 있는 픽스처."""
    # 설정
    db = Database(":memory:")
    db.create_tables()
    db.insert_test_data()

    yield db  # 테스트에 제공

    # 해제
    db.close()

def test_database_query(database):
    """데이터베이스 작업 테스트."""
    result = database.query("SELECT * FROM users")
    assert len(result) > 0
```

### 픽스처 스코프

```python
# 함수 스코프 (기본값) - 각 테스트마다 실행
@pytest.fixture
def temp_file():
    with open("temp.txt", "w") as f:
        yield f
    os.remove("temp.txt")

# 모듈 스코프 - 모듈당 한 번 실행
@pytest.fixture(scope="module")
def module_db():
    db = Database(":memory:")
    db.create_tables()
    yield db
    db.close()

# 세션 스코프 - 테스트 세션당 한 번 실행
@pytest.fixture(scope="session")
def shared_resource():
    resource = ExpensiveResource()
    yield resource
    resource.cleanup()
```

### 매개변수가 있는 픽스처

```python
@pytest.fixture(params=[1, 2, 3])
def number(request):
    """매개변수화된 픽스처."""
    return request.param

def test_numbers(number):
    """각 매개변수마다 3번 실행되는 테스트."""
    assert number > 0
```

### 여러 픽스처 사용

```python
@pytest.fixture
def user():
    return User(id=1, name="Alice")

@pytest.fixture
def admin():
    return User(id=2, name="Admin", role="admin")

def test_user_admin_interaction(user, admin):
    """여러 픽스처를 사용하는 테스트."""
    assert admin.can_manage(user)
```

### Autouse 픽스처

```python
@pytest.fixture(autouse=True)
def reset_config():
    """모든 테스트 전에 자동으로 실행."""
    Config.reset()
    yield
    Config.cleanup()

def test_without_fixture_call():
    # reset_config가 자동으로 실행됨
    assert Config.get_setting("debug") is False
```

### 공유 픽스처를 위한 Conftest.py

```python
# tests/conftest.py
import pytest

@pytest.fixture
def client():
    """모든 테스트를 위한 공유 픽스처."""
    app = create_app(testing=True)
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_headers(client):
    """API 테스트를 위한 인증 헤더 생성."""
    response = client.post("/api/login", json={
        "username": "test",
        "password": "test"
    })
    token = response.json["token"]
    return {"Authorization": f"Bearer {token}"}
```

## 매개변수화

### 기본 매개변수화

```python
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("world", "WORLD"),
    ("PyThOn", "PYTHON"),
])
def test_uppercase(input, expected):
    """다른 입력으로 3번 실행되는 테스트."""
    assert input.upper() == expected
```

### 여러 매개변수

```python
@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add(a, b, expected):
    """여러 입력으로 덧셈 테스트."""
    assert add(a, b) == expected
```

### ID가 있는 매개변수화

```python
@pytest.mark.parametrize("input,expected", [
    ("valid@email.com", True),
    ("invalid", False),
    ("@no-domain.com", False),
], ids=["유효한-이메일", "골뱅이-없음", "도메인-없음"])
def test_email_validation(input, expected):
    """읽기 쉬운 테스트 ID로 이메일 유효성 검사 테스트."""
    assert is_valid_email(input) is expected
```

### 매개변수화된 픽스처

```python
@pytest.fixture(params=["sqlite", "postgresql", "mysql"])
def db(request):
    """여러 데이터베이스 백엔드에 대한 테스트."""
    if request.param == "sqlite":
        return Database(":memory:")
    elif request.param == "postgresql":
        return Database("postgresql://localhost/test")
    elif request.param == "mysql":
        return Database("mysql://localhost/test")

def test_database_operations(db):
    """각 데이터베이스마다 3번 실행되는 테스트."""
    result = db.query("SELECT 1")
    assert result is not None
```

## 마커 및 테스트 선택

### 커스텀 마커

```python
# 느린 테스트 표시
@pytest.mark.slow
def test_slow_operation():
    time.sleep(5)

# 통합 테스트 표시
@pytest.mark.integration
def test_api_integration():
    response = requests.get("https://api.example.com")
    assert response.status_code == 200

# 단위 테스트 표시
@pytest.mark.unit
def test_unit_logic():
    assert calculate(2, 3) == 5
```

### 특정 테스트 실행

```bash
# 빠른 테스트만 실행
pytest -m "not slow"

# 통합 테스트만 실행
pytest -m integration

# 통합 또는 느린 테스트 실행
pytest -m "integration or slow"

# 단위이지만 느리지 않은 테스트 실행
pytest -m "unit and not slow"
```

### pytest.ini에서 마커 설정

```ini
[pytest]
markers =
    slow: 느린 테스트로 표시
    integration: 통합 테스트로 표시
    unit: 단위 테스트로 표시
    django: Django가 필요한 테스트로 표시
```

## 모킹 및 패치

### 함수 모킹

```python
from unittest.mock import patch, Mock

@patch("mypackage.external_api_call")
def test_with_mock(api_call_mock):
    """모킹된 외부 API로 테스트."""
    api_call_mock.return_value = {"status": "success"}

    result = my_function()

    api_call_mock.assert_called_once()
    assert result["status"] == "success"
```

### 반환값 모킹

```python
@patch("mypackage.Database.connect")
def test_database_connection(connect_mock):
    """모킹된 데이터베이스 연결로 테스트."""
    connect_mock.return_value = MockConnection()

    db = Database()
    db.connect()

    connect_mock.assert_called_once_with("localhost")
```

### 예외 모킹

```python
@patch("mypackage.api_call")
def test_api_error_handling(api_call_mock):
    """모킹된 예외로 오류 처리 테스트."""
    api_call_mock.side_effect = ConnectionError("네트워크 오류")

    with pytest.raises(ConnectionError):
        api_call()

    api_call_mock.assert_called_once()
```

### 컨텍스트 매니저 모킹

```python
@patch("builtins.open", new_callable=mock_open)
def test_file_reading(mock_file):
    """모킹된 open으로 파일 읽기 테스트."""
    mock_file.return_value.read.return_value = "파일 내용"

    result = read_file("test.txt")

    mock_file.assert_called_once_with("test.txt", "r")
    assert result == "파일 내용"
```

### Autospec 사용

```python
@patch("mypackage.DBConnection", autospec=True)
def test_autospec(db_mock):
    """API 오용을 포착하기 위한 autospec으로 테스트."""
    db = db_mock.return_value
    db.query("SELECT * FROM users")

    # DBConnection에 query 메서드가 없으면 실패
    db_mock.assert_called_once()
```

### Mock 클래스 인스턴스

```python
class TestUserService:
    @patch("mypackage.UserRepository")
    def test_create_user(self, repo_mock):
        """모킹된 저장소로 사용자 생성 테스트."""
        repo_mock.return_value.save.return_value = User(id=1, name="Alice")

        service = UserService(repo_mock.return_value)
        user = service.create_user(name="Alice")

        assert user.name == "Alice"
        repo_mock.return_value.save.assert_called_once()
```

### Mock 프로퍼티

```python
@pytest.fixture
def mock_config():
    """프로퍼티가 있는 mock 생성."""
    config = Mock()
    type(config).debug = PropertyMock(return_value=True)
    type(config).api_key = PropertyMock(return_value="test-key")
    return config

def test_with_mock_config(mock_config):
    """모킹된 설정 프로퍼티로 테스트."""
    assert mock_config.debug is True
    assert mock_config.api_key == "test-key"
```

## 비동기 코드 테스트

### pytest-asyncio를 사용한 비동기 테스트

```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    """비동기 함수 테스트."""
    result = await async_add(2, 3)
    assert result == 5

@pytest.mark.asyncio
async def test_async_with_fixture(async_client):
    """비동기 픽스처로 테스트."""
    response = await async_client.get("/api/users")
    assert response.status_code == 200
```

### 비동기 픽스처

```python
@pytest.fixture
async def async_client():
    """비동기 테스트 클라이언트를 제공하는 비동기 픽스처."""
    app = create_app()
    async with app.test_client() as client:
        yield client

@pytest.mark.asyncio
async def test_api_endpoint(async_client):
    """비동기 픽스처를 사용하는 테스트."""
    response = await async_client.get("/api/data")
    assert response.status_code == 200
```

### 비동기 함수 모킹

```python
@pytest.mark.asyncio
@patch("mypackage.async_api_call")
async def test_async_mock(api_call_mock):
    """mock으로 비동기 함수 테스트."""
    api_call_mock.return_value = {"status": "ok"}

    result = await my_async_function()

    api_call_mock.assert_awaited_once()
    assert result["status"] == "ok"
```

## 예외 테스트

### 예상 예외 테스트

```python
def test_divide_by_zero():
    """0으로 나누면 ZeroDivisionError 발생 테스트."""
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)

def test_custom_exception():
    """메시지가 있는 커스텀 예외 테스트."""
    with pytest.raises(ValueError, match="잘못된 입력"):
        validate_input("invalid")
```

### 예외 속성 테스트

```python
def test_exception_with_details():
    """커스텀 속성이 있는 예외 테스트."""
    with pytest.raises(CustomError) as exc_info:
        raise CustomError("오류", code=400)

    assert exc_info.value.code == 400
    assert "오류" in str(exc_info.value)
```

## 부작용 테스트

### 파일 작업 테스트

```python
import tempfile
import os

def test_file_processing():
    """임시 파일로 파일 처리 테스트."""
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
        f.write("테스트 내용")
        temp_path = f.name

    try:
        result = process_file(temp_path)
        assert result == "처리됨: 테스트 내용"
    finally:
        os.unlink(temp_path)
```

### pytest의 tmp_path 픽스처로 테스트

```python
def test_with_tmp_path(tmp_path):
    """pytest의 내장 임시 경로 픽스처로 테스트."""
    test_file = tmp_path / "test.txt"
    test_file.write_text("hello world")

    result = process_file(str(test_file))
    assert result == "hello world"
    # tmp_path가 자동으로 정리됨
```

### tmpdir 픽스처로 테스트

```python
def test_with_tmpdir(tmpdir):
    """pytest의 tmpdir 픽스처로 테스트."""
    test_file = tmpdir.join("test.txt")
    test_file.write("데이터")

    result = process_file(str(test_file))
    assert result == "데이터"
```

## 테스트 구성

### 디렉토리 구조

```
tests/
├── conftest.py                 # 공유 픽스처
├── __init__.py
├── unit/                       # 단위 테스트
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_utils.py
│   └── test_services.py
├── integration/                # 통합 테스트
│   ├── __init__.py
│   ├── test_api.py
│   └── test_database.py
└── e2e/                        # 엔드투엔드 테스트
    ├── __init__.py
    └── test_user_flow.py
```

### 테스트 클래스

```python
class TestUserService:
    """관련 테스트를 클래스로 그룹화."""

    @pytest.fixture(autouse=True)
    def setup(self):
        """이 클래스의 각 테스트 전에 실행."""
        self.service = UserService()

    def test_create_user(self):
        """사용자 생성 테스트."""
        user = self.service.create_user("Alice")
        assert user.name == "Alice"

    def test_delete_user(self):
        """사용자 삭제 테스트."""
        user = User(id=1, name="Bob")
        self.service.delete_user(user)
        assert not self.service.user_exists(1)
```

## 모범 사례

### 해야 할 것

- **TDD 따르기**: 코드 전에 테스트 작성 (빨강-초록-리팩토링)
- **한 가지 테스트**: 각 테스트는 단일 동작을 검증해야 함
- **설명적인 이름 사용**: `test_user_login_with_invalid_credentials_fails`
- **픽스처 사용**: 픽스처로 중복 제거
- **외부 의존성 모킹**: 외부 서비스에 의존하지 않기
- **엣지 케이스 테스트**: 빈 입력, None 값, 경계 조건
- **80%+ 커버리지 목표**: 중요 경로에 집중
- **테스트 빠르게 유지**: 느린 테스트를 분리하는 마커 사용

### 하지 말 것

- **구현 테스트 금지**: 내부가 아닌 동작 테스트
- **테스트에 복잡한 조건문 사용 금지**: 테스트는 단순하게 유지
- **테스트 실패 무시 금지**: 모든 테스트가 통과해야 함
- **서드파티 코드 테스트 금지**: 라이브러리가 작동한다고 신뢰
- **테스트 간 상태 공유 금지**: 테스트는 독립적이어야 함
- **테스트에서 예외 포착 금지**: `pytest.raises` 사용
- **print 구문 사용 금지**: 어설션 및 pytest 출력 사용
- **너무 취약한 테스트 작성 금지**: 과도하게 구체적인 mock 피하기

## 일반적인 패턴

### API 엔드포인트 테스트 (FastAPI/Flask)

```python
@pytest.fixture
def client():
    app = create_app(testing=True)
    return app.test_client()

def test_get_user(client):
    response = client.get("/api/users/1")
    assert response.status_code == 200
    assert response.json["id"] == 1

def test_create_user(client):
    response = client.post("/api/users", json={
        "name": "Alice",
        "email": "alice@example.com"
    })
    assert response.status_code == 201
    assert response.json["name"] == "Alice"
```

### 데이터베이스 작업 테스트

```python
@pytest.fixture
def db_session():
    """테스트 데이터베이스 세션 생성."""
    session = Session(bind=engine)
    session.begin_nested()
    yield session
    session.rollback()
    session.close()

def test_create_user(db_session):
    user = User(name="Alice", email="alice@example.com")
    db_session.add(user)
    db_session.commit()

    retrieved = db_session.query(User).filter_by(name="Alice").first()
    assert retrieved.email == "alice@example.com"
```

### 클래스 메서드 테스트

```python
class TestCalculator:
    @pytest.fixture
    def calculator(self):
        return Calculator()

    def test_add(self, calculator):
        assert calculator.add(2, 3) == 5

    def test_divide_by_zero(self, calculator):
        with pytest.raises(ZeroDivisionError):
            calculator.divide(10, 0)
```

## pytest 설정

### pytest.ini

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --strict-markers
    --disable-warnings
    --cov=mypackage
    --cov-report=term-missing
    --cov-report=html
markers =
    slow: 느린 테스트로 표시
    integration: 통합 테스트로 표시
    unit: 단위 테스트로 표시
```

### pyproject.toml

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "--strict-markers",
    "--cov=mypackage",
    "--cov-report=term-missing",
    "--cov-report=html",
]
markers = [
    "slow: 느린 테스트로 표시",
    "integration: 통합 테스트로 표시",
    "unit: 단위 테스트로 표시",
]
```

## 테스트 실행

```bash
# 모든 테스트 실행
pytest

# 특정 파일 실행
pytest tests/test_utils.py

# 특정 테스트 실행
pytest tests/test_utils.py::test_function

# 상세 출력으로 실행
pytest -v

# 커버리지로 실행
pytest --cov=mypackage --cov-report=html

# 빠른 테스트만 실행
pytest -m "not slow"

# 첫 번째 실패까지 실행
pytest -x

# N번 실패 시 중지
pytest --maxfail=3

# 마지막 실패 테스트 실행
pytest --lf

# 패턴으로 테스트 실행
pytest -k "test_user"

# 실패 시 디버거로 실행
pytest --pdb
```

## 빠른 참조

| 패턴 | 사용법 |
|---------|-------|
| `pytest.raises()` | 예상 예외 테스트 |
| `@pytest.fixture()` | 재사용 가능한 테스트 픽스처 생성 |
| `@pytest.mark.parametrize()` | 여러 입력으로 테스트 실행 |
| `@pytest.mark.slow` | 느린 테스트 표시 |
| `pytest -m "not slow"` | 느린 테스트 건너뜀 |
| `@patch()` | 함수 및 클래스 모킹 |
| `tmp_path` 픽스처 | 자동 임시 디렉토리 |
| `pytest --cov` | 커버리지 리포트 생성 |
| `assert` | 단순하고 읽기 쉬운 어설션 |

**기억하세요**: 테스트도 코드입니다. 깔끔하고, 읽기 쉽고, 유지보수 가능하게 유지하세요. 좋은 테스트는 버그를 잡고; 훌륭한 테스트는 버그를 예방합니다.
