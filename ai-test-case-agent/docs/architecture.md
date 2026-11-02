# Figma 테스트케이스 멀티에이전트 아키텍처

## 확인된 설계 기준

이 프로젝트의 기준 구조는 Survey와 Audit을 분리하고, 사람 승인 후 기준을 동결한 다음 Write·Validation·Senior 단계를 순서대로 실행하는 방식이다.

```text
Figma / 요구사항 / 기존 TC
          │
          ├── Survey Agent ───┐
          │                   ├── Main 비교·승인 게이트
          └── Audit Agent ────┘
                                  │
                         Frozen criteria
                                  │
                    Test Design → Write Agent
                                  │
                    Validation → QA Senior
                                  │
                         check_tc.py
                                  │
                            XLSX build
                                  │
                    check_final_xlsx.py
```

## 역할과 경계

- Main Orchestrator만 각 agent 결과를 병합하고 다음 단계로 전달한다.
- Survey Agent는 자료와 화면 구조를 조사한다.
- Audit Agent는 Survey 결과를 그대로 복사하지 않고 같은 합성 입력을 독립적으로 조사한다.
- Test Design은 두 조사 결과와 승인 내용을 바탕으로 역할·상태·예외 조건을 보완한다.
- Write Agent는 Figma와 원자료에 직접 접근하지 않고 frozen criteria만 읽는다.
- Validation Agent는 근거 참조, 필수 필드, 확인 필요 표시, 중복과 모순을 검사한다.
- QA Senior Agent는 테스트 관점의 누락·중복·우선순위를 최종 검토한다.

## 1. 도구 전략 (Tooling Strategy)
- **Figma**: Figma MCP를 사용하여 디자인 사양을 읽고, API 한도 부족 시 Figma REST API로 우회하여 자동화 가용성을 확보함.
- **Jira (Atlassian MCP)**: 이슈 본문과 댓글을 결합 분석하여 수정 방향과 히스토리를 정밀 추적.
- **GitHub**: Diff 분석을 위한 최소한의 Read-only 권한만 활용.
- **Playwright**: `npx playwright test` 명령을 활용하여 검증 실행의 표준성과 독립성 유지.

## 2. 회귀 결과 보고 전략 (Regression Reporting Strategy)
- **Jira 통합**: 최종 검증 결과(첨부 파일, 상세 댓글, 상태 변경)는 Jira REST API를 통해 안전하게 반영.
- **안전장치 (Safety Mechanisms)**:
    - **Human-in-the-loop**: 민감한 상태 변경은 사람의 승인 혹은 최종 확인 후 실행.
    - **Dry-run Mode**: 모든 API 쓰기 작업 전 시뮬레이션 모드를 기본값으로 설정.
    - **구조 검증**: API 호출 전 작성될 리포트의 구조와 내용을 최종 검증하여 무결성 보장.
    - **최소 권한**: API Key는 필요한 최소 범위의 권한만을 할당하여 위험 최소화.

## 현재 데모의 실행 단위

현재 데모는 하나의 합성 프로필 설정 기능을 사용한다. agent별 결과는 `artifacts/demo/workspaces/<agent>/`에 분리 저장된다. 사람이 승인했다는 사실은 합성 approval fixture로 표현하며, 실제 사람이나 실제 회사 승인 기록이 아니다.

오류가 있으면 `check_tc.py` 단계에서 중단하고 XLSX를 만들지 않는다. XLSX가 생성된 경우에도 `check_final_xlsx.py`를 통과해야 최종 산출물로 간주한다.
