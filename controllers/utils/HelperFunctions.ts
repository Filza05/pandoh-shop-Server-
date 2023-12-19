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

export async function hashPassword(
  password: string,
  saltRounds: number = 10
): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

export async function comparePassword(
  enteredPassword: string,
  storedHash: string
): Promise<boolean> {
  try {
    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(enteredPassword, storedHash);
    return isMatch;
  } catch (error) {
    console.error(error); // Handle any errors during comparison
    return false; // Return false in case of errors
  }
}
