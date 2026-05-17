import { createClient } from "redis";
import { REDIS_URL } from "../../app.config.js";

let DBName: string;
if (REDIS_URL.includes("127.0.0.1")) DBName = "Redis Local DB";
else DBName = "Redis Remote DB";

export const redisClient = createClient({
    url: REDIS_URL,
    socket: {
        keepAlive: true,
        reconnectStrategy: (retries) =>
        {
            console.log("Retry attempt:", retries);
            return Math.min(retries * 100, 3000);
        }
    }
});


redisClient.on("error", (err) => { console.log(err); });
redisClient.on("end", () => { console.log("Redis ended from event "); });
redisClient.on("reconnecting", () => { console.log("Redis reconnecting from event "); });


export async function testRedisConnection()
{
    try
    {
        await redisClient.connect();
        console.log(`:: ${DBName} connected ::`);
    }
    catch (error)
    {
        console.log("Redis DB connection failed", error);
    }

}
