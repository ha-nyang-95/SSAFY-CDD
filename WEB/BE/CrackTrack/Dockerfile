# 멀티스테이지 빌드: gradle 빌드용 + 가벼운 런타임 이미지

FROM gradle:8.8-jdk17-alpine AS builder
WORKDIR /workspace

# 전체를 복사해 빌드 (속도 개선 필요 시 gradle 캐시 전략 분리 가능)
COPY . .
RUN gradle --no-daemon clean bootJar

FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

# 타임존 설정
ENV TZ=Asia/Seoul
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 빌드 산출물 복사 (SNAPSHOT/릴리즈 상관없이 *.jar 전체 매칭)
COPY --from=builder /workspace/build/libs/*.jar app.jar

# 도커 환경에서 프로파일 고정 (환경변수 미사용 요청 반영)
ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]


