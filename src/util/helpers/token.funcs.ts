export function blockedTokenKey(userId: string, tokenId: string)
{
    return `Blocked:${userId}:${tokenId}`;
}