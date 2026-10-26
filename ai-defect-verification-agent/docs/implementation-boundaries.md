# 구현 경계와 확인 필요 항목

## 구현됨

- 기본 데모용 합성 Jira 이슈 1건(`QADEMO-101`)과 합성 PR diff의 로컬 읽기
- 명시적으로 읽기 전용인 변경 분석 결과
- 포트폴리오용 `기준.md`의 C1~C3 적용
- Playwright 기반 로컬 브라우저 검증과 반복 실행
- trace, video, screenshot, 관찰 JSON을 이용한 증거 완전성 확인
- 네 가지 QA 판정과 독립 검토의 `수정 확인` 차단 규칙
- Markdown/JSON 최종 보고서
- 재현됨·증거 부족·실행 실패를 합성 입력부터 최종 보고서까지 확인하는 격리된 통합 테스트

## 합성 처리

- 기본 데모 fixture는 합성 Jira 이슈 1건(`QADEMO-101`), 합성 PR diff 1개(`QADEMO-101.diff`), 합성 독립 검토 결과 1개로 구성된다.
- 통합 검증용 fixture는 scenario profile 3개(`reproduced`, `insufficient-evidence`, `execution-failure`)와 이에 대응하는 합성 Jira 이슈 3건(`QADEMO-102`~`104`), 합성 독립 검토 결과 3개로 구성된다. 세 통합 시나리오는 기본 데모와 같은 합성 PR diff 1개를 공유하며, PR diff를 3개로 중복 생성하지 않는다.
- Jira 이슈, PR diff, 데모 앱, 독립 검토 결과는 모두 합성 데이터다. 독립 검토 fixture는 실제 Opus의 판단이 아니다.

## 미구현 또는 확인 필요

- 과거 원본 `기준.md`, 프롬프트, 데이터 모델, 내부 에이전트 로직
- 과거 Playwright 반복 실행의 정확한 설정과 평가 데이터
- 7/9→8/9, false close 2→0의 지표 정의·재현 가능성
- 실제 Jira·PR 읽기 전용 연동, Opus API 호출, 외부 서비스 쓰기 작업
