# Git 워크플로우

## 커밋 메시지 형식
```
<타입>: <설명>

<선택적 본문>
```

타입: feat, fix, refactor, docs, test, chore, perf, ci

참고: 귀속 표시는 ~/.claude/settings.json을 통해 전역으로 비활성화되어 있음.

## Pull Request 워크플로우

PR 생성 시:
1. 전체 커밋 이력 분석 (최신 커밋만이 아닌)
2. `git diff [base-branch]...HEAD`로 모든 변경사항 확인
3. 포괄적인 PR 요약 작성
4. TODO가 포함된 테스트 계획 포함
5. 새 브랜치의 경우 `-u` 플래그와 함께 푸시

> git 작업 이전의 전체 개발 프로세스(계획 수립, TDD, 코드 리뷰)는
> [development-workflow.md](./development-workflow.md)를 참조.
