import { RequestHandlerFunction, SignUpFormData } from "../types/types";
import {
  checkUsername,
  checkUserEmail,
  hashPassword,
} from "./utils/HelperFunctions";
import { getDatabase } from "../utils/db";
import { comparePassword } from "./utils/HelperFunctions";

const db = getDatabase();

export const UserSignUp: RequestHandlerFunction = async (req, res) => {
  const user: SignUpFormData = req.body;
  try {
    const userExists = await checkUsername(user.username);
    if (userExists) {
      return res.status(400).json({ error: "User Already Exists" });
    }
    console.log("POINT 1");

    const emailExists = await checkUserEmail(user.email);
    if (emailExists) {
      return res.status(400).json({ error: "email already exists" });
    }
    console.log("POINT 2");

    var hashedUser: SignUpFormData;
    try {
      const hashedPassword = await hashPassword(user.password);

      if (hashedPassword) {
        hashedUser = {
          ...user,
          password: hashedPassword,
        };

        console.log(hashedUser);
        await db.query(
          "insert into users (EMAIL, USERNAME, PASSWORD) values (?,?,?)",
          [hashedUser.email, hashedUser.username, hashedUser.password]
        );
      } else {
        return res.status(409).json({ message: "error encrypting password" });
      }

      return res.status(200).json({ message: "Registration Successful" });
    } catch (error) {
      console.log(error);
      return res.status(400).json("Hashing error");
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    return res!.status(500).json({ error: "Internal Server Error" });
  }
};
/* chat section
 */

export const UserSignIn: RequestHandlerFunction = async (req, res) => {
  const user = req.body;
  console.log(user);
  try {
    const emailExists = await checkUserEmail(user.email);

    if (!emailExists) {
      return res.status(400).json({ error: "User Email not Found" });
    }

    const [result]: any = await db.query(
      "SELECT PASSWORD FROM users WHERE EMAIL = ?",
      [user.email]
    );

    console.log(result[0].PASSWORD);
    const enteredPass = user.password;
    const passMatch = await comparePassword(enteredPass, result[0].PASSWORD);

    if (passMatch) {
      return res.status(200).json({ message: "succesfully signed in" });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
  return res.status(200).json({ message: "WHATEVER" });
};
