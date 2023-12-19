import { SignUpFormData } from "../../types/types";
import { getDatabase } from "../../utils/db";
import bcrypt from "bcrypt";

const db = getDatabase();

export const checkUsername = async (username: string): Promise<boolean> => {
  const [result] = await db.query("SELECT * FROM users WHERE USERNAME = ?", [
    username,
  ]);

  if ("length" in result && result.length !== 0) {
    return true;
  } else {
    return false;
  }
};

export const checkUserEmail = async (email: string): Promise<boolean> => {
  const [result] = await db.query("SELECT * FROM users WHERE EMAIL = ?", [
    email,
  ]);

  if ("length" in result && result.length !== 0) {
    return true;
  } else {
    return false;
  }
};

export const hashPassword = (
  signInFormData: SignUpFormData
): SignUpFormData => {

  console.log(signInFormData)
  bcrypt.hash(signInFormData.password, 12, (err, hash) => {
    if (err) {
      throw new Error("cannot hash password");
    } else {
      signInFormData.password = hash;
    }
    return signInFormData
  });
  
  /* chat section 
  ab karain
  */

  return signInFormData;
};

export function compareHashedPasswords(enteredPassword: string, storedPassword: string): boolean {
  bcrypt.compare(enteredPassword, storedPassword, (err, isMatch) => {
  if (err) {
    throw new Error("error comparing passwords")
  } else if (isMatch) {
    // Password matches!
    return true
  } else {
    // Password doesn't match!
    return false
  }
  });
  return false;
}