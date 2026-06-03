# WEB / BE (사전조사 백엔드 프로토타입)

프로젝트 본격 개발 이전 단계에서 작성한 **Spring Boot 백엔드 프로토타입**(`CrackTrack/`)입니다. 사전조사·기술 검증 목적의 아카이브이며, 실제 서비스 백엔드는 [`WEB/BE/CrackTrack`](../../../../WEB/BE/CrackTrack)을 참고하세요.

## 기술 스택

- **Spring Boot 3.5.4**, **Java 17**
- Spring Data JPA, Spring Security, Spring Web, Validation
- JWT (`jjwt` 0.12.5)
- DB: H2(개발), MySQL
- API 문서: springdoc-openapi (Swagger UI)
- Lombok

> 패키지 base: `com.teto.cracktrack` (그룹 `com.teto`)

## 도메인 구성 (프로토타입)

```
domain/
├── auth/      # 인증 (controller, dto, entity, jwt, repository, service)
├── drone/     # 드론 (controller, dto, entity, repository, service)
├── security/  # 보안 설정 (config, handler)
└── user/      # 사용자 (controller, dto, entity, repository, service)
common/        # 공통 (config, entity, exception, util)
```

## 실행

```bash
cd CrackTrack
./gradlew bootRun
```
