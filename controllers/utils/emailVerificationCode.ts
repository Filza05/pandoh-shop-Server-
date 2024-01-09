import nodemailer from "nodemailer";
import { SignUpFormData } from "../../types/types";
import { getDatabase } from "../../utils/db";

require("dotenv").config();
const db = getDatabase();

const sendVerificationCode = async (
  email: SignUpFormData["email"]
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "doritozz807@gmail.com",
        pass: process.env.EMAIL_APP_PASSWORD || "",
      },
    });
    const verificationCode = Math.floor(Math.random() * 900000) + 100000;

    try {
      try {
        const updateQuery = await db.query(
          `
        UPDATE pandoh_shop.users
        SET verificationcode = ?
        WHERE email = ?;
      `,
          [verificationCode, email]
        );
        console.log("Verification code added to the database successfully");
      } catch (err) {
        console.error("Couldn't add to the database", err);
      }

      const mailOptions = {
        from: "doritozz807@gmail.com",
        to: email,
        subject: "Email Verification",
        html: `<p>Your verification code is: <span style="background-color: yellow;">${verificationCode}</span></p>`,
      };

      transporter.sendMail(mailOptions, (error: Error | null, info: any) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          console.log("Email sent: " + info.response);
          resolve();
        }
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

export default sendVerificationCode;
