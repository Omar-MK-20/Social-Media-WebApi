import express from 'express';
import { SEVER_PORT } from './app.config.js';
import { authRouter } from './Modules/Auth/auth.controller.js';
import { testDBConnection } from './DB/Connection.js';
import { notFoundRoute } from './util/middlewares/notFound.middleware.js';
import { errorMiddleware } from './util/middlewares/error.middleware.js';

export async function bootstrap()
{

    await testDBConnection();

    const server = express();

    // server.use(cors());

    server.use(express.json());

    server.get("/", (req, res) => { res.json({ message: "Hello from Social Media Web API" }); });

    server.use("/auth", authRouter);


    server.use(errorMiddleware);

    server.use(notFoundRoute);

    if (!process.env.VERCEL)
    {
        server.listen(SEVER_PORT, () =>
        {
            console.log(`Server is running on port :: ${SEVER_PORT}`);
        });
    }

    return server;
}