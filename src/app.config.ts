import dotenv from 'dotenv';
import path from 'node:path';


dotenv.config({ path: path.resolve("./config/.env.dev") });

export const SEVER_PORT = process.env.SEVER_PORT as string;
export const DB_URI = process.env.DB_URI as string;
export const DB_URI_FALLBACK = process.env.DB_URI_FALLBACK as string;
export const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY as string;
export const TOKEN_SIGNATURE_ADMIN_ACCESS = process.env.TOKEN_SIGNATURE_ADMIN_ACCESS as string;
export const TOKEN_SIGNATURE_USER_ACCESS = process.env.TOKEN_SIGNATURE_USER_ACCESS as string;
export const TOKEN_SIGNATURE_ADMIN_REFRESH = process.env.TOKEN_SIGNATURE_ADMIN_REFRESH as string;
export const TOKEN_SIGNATURE_USER_REFRESH = process.env.TOKEN_SIGNATURE_USER_REFRESH as string;
export const ALGORITHM = process.env.ALGORITHM as string;
// export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID  as string;
// export const GOOGLE_NODEMAILER_USER = process.env.GOOGLE_NODEMAILER_USER;
// export const GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD;