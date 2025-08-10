-- 사용자 테이블
CREATE TABLE `users`
(
    `user_id`        BIGINT      NOT NULL AUTO_INCREMENT,
    `email`          VARCHAR(30) NOT NULL UNIQUE,
    `password`       TEXT        NOT NULL COMMENT 'Bcrypt 해시 처리',
    `name`           VARCHAR(20) NOT NULL,
    `role`           ENUM ('GENERAL', 'ADMIN')              NOT NULL DEFAULT 'GENERAL',
    `status`         ENUM ('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `activated_at`   TIMESTAMP   NOT NULL DEFAULT NOW(),
    `deactivated_at` TIMESTAMP NULL,
    `deleted_at`     TIMESTAMP NULL,
    PRIMARY KEY (`user_id`)
);

-- 리프레시 토큰 테이블
CREATE TABLE `refresh_tokens`
(
    `refresh_token_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`          BIGINT       NOT NULL,
    `refresh_token`    VARCHAR(512) NOT NULL,
    `expires_at`       TIMESTAMP    NOT NULL DEFAULT (NOW() + INTERVAL 7 DAY),
    PRIMARY KEY (`refresh_token_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);

-- 지역 테이블
CREATE TABLE `locations`
(
    `location_id` BIGINT      NOT NULL AUTO_INCREMENT,
    `user_id`     BIGINT      NOT NULL,
    `name`        VARCHAR(20) NOT NULL,
    PRIMARY KEY (`location_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);

-- 작업 테이블
CREATE TABLE `tasks`
(
    `task_id`        BIGINT       NOT NULL AUTO_INCREMENT,
    `location_id`    BIGINT       NOT NULL,
    `user_id`        BIGINT       NOT NULL,
    `s3_name`        VARCHAR(100) NOT NULL,
    `description`    VARCHAR(500) NULL,
    `status`         ENUM ('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `activated_at`   TIMESTAMP    NOT NULL DEFAULT NOW(),
    `deactivated_at` TIMESTAMP NULL,
    `deleted_at`     TIMESTAMP NULL,
    PRIMARY KEY (`task_id`),
    FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);

-- 영상 테이블
CREATE TABLE `videos`
(
    `video_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `task_id`  BIGINT       NOT NULL,
    `s3_url`   VARCHAR(255) NOT NULL,
    PRIMARY KEY (`video_id`),
    FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`)
);

-- 디텍션 테이블 (detections)
CREATE TABLE `detections`
(
    `detect_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `task_id`   BIGINT       NOT NULL,
    `s3_url`    VARCHAR(255) NOT NULL,
    PRIMARY KEY (`detect_id`),
    FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`)
);

-- 3D 모델링 테이블
CREATE TABLE `modelings`
(
    `modeling_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `task_id`     BIGINT       NOT NULL,
    `s3_url`      VARCHAR(255) NOT NULL,
    PRIMARY KEY (`modeling_id`),
    FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`)
);

-- 균열 테이블
CREATE TABLE `cracks`
(
    `crack_id`        BIGINT      NOT NULL AUTO_INCREMENT,
    `task_id`         BIGINT      NOT NULL,
    `crack_id_string` VARCHAR(20) NOT NULL COMMENT 'crackId0, crackId1 등의 문자열',
    `status`          ENUM ('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `activated_at`    TIMESTAMP   NOT NULL DEFAULT NOW(),
    `deactivated_at`  TIMESTAMP NULL,
    `deleted_at`      TIMESTAMP NULL COMMENT '잘못된 검출은 삭제처리',
    PRIMARY KEY (`crack_id`),
    FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`)
);

-- 세그먼트 테이블
CREATE TABLE `segments`
(
    `segment_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `crack_id`   BIGINT       NOT NULL,
    `s3_url`     VARCHAR(255) NOT NULL,
    PRIMARY KEY (`segment_id`),
    FOREIGN KEY (`crack_id`) REFERENCES `cracks` (`crack_id`)
);

-- 원본 이미지 테이블
CREATE TABLE `images`
(
    `resource_image_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `crack_id`          BIGINT       NOT NULL,
    `s3_url`            VARCHAR(255) NOT NULL,
    PRIMARY KEY (`resource_image_id`),
    FOREIGN KEY (`crack_id`) REFERENCES `cracks` (`crack_id`)
);

-- 라이더 테이블
CREATE TABLE `lidars`
(
    `lidar_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `crack_id` BIGINT       NOT NULL,
    `s3_url`   VARCHAR(255) NOT NULL,
    PRIMARY KEY (`lidar_id`),
    FOREIGN KEY (`crack_id`) REFERENCES `cracks` (`crack_id`)
);