# 프런트엔드 멀티스테이지: build → nginx 경량 런타임

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# 빌드시 API 기본 URL은 nginx에서 /api 프록시를 사용하므로 빈 값으로 둠
ENV VITE_API_BASE_URL=""
# vite를 직접 호출하여 dist 생성 보장
RUN node node_modules/vite/bin/vite.js build -d dist

FROM nginx:alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


