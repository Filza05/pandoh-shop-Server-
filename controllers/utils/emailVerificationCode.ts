import nodemailer from "nodemailer";
import { storeVerificationCodeToDB } from "./HelperFunctions";
import { SignUpFormData } from "../../types/types";
import { getDatabase } from "../../utils/db";

require("dotenv").config();
const db = getDatabase();

const sendVerificationCode = async (
  email: SignUpFormData["email"]
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    console.log(process.env.EMAIL_APP_PASSWORD);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "doritozz349@gmail.com",
        pass: process.env.EMAIL_APP_PASSWORD || "",
      },
    });
    const verificationCode = Math.floor(Math.random() * 900000) + 100000;

    try {
      const mailOptions = {
        from: "doritozz349@gmail.com",
        to: email,
        subject: "Email Verification",
        html: `<p>Your verification code is: <span style="background-color: yellow;">${verificationCode}</span></p>`,
      };

      transporter.sendMail(
        mailOptions,
        async (error: Error | null, info: any) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            console.log("Email sent: " + info.response);
            await storeVerificationCodeToDB(email, verificationCode);
            resolve();
          }
        }
      );
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

export default sendVerificationCode;
