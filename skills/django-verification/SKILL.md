---
name: django-verification
description: "Django 프로젝트를 위한 검증 루프: 마이그레이션, 린팅, 커버리지 포함 테스트, 보안 스캔, 릴리스 또는 PR 전 배포 준비 확인."
origin: ECC
---

# Django 검증 루프

PR 오픈 전, 주요 변경 후, 배포 전에 실행하여 Django 애플리케이션의 품질과 보안을 보장합니다.

## 활성화 시점

- Django 프로젝트의 풀 리퀘스트 오픈 전
- 주요 모델 변경, 마이그레이션 업데이트, 의존성 업그레이드 후
- 스테이징 또는 프로덕션의 배포 전 검증
- 전체 환경 → 린트 → 테스트 → 보안 → 배포 준비 파이프라인 실행
- 마이그레이션 안전성 및 테스트 커버리지 검증

## 1단계: 환경 확인

```bash
# Python 버전 확인
python --version  # 프로젝트 요구사항과 일치해야 함

# 가상 환경 확인
which python
pip list --outdated

# 환경 변수 확인
python -c "import os; import environ; print('DJANGO_SECRET_KEY set' if os.environ.get('DJANGO_SECRET_KEY') else 'MISSING: DJANGO_SECRET_KEY')"
```

환경이 잘못 구성된 경우 중지하고 수정합니다.

## 2단계: 코드 품질 및 포매팅

```bash
# 타입 검사
mypy . --config-file pyproject.toml

# ruff로 린팅
ruff check . --fix

# black으로 포매팅
black . --check
black .  # 자동 수정

# import 정렬
isort . --check-only
isort .  # 자동 수정

# Django 전용 검사
python manage.py check --deploy
```

일반적인 문제:
- 공개 함수의 타입 힌트 누락
- PEP 8 포매팅 위반
- 정렬되지 않은 import
- 프로덕션 설정에 남겨진 디버그 설정

## 3단계: 마이그레이션

```bash
# 미적용 마이그레이션 확인
python manage.py showmigrations

# 누락된 마이그레이션 생성
python manage.py makemigrations --check

# 마이그레이션 적용 시뮬레이션
python manage.py migrate --plan

# 마이그레이션 적용 (테스트 환경)
python manage.py migrate

# 마이그레이션 충돌 확인
python manage.py makemigrations --merge  # 충돌이 있는 경우에만
```

보고:
- 미적용 마이그레이션 수
- 마이그레이션 충돌 여부
- 마이그레이션 없는 모델 변경

## 4단계: 테스트 + 커버리지

```bash
# pytest로 모든 테스트 실행
pytest --cov=apps --cov-report=html --cov-report=term-missing --reuse-db

# 특정 앱 테스트 실행
pytest apps/users/tests/

# 마커와 함께 실행
pytest -m "not slow"  # 느린 테스트 건너뜀
pytest -m integration  # 통합 테스트만

# 커버리지 보고서
open htmlcov/index.html
```

보고:
- 총 테스트: X개 통과, Y개 실패, Z개 건너뜀
- 전체 커버리지: XX%
- 앱별 커버리지 분석

커버리지 목표:

| 컴포넌트 | 목표 |
|----------|------|
| 모델 | 90% 이상 |
| 직렬화기 | 85% 이상 |
| 뷰 | 80% 이상 |
| 서비스 | 90% 이상 |
| 전체 | 80% 이상 |

## 5단계: 보안 스캔

```bash
# 의존성 취약점
pip-audit
safety check --full-report

# Django 보안 검사
python manage.py check --deploy

# Bandit 보안 린터
bandit -r . -f json -o bandit-report.json

# 시크릿 스캔 (gitleaks가 설치된 경우)
gitleaks detect --source . --verbose

# 환경 변수 확인
python -c "from django.core.exceptions import ImproperlyConfigured; from django.conf import settings; settings.DEBUG"
```

보고:
- 발견된 취약한 의존성
- 보안 설정 문제
- 발견된 하드코딩된 시크릿
- DEBUG 모드 상태 (프로덕션에서는 False여야 함)

## 6단계: Django 관리 명령

```bash
# 모델 문제 확인
python manage.py check

# 정적 파일 수집
python manage.py collectstatic --noinput --clear

# 슈퍼유저 생성 (테스트에 필요한 경우)
echo "from apps.users.models import User; User.objects.create_superuser('admin@example.com', 'admin')" | python manage.py shell

# 데이터베이스 무결성
python manage.py check --database default

# 캐시 확인 (Redis 사용 시)
python -c "from django.core.cache import cache; cache.set('test', 'value', 10); print(cache.get('test'))"
```

## 7단계: 성능 확인

```bash
# Django Debug Toolbar 출력 (N+1 쿼리 확인)
# DEBUG=True로 개발 모드에서 실행 후 페이지 접근
# SQL 패널에서 중복 쿼리 확인

# 쿼리 수 분석
django-admin debugsqlshell  # django-debug-sqlshell이 설치된 경우

# 누락된 인덱스 확인
python manage.py shell << EOF
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT table_name, index_name FROM information_schema.statistics WHERE table_schema = 'public'")
    print(cursor.fetchall())
EOF
```

보고:
- 페이지당 쿼리 수 (일반적인 페이지는 50개 미만이어야 함)
- 누락된 데이터베이스 인덱스
- 중복 쿼리 감지

## 8단계: 정적 자산

```bash
# npm 의존성 확인 (npm 사용 시)
npm audit
npm audit fix

# 정적 파일 빌드 (webpack/vite 사용 시)
npm run build

# 정적 파일 확인
ls -la staticfiles/
python manage.py findstatic css/style.css
```

## 9단계: 설정 검토

```python
# Python 쉘에서 실행하여 설정 확인
python manage.py shell << EOF
from django.conf import settings
import os

# 중요 확인 사항
checks = {
    'DEBUG가 False임': not settings.DEBUG,
    'SECRET_KEY 설정됨': bool(settings.SECRET_KEY and len(settings.SECRET_KEY) > 30),
    'ALLOWED_HOSTS 설정됨': len(settings.ALLOWED_HOSTS) > 0,
    'HTTPS 활성화': getattr(settings, 'SECURE_SSL_REDIRECT', False),
    'HSTS 활성화': getattr(settings, 'SECURE_HSTS_SECONDS', 0) > 0,
    '데이터베이스 설정됨': settings.DATABASES['default']['ENGINE'] != 'django.db.backends.sqlite3',
}

for check, result in checks.items():
    status = '✓' if result else '✗'
    print(f"{status} {check}")
EOF
```

## 10단계: 로깅 설정

```bash
# 로깅 출력 테스트
python manage.py shell << EOF
import logging
logger = logging.getLogger('django')
logger.warning('테스트 경고 메시지')
logger.error('테스트 오류 메시지')
EOF

# 로그 파일 확인 (설정된 경우)
tail -f /var/log/django/django.log
```

## 11단계: API 문서 (DRF 사용 시)

```bash
# 스키마 생성
python manage.py generateschema --format openapi-json > schema.json

# 스키마 유효성 검사
python -c "import json; json.load(open('schema.json'))"

# Swagger UI 접근 (drf-yasg 사용 시)
# 브라우저에서 http://localhost:8000/swagger/ 방문
```

## 12단계: Diff 검토

```bash
# diff 통계 표시
git diff --stat

# 실제 변경사항 표시
git diff

# 변경된 파일 표시
git diff --name-only

# 일반적인 문제 확인
git diff | grep -i "todo\|fixme\|hack\|xxx"
git diff | grep "print("  # 디버그 구문
git diff | grep "DEBUG = True"  # 디버그 모드
git diff | grep "import pdb"  # 디버거
```

체크리스트:
- 디버깅 구문 없음 (print, pdb, breakpoint())
- 중요 코드에 TODO/FIXME 주석 없음
- 하드코딩된 시크릿 또는 자격증명 없음
- 모델 변경에 데이터베이스 마이그레이션 포함
- 설정 변경 문서화
- 외부 호출에 오류 처리 존재
- 필요한 곳에 트랜잭션 관리

## 출력 템플릿

```
DJANGO 검증 보고서
==========================

1단계: 환경 확인
  ✓ Python 3.11.5
  ✓ 가상 환경 활성화
  ✓ 모든 환경 변수 설정됨

2단계: 코드 품질
  ✓ mypy: 타입 오류 없음
  ✗ ruff: 3개 문제 발견 (자동 수정됨)
  ✓ black: 포매팅 문제 없음
  ✓ isort: import 정렬됨
  ✓ manage.py check: 문제 없음

3단계: 마이그레이션
  ✓ 미적용 마이그레이션 없음
  ✓ 마이그레이션 충돌 없음
  ✓ 모든 모델에 마이그레이션 있음

4단계: 테스트 + 커버리지
  테스트: 247개 통과, 0개 실패, 5개 건너뜀
  커버리지:
    전체: 87%
    users: 92%
    products: 89%
    orders: 85%
    payments: 91%

5단계: 보안 스캔
  ✗ pip-audit: 2개 취약점 발견 (수정 필요)
  ✓ safety check: 문제 없음
  ✓ bandit: 보안 문제 없음
  ✓ 시크릿 감지되지 않음
  ✓ DEBUG = False

6단계: Django 명령
  ✓ collectstatic 완료
  ✓ 데이터베이스 무결성 정상
  ✓ 캐시 백엔드 접근 가능

7단계: 성능
  ✓ N+1 쿼리 감지되지 않음
  ✓ 데이터베이스 인덱스 구성됨
  ✓ 쿼리 수 허용 범위 내

8단계: 정적 자산
  ✓ npm audit: 취약점 없음
  ✓ 자산 빌드 성공
  ✓ 정적 파일 수집됨

9단계: 설정
  ✓ DEBUG = False
  ✓ SECRET_KEY 설정됨
  ✓ ALLOWED_HOSTS 설정됨
  ✓ HTTPS 활성화
  ✓ HSTS 활성화
  ✓ 데이터베이스 설정됨

10단계: 로깅
  ✓ 로깅 설정됨
  ✓ 로그 파일 쓰기 가능

11단계: API 문서
  ✓ 스키마 생성됨
  ✓ Swagger UI 접근 가능

12단계: Diff 검토
  변경된 파일: 12개
  +450, -120 줄
  ✓ 디버그 구문 없음
  ✓ 하드코딩된 시크릿 없음
  ✓ 마이그레이션 포함됨

권장사항: ⚠️ 배포 전 pip-audit 취약점 수정 필요

다음 단계:
1. 취약한 의존성 업데이트
2. 보안 스캔 재실행
3. 최종 테스트를 위해 스테이징에 배포
```

## 배포 전 체크리스트

- [ ] 모든 테스트 통과
- [ ] 커버리지 ≥ 80%
- [ ] 보안 취약점 없음
- [ ] 미적용 마이그레이션 없음
- [ ] 프로덕션 설정에서 DEBUG = False
- [ ] SECRET_KEY 적절히 설정됨
- [ ] ALLOWED_HOSTS 올바르게 설정됨
- [ ] 데이터베이스 백업 활성화
- [ ] 정적 파일 수집 및 서빙 설정
- [ ] 로깅 설정 및 작동 확인
- [ ] 오류 모니터링 (Sentry 등) 설정
- [ ] CDN 설정 (해당하는 경우)
- [ ] Redis/캐시 백엔드 설정
- [ ] Celery 워커 실행 (해당하는 경우)
- [ ] HTTPS/SSL 설정
- [ ] 환경 변수 문서화

## 지속적 통합

### GitHub Actions 예시

```yaml
# .github/workflows/django-verification.yml
name: Django 검증

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Python 설정
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: pip 캐시
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}

      - name: 의존성 설치
        run: |
          pip install -r requirements.txt
          pip install ruff black mypy pytest pytest-django pytest-cov bandit safety pip-audit

      - name: 코드 품질 검사
        run: |
          ruff check .
          black . --check
          isort . --check-only
          mypy .

      - name: 보안 스캔
        run: |
          bandit -r . -f json -o bandit-report.json
          safety check --full-report
          pip-audit

      - name: 테스트 실행
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
          DJANGO_SECRET_KEY: test-secret-key
        run: |
          pytest --cov=apps --cov-report=xml --cov-report=term-missing

      - name: 커버리지 업로드
        uses: codecov/codecov-action@v3
```

## 빠른 참조

| 확인 항목 | 명령 |
|-----------|------|
| 환경 | `python --version` |
| 타입 검사 | `mypy .` |
| 린팅 | `ruff check .` |
| 포매팅 | `black . --check` |
| 마이그레이션 | `python manage.py makemigrations --check` |
| 테스트 | `pytest --cov=apps` |
| 보안 | `pip-audit && bandit -r .` |
| Django 검사 | `python manage.py check --deploy` |
| 정적 파일 수집 | `python manage.py collectstatic --noinput` |
| Diff 통계 | `git diff --stat` |

자동화된 검증은 일반적인 문제를 잡아내지만 스테이징 환경에서의 수동 코드 리뷰와 테스트를 대체하지는 않습니다.
