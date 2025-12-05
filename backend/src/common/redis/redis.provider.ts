import { Provider } from "@nestjs/common";
import Redis from "ioredis";
require('dotenv').config();

export const RedisProvider: Provider = {
    provide: 'REDIS',
    useFactory: () => {
        const client = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            connectTimeout: 300,
            maxRetriesPerRequest: 0,
            retryStrategy(times) {
                const delay = 500;
                return delay;
            },
        });

        client.on("connect", () => {
            console.log("[Redis] Connected");
        });

        client.on("ready", () => {
            console.log("[Redis] Ready to use");
        });

        client.on("error", (err) => {
            console.error("[Redis Error] =>", err.message);

        });

        client.on("reconnecting", () => {
            console.warn("[Redis] Reconnecting...");
        });

        client.on("end", () => {
            console.warn("[Redis] Connection closed");
        });

        return client;
    },
};