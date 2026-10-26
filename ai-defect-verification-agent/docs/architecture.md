# 최소 데모 아키텍처

## 확인된 기존 설계

`Jira 결함 정보 → PR/코드 읽기 전용 분석 → 기준.md 적용 → Playwright 반복 실행 → 증거 수집 → Opus 독립 검토 → QA 판단` 흐름은 기존에 설계·실험한 구조로 제공되었다.

과거 실험의 `--repeat 2` 표기, 7/9→8/9 및 false close 2→0 기록은 평가 조건·지표 정의·원본 실행 설정이 없는 상태다. 이 데모의 성과나 재현된 수치로 사용하지 않는다.

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
