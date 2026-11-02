# 최소 데모 아키텍처

## 확인된 기존 설계

`Jira 결함 정보 → PR/코드 읽기 전용 분석 → 기준.md 적용 → Playwright 반복 실행 → 증거 수집 → Opus 독립 검토 → QA 판단` 흐름은 기존에 설계·실험한 구조로 제공되었다.

과거 실험의 `--repeat 2` 표기, 7/9→8/9 및 false close 2→0 기록은 평가 조건·지표 정의·원본 실행 설정이 없는 상태다. 이 데모의 성과나 재현된 수치로 사용하지 않는다.

## 1. 도구 전략 (Tooling Strategy)
- **Jira (Atlassian MCP)**: 티켓 본문 및 댓글 분석을 통해 결함의 맥락(Context)을 파악하고, 수정 완료 시 Jira REST API를 통해 상세 리포트, 첨부 파일(증거)을 업로드.
- **GitHub**: `view diff` 기능을 통해 코드 변경 사항을 Read-only로 분석하여 영향도 파악.
- **Playwright**: `npx playwright test` 명령으로 테스트 자동화 수행. 
- **증거 수집**: 테스트 실행 결과물(Trace, Video, Screenshot)을 수집하여 결함 수정의 물리적 근거로 활용.

## 2. 회귀 결과 보고 전략 (Reporting Strategy)
- **Jira 통합**: 최종 검증 결과(첨부 파일, 상세 분석 댓글, 상태 변경 요청)는 Jira REST API를 통해 안전하게 반영.
- **안전장치 (Safety Mechanisms)**:
    - **Dry-run Mode**: 실제 Jira 상태 변경 전, 영향도를 리포트 형태로 우선 출력하여 검증.
    - **API 제한**: Jira API 호출 시 토큰 기반 인증 사용 및 최소 권한(최대 첨부 및 댓글 작성) 적용.
    - **결과 검증**: 보고서 업로드 전 무결성 검증을 통해 오작성된 리포트가 티켓에 반영되는 것을 방지.

## 이 데모에서 새로 구현하는 범위

### 기본 데모

```text
합성 Jira 이슈 + 합성 PR diff + 포트폴리오용 기준.md
                         ↓
              로컬 Playwright 검증 (repeat-each=2)
                         ↓
       trace / video / screenshot / 관찰 JSON 증거
                         ↓
        최초 판단 ───────→ 합성 독립 검토 fixture
                         ↓
                    최종 QA 보고서
```

- 기본 데모는 `QADEMO-101` 입력과 `tests/e2e/verify-fixed.spec.mjs`를 사용하며, `repeatCount: 2`로 순차 반복 실행한다.
- 기본 데모의 Playwright 테스트는 성공 메시지와 API 응답을 확인하고, 명시적으로 screenshot·trace·video·관찰 JSON을 수집한다.

### 통합 검증 시나리오

- `reproduced`, `insufficient-evidence`, `execution-failure`의 세 scenario profile은 각각 별도 합성 입력과 artifact 경로를 사용하며, 모두 `repeatCount: 1`로 실행된다.
- `reproduced`는 결함 관찰값을 기록해 최종 `재현됨` 보고서를 검증한다.
- `insufficient-evidence`는 Playwright 실행과 기대 결과 확인은 통과시키되, 테스트에서 명시적인 screenshot 저장을 의도적으로 생략한다. 따라서 screenshot·trace·video·관찰 JSON을 모두 요구하는 C3가 충족되지 않아 최종 `판단 보류`가 된다.
- `execution-failure`는 합성 Playwright 실행 실패를 보고서까지 전달해 최종 `실행 실패`를 검증한다.

- PR diff는 파일로 읽기만 하며 어떤 저장소·PR도 변경하지 않는다.
- `기준.md`는 원본 문서가 아니라 이 합성 시나리오를 위한 새 기준이다.
- 독립 검토는 인터페이스와 JSON fixture로 구현한다. Opus API 호출은 하지 않는다.
- 결과 생성은 Jira 업데이트, 댓글 작성, 이슈 종료를 수행하지 않는다.

## 확장 계획 — 미구현

- 실제 Jira/PR 읽기 전용 adapter 및 인증 관리
- Opus 기반 독립 검토 adapter
- 여러 이슈·PR 매핑과 위험 기반 테스트 선택
- 스테이징 환경의 예약 실행 및 사람 승인형 Jira 코멘트 초안
