# 구현 경계와 보안 기준

## 구현됨

- 합성 Figma export와 요구사항·기존 TC 입력
- Survey/Audit 독립 결과 workspace
- 승인 fixture를 통한 frozen criteria 게이트
- Write, Validation, QA Senior agent 흐름
- ERROR 발생 시 XLSX 빌드 중단
- XLSX 생성과 최종 파일 검사

## 합성 처리

- Figma 화면과 component metadata는 `fixtures/figma/`의 합성 JSON이다.
- 요구사항과 기존 TC는 `fixtures/requirements/`, `fixtures/existing-tc/`의 샘플이다.
- 사람 승인은 `fixtures/approval/criteria-approved.json`으로 표현한 합성 입력이다.
- Survey, Audit, Senior 결과는 결정론적인 포트폴리오 데모 구현이다.

## 미구현

- 실제 Figma API와 Figma 권한 관리
- 실제 Jira·Confluence·Git 저장소 연동
- 실제 LLM, Opus 또는 외부 AI 호출
- 사내 계정·운영 데이터 접근
- 외부 시스템에 TC 게시 또는 자동 변경

실제 회사 정보, 개인정보, 계정, 토큰, 내부 URL을 fixture에 추가하지 않는다. 그런 입력이 필요해지는 경우에는 합성 fixture로 대체하거나 구현을 중단하고 확인한다.
