import { RequestHandlerFunction, SignUpFormData } from "../types/types";
import {
    checkUsername,
    checkUserEmail,
    hashPassword,
} from "./utils/HelperFunctions";
import { getDatabase } from "../utils/db";
import bcrypt from "bcrypt"
import { compareHashedPasswords } from "./utils/HelperFunctions";

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
        await db.query("insert into users (EMAIL, USERNAME, PASSWORD) values (?,?,?)", [
            hashedUser.email,
            hashedUser.username,
            hashedUser.password
        ]);
        return res.status(200).json({ message: "Registration Successful" });
    } catch (error) {
        console.error("Error querying the database:", error);
        return res!.status(500).json({ error: "Internal Server Error" });
    }
};
/* chat section
   REQ BHEJAIN FATTOOO bheji he, CHAL RAHA HA ??, RES AA RAHA?? user signed in arha
   MATLAB PASSWORD MATCH NAI HUA??? jii...JIJI AP YE BATAIN PASSWORD APNE SAI DALA HA??exactly wuhy cheez he bss username wali field mita di thi mottu
   MATLAB USKO IF MA JANA CHAIYE THA??

   NAYA USER REGISTER KRKE TRY KARAIN okk phrr whatever aara, hmmmm acha debug krwain zara
   REQ BHEJAIN whatever ohhhhhhhh motttuuuuuuuuuuuuu, ye db me pass hash hi nai hua bhaeeee
*/


export const UserSignIn: RequestHandlerFunction = async (req, res) => {
    const user = req.body;
    console.log(user)
    try {
        const emailExists = await checkUserEmail(user.email);

        if (!emailExists) {
            return res.status(400).json({ error: "User Email not Found" });
        }

        const [result]: any = await db.query(
            "SELECT PASSWORD FROM users WHERE EMAIL = ?",
            [user.email]
        );
        
        console.log(result[0].PASSWORD)
        const enteredPass = user.password;
        const passMatch = compareHashedPasswords(enteredPass, result[0].PASSWORD)

        console.log(passMatch)
        if (passMatch) { 
            return res.status(200).json({message: "succesfully signed in"})
        }
    } catch (error) {
        console.error("Error querying the database:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json({ message: "WHATEVER" });
};
