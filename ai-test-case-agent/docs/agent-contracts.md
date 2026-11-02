# Agent 입출력 계약

| Agent | 입력 | 출력 | 직접 접근하지 않는 것 |
|---|---|---|---|
| Survey | Figma export, 요구사항, 기존 TC | 화면·역할·상태·근거 목록 | 없음 |
| Audit | 같은 원자료, 별도 workspace | 누락·불일치·근거 부족 목록 | Survey 결과 |
| Test Design | Survey, Audit, 승인 내용 | frozen criteria | 원본 Figma 재조사 |
| Write | frozen criteria | 실행 가능한 TC JSON | Figma, 원본 요구사항 |
| Validation | TC JSON, frozen criteria | ERROR/WARN, 기준별 결과 | 결과 임의 수정 |
| Senior | TC JSON, Validation 결과 | QA 리뷰 및 권고 | 원본 자료 재작성 |
| Main | 모든 agent 결과 | 병합된 pipeline 결과 | 외부 시스템 쓰기 |

## 필수 TC 필드

`id`, `title`, `priority`, `preconditions`, `steps`, `expected_result`, `evidence_refs`, `source_basis`, `needs_confirmation`을 필수로 한다.

`needs_confirmation=true`인 항목은 누락을 숨기지 않고 사람이 확인해야 할 내용을 표시한다.
