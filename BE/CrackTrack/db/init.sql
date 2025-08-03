

CREATE TABLE users (
                       user_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
                       email          VARCHAR(100)                         NOT NULL UNIQUE,
                       name           VARCHAR(50)                          NOT NULL,
                       password       VARCHAR(255)                         NOT NULL,
                       role           ENUM('GUEST','GENERAL','ADMIN')      NOT NULL DEFAULT 'GENERAL',
                       status         ENUM('ACTIVE','INACTIVE','DELETED')  NOT NULL DEFAULT 'ACTIVE',
                       activated_at   DATETIME                             NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       deactivated_at DATETIME,
                       deleted_at     DATETIME
);

CREATE TABLE drones (
                        drone_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
                        name           VARCHAR(100)                         NOT NULL,
                        serial_number  VARCHAR(100)                         NOT NULL UNIQUE,
                        user_id        BIGINT                               NOT NULL,
                        channel_arn    VARCHAR(255)                         NOT NULL,
                        status         ENUM('ACTIVE','INACTIVE','DELETED')  NOT NULL DEFAULT 'ACTIVE',
                        activated_at   DATETIME                             NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        deactivated_at DATETIME,
                        deleted_at     DATETIME,
                        CONSTRAINT fk_drone_user FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE locations (
                           location_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
                           name  VARCHAR(100)                         NOT NULL,
                           latitude       DOUBLE,
                           longitude      DOUBLE,
                           user_id        BIGINT                               NOT NULL,
                           CONSTRAINT fk_location_user FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE refresh_tokens (
                                refresh_token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                user_id          BIGINT       NOT NULL UNIQUE,
                                token            VARCHAR(512) NOT NULL,
                                expires_at       DATETIME     NOT NULL,
                                CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);


CREATE TABLE videos (
                        video_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
                        drone_id       BIGINT                               NOT NULL,
                        user_id        BIGINT                               NOT NULL,
                        location_id    BIGINT,
                        s3key          VARCHAR(255)                         NOT NULL,
                        status         ENUM('ACTIVE','INACTIVE','DELETED')  NOT NULL DEFAULT 'ACTIVE',
                        activated_at   DATETIME                             NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        deactivated_at DATETIME,
                        deleted_at     DATETIME,
                        CONSTRAINT fk_video_location FOREIGN KEY (location_id) REFERENCES locations (location_id)
);

CREATE TABLE cracks (
                        crack_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
                        video_id       BIGINT                               NOT NULL,
                        status         ENUM('ACTIVE','INACTIVE','DELETED')  NOT NULL DEFAULT 'ACTIVE',
                        activated_at   DATETIME                             NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        deactivated_at DATETIME,
                        deleted_at     DATETIME,
                        CONSTRAINT fk_crack_video FOREIGN KEY (video_id) REFERENCES videos (video_id)
);

