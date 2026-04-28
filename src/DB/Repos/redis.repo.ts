import type { RedisVariadicArgument } from "@redis/client/dist/lib/commands/generic-transformers.js";
import type { RedisArgument, RedisClientType } from "redis";
import { redisClient } from "../redis.connection.js";

class RedisRepo 
{
    // protected Client: RedisClientType;

    constructor()
    {
        // redisClient = client;
    }

    async set({ key, value, exType = "EX", exValue = 120 }:
        { key: RedisArgument, value: number | RedisArgument, exType?: 'EX' | 'PX' | 'EXAT' | 'PXAT', exValue?: number; })
    {
        return await redisClient.set(key, value, { expiration: { type: exType, value: exValue } });
    }

    async get(key: RedisArgument)
    {
        return await redisClient.get(key);
    }

    async ttl(key: RedisArgument)
    {
        return await redisClient.ttl(key);
    }

    async exists(key: RedisVariadicArgument)
    {
        return await redisClient.exists(key);
    }

    async del(keys: RedisVariadicArgument)
    {
        return await redisClient.del(keys);
    }

    async update(key: RedisArgument, value: number | RedisArgument)
    {
        if (!(this.exists(key))) return 0;

        await redisClient.set(key, value);
        return 1;
    }

}


export default new RedisRepo();