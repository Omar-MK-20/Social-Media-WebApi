import cors from "cors";
import express from 'express';
import { REDIS_URL, SEVER_PORT } from './app.config.js';
import { testDBConnection } from './DB/Connection.js';
import { redisClient, testRedisConnection } from "./DB/Redis/redis.connection.js";
import { authRouter } from './Modules/Auth/auth.controller.js';
import { userRouter } from './Modules/User/user.controller.js';
import { errorMiddleware } from './util/middlewares/error.middleware.js';
import { notFoundRoute } from './util/middlewares/notFound.middleware.js';
import type { TExpress } from "./util/types/express.types.js";


export async function bootstrap(server: TExpress)
{

    await testDBConnection();
    await testRedisConnection();

    if (REDIS_URL.includes("127.0.0.1"))
    {
        setInterval(async () =>
        {
            try
            {
                await redisClient.ping();
                console.log("PING OK");
            } catch (err)
            {
                console.log("Ping failed:", err);
            }
        }, 5000);
    }

    server.use(cors());

    server.use(express.json());

    server.get("/", (req, res) => { res.json({ message: "Hello from Social Media Web API" }); });

    server.use("/auth", authRouter);
    server.use("/user", userRouter);


    server.use(errorMiddleware);

    server.use(notFoundRoute);

    if (!process.env.VERCEL)
    {
        server.listen(SEVER_PORT, () =>
        {
            console.log(`:: Server is running on port :: ${SEVER_PORT} ::`);
        });
    }

    return server;
}