import { RequestHandlerFunction, SignInFormData } from "../types/types";
import { getDatabase } from "../utils/db";
import { initializeDatabase } from "../utils/db";
import bcrypt from "bcrypt"

initializeDatabase()
const db = getDatabase()

export const UserSignUp: RequestHandlerFunction = async (req, res) => {
    const user: SignInFormData = req.body;
    try {
        const [result] = await db.query("SELECT * FROM users WHERE USERNAME = ?", [user.username]);

        if ('length' in result && result.length !== 0) {
            return res!.status(400).json({ error: 'User already exists' });
        }
    } catch (error) {
        console.error("Error querying the database:", error);
        return res!.status(500).json({ error: 'Internal Server Error' });
    }

    try {
        const [result] = await db.query("SELECT * FROM users WHERE EMAIL = ?", [user.email]);

        if ('length' in result && result.length !== 0) {
            return res!.status(400).json({ error: 'Email already exists' });
        }
    } catch (error) {
        console.error("Error querying the database:", error);
        return res!.status(500).json({ error: 'Internal Server Error' });
    }

    try {
        await db.query(
            "insert into user (EMAIL, USERNAME, PASSWORD) values (?)",
            [user]
        );
        alert("SUCCESSFULLY REGISTERED")
        return res.status(200).json({ message: 'Registration Successful' })
    } catch (error) {
        console.error("Error querying the database:", error);
        return res!.status(500).json({ error: 'Internal Server Error' });
    }

}

export const UserSignIn: RequestHandlerFunction = async (req, res) => {
    const user = req.body;
    console.log(user)
    try {
        const [result] = await db.query("SELECT * FROM users WHERE USERNAME = ?", [user.username]);
      
        if ('length' in result && result.length === 0) {
          console.log("check 1");
          return res.status(400).json({ error: 'User not found' });
        }
      
      } catch (error) {
        console.error("Error querying the database:", error);
        console.log("POINT 1")

        res.status(500).json({ error: 'Internal Server Error' });
      }

    try {
        const userPassDB = await db.query("SELECT PASSWORD FROM users WHERE USERNAME = ?", [user.username]);
        console.log(userPassDB)
        const enteredPass = user.password;

    } catch (error) {
        console.error("Error querying the database:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log("POINT 2")
    return res.status(500).json({ error: 'Internal Server Error' })
}
