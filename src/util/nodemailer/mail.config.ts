import fs from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { GOOGLE_APP_PASSWORD, GOOGLE_NODEMAILER_USER } from "../../app.config.js";
import { ResponseError } from "../res/ResponseError.js";
import type { OtpTypesEnum } from "../enums/otp.enums.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: GOOGLE_NODEMAILER_USER,
        pass: GOOGLE_APP_PASSWORD
    },
});


export async function sendMail({ email, username, reason, otp }: { email: string; username: string; reason: OtpTypesEnum; otp: string; })
{
    try
    {
        const htmlFilePath = path.resolve("src/util/nodemailer/mailTemplate.html");

        let htmlFileContent = await fs.readFile(htmlFilePath, "utf-8");

        htmlFileContent = htmlFileContent.replace("[username]", username);
        htmlFileContent = htmlFileContent.replace("[reason]", reason);
        htmlFileContent = htmlFileContent.replace("[otp]", otp);

        const subject = reason.split(" ").map(word => word.slice(0, 1).toUpperCase() + word.slice(1)).join(" ");

        const info = await transporter.sendMail({
            from: '"Social Media Team" <info@SocialMedia.com>',
            to: email,
            subject: subject,
            html: htmlFileContent,
        });

    }
    catch (err)
    {
        throw new ResponseError("Error while sending mail", 500, { err });
    }
}