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

## 현재 데모의 실행 단위

현재 데모는 하나의 합성 프로필 설정 기능을 사용한다. agent별 결과는 `artifacts/demo/workspaces/<agent>/`에 분리 저장된다. 사람이 승인했다는 사실은 합성 approval fixture로 표현하며, 실제 사람이나 실제 회사 승인 기록이 아니다.

오류가 있으면 `check_tc.py` 단계에서 중단하고 XLSX를 만들지 않는다. XLSX가 생성된 경우에도 `check_final_xlsx.py`를 통과해야 최종 산출물로 간주한다.
