import { RequestHandlerFunction, SignUpFormData } from "../types/types";
import {
  checkUsername,
  checkUserEmail,
  hashPassword,
} from "./utils/HelperFunctions";
import { getDatabase } from "../utils/db";
import { SignKeyObjectInput } from "crypto";

const db = getDatabase();

export const UserSignUp: RequestHandlerFunction = async (req, res) => {
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

    var hashedUser: SignUpFormData;
    try {
      hashedUser = hashPassword(user);
    } catch (error) {
      return res.status(400).json("Hashing error");
    }

    //INSERTING USER INTO DB
    await db.query("insert into user (EMAIL, USERNAME, PASSWORD) values (?)", [
      hashedUser,
    ]);
    return res.status(200).json({ message: "Registration Successful" });
  } catch (error) {
    console.error("Error querying the database:", error);
    return res!.status(500).json({ error: "Internal Server Error" });
  }
};

export const UserSignIn: RequestHandlerFunction = async (req, res) => {
  const user = req.body;
  console.log(user);
  try {
    const emailExists = await checkUserEmail(user.email);

    if (!emailExists) {
      return res.status(400).json({ error: "User Email not Found" });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }

  try {
    const userPassDB = await db.query(
      "SELECT PASSWORD FROM users WHERE USERNAME = ?",
      [user.username]
    );
    const enteredPass = user.password;
  } catch (error) {
    console.error("Error querying the database:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  console.log("POINT 2");
  return res.status(500).json({ error: "Internal Server Error" });
};
