# AI 결함 검증 및 회귀 테스트 에이전트 — 최소 데모

Jira 결함의 기대 결과를 기준으로 변경 diff를 **읽기 전용**으로 분석하고, Playwright 검증·증거 수집·독립 검토를 거쳐 QA 판단을 만드는 로컬 포트폴리오 데모입니다.

모든 이슈, PR diff, 애플리케이션, 검토 결과는 합성 데이터입니다. Jira, GitHub/GitLab, Opus API 또는 어떤 외부 서비스도 호출하거나 변경하지 않습니다.

## 핵심 목적

Playwright 테스트가 통과했다는 사실만으로 결함 수정 완료를 판단하지 않습니다. Jira 기대 결과를 직접 뒷받침하는 실행 증거와 독립 검토 결과를 함께 고려하며, 증거 또는 근거가 부족하면 `수정 확인` 대신 `판단 보류`로 처리합니다. 이 흐름은 근거 없는 완료 판정(false close)의 위험을 줄이고 QA의 최종 판단을 지원하기 위한 것입니다.

## 데모 흐름

1. `fixtures/jira/QADEMO-101.json`을 읽는다.
2. `fixtures/pull-requests/QADEMO-101.diff`를 읽기 전용으로 분석한다.
3. 포트폴리오용 `기준.md`의 C1~C3을 적용한다.
4. 로컬 데모 앱에 Playwright 테스트를 두 번 실행한다.
5. trace, video, screenshot, 관찰 JSON을 증거로 수집한다.
6. 최초 판단과 합성 독립 검토 fixture를 대조한다.
7. `artifacts/final-report.md`와 JSON 보고서를 만든다.

## 새 환경에서 실행

Node.js 20 이상을 권장합니다.

```bash
cd ai-defect-verification-agent
npm install
npx playwright install chromium
npm test
npm run test:e2e
npm run demo
```

결과는 다음에서 확인합니다.

```text
artifacts/final-report.md
artifacts/final-report.json
artifacts/test-results/
```

`npm run demo`는 실제 Playwright 명령 `playwright test --repeat-each=2`를 실행합니다. 이는 기존 실험 기록의 `--repeat 2` 표기를 새 환경에서 실행 가능한 Playwright 옵션으로 옮긴 새 구현입니다. 원 실험의 정확한 명령과 설정은 확인 필요입니다.

`npm test`는 판단 규칙 단위 테스트와 세 가지 통합 시나리오를 실행합니다. 통합 시나리오는 각각 독립된 `artifacts/integration-tests/<scenario>/`에 보고서를 생성합니다. 실행 실패 시나리오는 의도적으로 Playwright를 실패시키지만, 생성된 최종 보고서가 `실행 실패`인지 검증하므로 통합 테스트 자체는 성공해야 합니다.

## 통합 검증 시나리오

- `reproduced`: 결함 관찰값을 기록하고 최종 `재현됨` 보고서를 생성한다.
- `insufficient-evidence`: Playwright는 통과하지만 스크린샷 증거를 생략해 최종 `판단 보류` 보고서를 생성한다.
- `execution-failure`: Playwright 실행 실패를 수집해 최종 `실행 실패` 보고서를 생성한다.

통합 시나리오는 각각 1회 실행한다. 기본 데모만 기존 실험 흐름을 반영해 2회 반복 실행한다.

## 판단 규칙

| 결과 | 조건 |
| --- | --- |
| 수정 확인 | 실행 성공, 모든 기준 충족, 필수 증거 존재, 독립 검토 차단 사항 없음 |
| 재현됨 | 실행 중 대상 결함이 계속 관찰됨 |
| 판단 보류 | 테스트가 통과했더라도 기준 또는 증거가 부족함 |
| 실행 실패 | 환경·자동화·인증 등으로 검증 실행을 완료하지 못함 |

`npm test`는 위 네 가지 판단과 독립 검토에 의한 false close 차단을 단위 테스트합니다.

## 범위와 한계

기존에 확인된 아키텍처와 현재 데모에서 실제 구현한 범위의 구분은 [docs/architecture.md](docs/architecture.md), 합성 처리와 확인 필요 사항은 [docs/implementation-boundaries.md](docs/implementation-boundaries.md)에 기록했습니다.
