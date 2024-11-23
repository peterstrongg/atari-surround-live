/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_SERVER_URL: "http://localhost:8080",
        WS_SERVER_URL: "ws://localhost:8081",
        BOARD_WIDTH: 25,
        BOARD_HEIGHT: 25,
    }
};

export default nextConfig;
