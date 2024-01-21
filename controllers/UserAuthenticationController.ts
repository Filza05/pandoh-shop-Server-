import {
  RequestHandlerFunction,
  SignUpFormData,
  UserPayload,
} from "../types/types";
import {
  checkUsername,
  checkUserEmail,
  hashPassword,
  createJWTToken,
  verifyJWTToken,
} from "./utils/HelperFunctions";
import { getDatabase } from "../utils/db";
import { comparePassword } from "./utils/HelperFunctions";
import { User } from "../types/DBTypes";
import sendVerificationCode from "./utils/emailVerificationCode";
import { VerificationCode } from "../types/DBTypes";
import dotenv from "dotenv";
dotenv.config();

const db = getDatabase();

export const PerformSignUpChecks: RequestHandlerFunction = async (req, res) => {
  const user: SignUpFormData = req.body;

  try {
    const userExists = await checkUsername(user.username);
    if (userExists) {
      return res.status(400).json({ error: "User Already Exists" });
    }

    const emailExists = await checkUserEmail(user.email);
    if (emailExists) {
      return res.status(400).json({ error: "email already exists" });
    }

    //WORK IN PROGRESS, NEED TO VERIFY ENTERED VERIFICATION CODE BY USER TO SEE IF CORRECTO OR WRONGO
    try {
      await sendVerificationCode(user.email);
      return res
        .status(200)
        .json({ message: "verification code sent successfully" });
    } catch (error) {
      return res.status(500).json({ message: "error sending email." });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    return res!.status(500).json({ error: "Internal Server Error" });
  }
};

export const UserSignIn: RequestHandlerFunction = async (req, res) => {
  const signInFormData = req.body;

  //CHECKING FOR ADMIN LOGIN
  if (
    signInFormData.email === "admin@admin.com" &&
    signInFormData.password === "admin"
  ) {
    const payload: UserPayload = {
      userid: 0,
      username: "admin",
      email: signInFormData.email,
      isAdmin: true,
    };

    const token = await createJWTToken(payload);
    console.log(token);

    return res
      .cookie("authenticationToken", token, {
        // maxAge: 2000000,
      })
      .status(200)
      .send({
        message: "Sign in successful",
        signedInUser: payload,
      });
  }
  try {
    const emailExists = await checkUserEmail(signInFormData.email);

    if (!emailExists) {
      return res.status(400).json({ error: "User Email not Found" });
    }

    const [result]: any = await db.query<User[]>(
      "SELECT * FROM users WHERE EMAIL = ?",
      [signInFormData.email]
    );

    const user: User = result[0];
    const enteredPass = signInFormData.password;

    const passMatch = await comparePassword(enteredPass, user.password);

    if (passMatch) {
      const payload: UserPayload = {
        userid: user.userid,
        username: user.username,
        email: user.email,
        isAdmin: false,
      };

      const token = await createJWTToken(payload);
      console.log(token);
      return res.cookie("authenticationToken", token, {}).status(200).send({
        message: "Sign in successful",
        signedInUser: payload,
      });
    } else {
      return res.status(409).json({ error: "wrong credentials" });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
  return res.status(200).json({ message: "WHATEVER" });
};

export const handleGoogleSignIn: RequestHandlerFunction = async (req, res) => {
  try {
    const userPayload = req.body;
    const payload: UserPayload = {
      userid: userPayload.id,
      username: userPayload.username,
      email: userPayload.email,
      isAdmin: false,
    };

    const emailExists = await checkUserEmail(payload.email);
    console.log(emailExists);

    if (!emailExists) {
      await db.query(
        "insert into users (USERID ,EMAIL, USERNAME, PASSWORD) values (?,?,?,?)",
        [payload.userid, payload.email, payload.username, "google user"]
      );
    }

    const token = await createJWTToken(payload);

    return res
      .status(200)
      .cookie("authenticationToken", token, {
        httpOnly: true,
        maxAge: 2000000,
      })
      .send({
        message: "Sign in successful",
        signedInUser: payload,
      });
  } catch (error) {
    return res.status(400).json({ error: "error signing in" });
  }
};

export const VerifyEmail: RequestHandlerFunction = async (req, res) => {
  try {
    const [response] = await db.query<
      VerificationCode[]
    >(`SELECT verification_code
    FROM verification_codes
    WHERE user_email = '${req.body.email}';`);

    const verificationCodeInDB = response[0].verification_code;
    if (verificationCodeInDB.toString() === req.body.opt) {
      return res.status(200).json({ message: "user added to DB" });
    } else {
      console.log("wrong otp");
      return res.status(400).json({ error: "wrong otp" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

export const SignUpUser: RequestHandlerFunction = async (req, res) => {
  const user = req.body;
  var hashedUser: SignUpFormData;
  try {
    const hashedPassword = await hashPassword(user.password);

    if (hashedPassword) {
      hashedUser = {
        ...user,
        password: hashedPassword,
      };
    } else {
      return res.status(409).json({ message: "error encrypting password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json("Hashing error");
  }
  await db.query(
    "insert into users (EMAIL, USERNAME, PASSWORD) values (?,?,?)",
    [hashedUser.email, hashedUser.username, hashedUser.password]
  );
  return res.status(200).json({ message: "Registration Successful" });
};

export const VerifyToken: RequestHandlerFunction = async (req, res) => {
  if (req.cookies.authenticationToken) {
    const authToken = req.cookies.authenticationToken;
    console.log(authToken);
    try {
      const decodedData = await verifyJWTToken(
        authToken,
        process.env.TOKEN_KEY as string
      );

      return res.status(200).json({ userData: decodedData });
    } catch (error) {
      return res.status(409).json({ error: "token expired." });
    }
  } else {
    return res.status(400).json({ error: "no authentication cookie." });
  }
};
