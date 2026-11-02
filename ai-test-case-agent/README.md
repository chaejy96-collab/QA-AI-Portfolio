# Figma 기반 QA 테스트케이스 멀티에이전트

Figma 화면과 요구사항을 한 번에 읽고 TC를 추측해 쓰는 대신, 조사·감사·기준 동결·작성·검증·Senior 리뷰를 분리한 포트폴리오용 데모입니다.

모든 Figma export, 요구사항, 기존 TC, 승인 결과는 합성 데이터입니다. 실제 회사의 Figma 파일, Jira, 내부 문서, 계정, 개인정보, API 키 또는 외부 LLM을 사용하지 않습니다.

## 핵심 설계

```text
Main Orchestrator
  ├─ Survey Agent       자료 조사
  ├─ Audit Agent        독립 조사와 누락 감사
  ├─ Human Approval     기준 동결 게이트
  ├─ Test Design        조건·상태·예외 보완
  ├─ Write Agent        동결본만 사용해 TC 작성
  ├─ Validation Agent   근거·필수 필드·형식 검증
  ├─ QA Senior Agent    QA 관점 최종 리뷰
  └─ XLSX build         검증 통과 시에만 생성
```

중요한 경계는 다음과 같습니다.

- Survey와 Audit은 서로 다른 workspace 결과를 만든다.
- Write Agent는 Figma를 직접 다시 읽지 않고 승인된 frozen criteria만 사용한다.
- 근거가 부족한 항목은 임의로 TC를 만들지 않고 `확인 필요`로 남긴다.
- `check_tc.py`에서 ERROR가 하나라도 있으면 XLSX 빌드를 중단한다.
- 생성된 XLSX는 `check_final_xlsx.py`로 별도 검사한다.

## 실행

Python 3.10 이상과 Node.js가 필요합니다. 이 데모의 XLSX builder는 실행 환경에서 제공되는 `@oai/artifact-tool`을 사용합니다.

```bash
cd ai-test-case-agent
python3 src/main.py
```

성공하면 다음 산출물이 생성됩니다.

```text
artifacts/demo/
├── workspaces/
│   ├── survey/result.json
│   ├── audit/result.json
│   ├── design/frozen-criteria.json
│   ├── write/test-cases.json
│   ├── validation/result.json
│   └── senior/result.json
├── test-cases.json
├── test-cases.xlsx
└── final-validation.json
```

검증 스크립트만 별도로 실행할 수도 있습니다.

```bash
python3 scripts/check_tc.py artifacts/demo/test-cases.json
python3 scripts/check_final_xlsx.py artifacts/demo/test-cases.xlsx
```

전체 자동화 테스트:

```bash
python3 -m unittest discover -s tests -p 'test_*.py' -v
```

## 구현 범위

구현된 내용은 합성 Figma export 조사, 독립 감사, 승인된 기준 동결, TC 작성, TC 검증, Senior 리뷰, XLSX build gate와 최종 XLSX 검증입니다.

합성으로 처리하는 내용은 Figma 자료, 기존 TC, 사람 승인 결과, 각 에이전트의 결과입니다. 실제 Figma API, 실제 LLM/Opus, Jira 연동, 사내 저장소 접근, 외부 시스템 쓰기는 구현하지 않았습니다.

자세한 구분은 [docs/architecture.md](docs/architecture.md), [docs/agent-contracts.md](docs/agent-contracts.md), [docs/implementation-boundaries.md](docs/implementation-boundaries.md)를 참고하세요.
