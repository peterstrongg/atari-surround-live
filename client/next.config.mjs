/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_SERVER_URL: "http://localhost:8080",
        WS_SERVER_URL: "ws://localhost:8081",
        BOARD_WIDTH: 20,
        BOARD_HEIGHT: 10,
    }
};

export default nextConfig;
