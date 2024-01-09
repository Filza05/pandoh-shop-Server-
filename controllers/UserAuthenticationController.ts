import { RequestHandlerFunction, SignUpFormData } from "../types/types";
import {
  checkUsername,
  checkUserEmail,
  hashPassword,
  createJWTToken,
} from "./utils/HelperFunctions";
import { getDatabase } from "../utils/db";
import { comparePassword } from "./utils/HelperFunctions";
import { User } from "../types/DBTypes";
import sendVerificationCode from "./utils/emailVerificationCode";

const db = getDatabase();

export const UserSignUp: RequestHandlerFunction = async (req, res) => {
  const user: SignUpFormData = req.body;
  console.log(user);
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
      res.status(201).json({ message: "verification code sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "internal server error" });
    }

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
  } catch (error) {
    console.error("Error querying the database:", error);
    return res!.status(500).json({ error: "Internal Server Error" });
  }
};

export const UserSignIn: RequestHandlerFunction = async (req, res) => {
  const signInFormData = req.body;
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
      const token = createJWTToken(user);
      return res
        .status(200)
        .cookie("authenticationToken", token, {
          httpOnly: true,
          maxAge: 2000000,
        })
        .send({
          message: "Sign in successful",
          signedInUser: {
            username: user.username,
            userId: user.userid,
            email: user.email,
          },
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
