-- Drop user if exists to ensure a clean slate on recreation
DROP USER IF EXISTS 'cheetah'@'localhost';
DROP USER IF EXISTS 'cheetah'@'%';
FLUSH PRIVILEGES;

-- Create user for both localhost and any host, specifying the native password plugin
CREATE USER 'cheetah'@'localhost' IDENTIFIED WITH mysql_native_password BY 'b102b102';
CREATE USER 'cheetah'@'%' IDENTIFIED WITH mysql_native_password BY 'b102b102';

-- Grant privileges to both users
GRANT ALL PRIVILEGES ON cracktrack.* TO 'cheetah'@'localhost';
GRANT ALL PRIVILEGES ON cracktrack.* TO 'cheetah'@'%';

-- Apply changes
FLUSH PRIVILEGES;

CREATE TABLE users
(
    user_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(100)                         NOT NULL UNIQUE,
    name           VARCHAR(50)                          NOT NULL,
    password       VARCHAR(255)                         NOT NULL,
    role           ENUM ('GUEST','GENERAL','ADMIN')     NOT NULL DEFAULT 'GUEST',
    status         ENUM ('ACTIVE','INACTIVE','DELETED') NOT NULL DEFAULT 'ACTIVE',
    activated_at   DATETIME                             NOT NULL,
    deactivated_at DATETIME,
    deleted_at     DATETIME
);


CREATE TABLE drones
(
    drone_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100)                           NOT NULL,
    serial_number  VARCHAR(100)                           NOT NULL,
    user_id        BIGINT                                 NOT NULL,
    status         ENUM ('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    activated_at   DATETIME                               NOT NULL,
    deactivated_at DATETIME,
    deleted_at     DATETIME,
    CONSTRAINT uq_drone_serial_number UNIQUE (serial_number),
    CONSTRAINT fk_drone_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);


CREATE TABLE refresh_tokens
(
    refresh_token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT       NOT NULL UNIQUE,
    token            VARCHAR(512) NOT NULL,
    expires_at       DATETIME     NOT NULL,
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

