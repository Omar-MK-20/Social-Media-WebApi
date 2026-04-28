import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../../app.config.js';
import { UnauthorizedError } from '../res/ResponseError.js';

const client = new OAuth2Client();

export async function verifyGoogleAuth(idToken: string)
{
    try
    {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        return ticket.getPayload();
    } catch (error)
    {
        if (error instanceof Error)
            throw new UnauthorizedError({ message: error.message, info: error });
        throw error;
    }
}