export function blockedTokenKey(userId: string, tokenId: string)
{
    return `Token:${userId}:${tokenId}:Blocked`;
}