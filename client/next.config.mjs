/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_SERVER_URL: "http://192.168.0.11:8080",
        WS_SERVER_URL: "ws://192.168.0.11:8081",
        BOARD_WIDTH: 25,
        BOARD_HEIGHT: 25,
        PA_START_X: 7,
        PA_START_Y: 11,
        PB_START_X: 17,
        PB_START_Y: 11
    }
};

export default nextConfig;
