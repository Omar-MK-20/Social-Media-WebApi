export function blockedTokenKey(userId: string, tokenId?: string)
{
    if (!tokenId) return `Token:${userId}:*`
    return `Token:${userId}:${tokenId}:Blocked`;
}