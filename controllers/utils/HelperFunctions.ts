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
  bcrypt.hash(signInFormData.password, 10, (err, hash) => {
    if (err) {
      throw new Error("cannot hash password");
    } else {
      signInFormData.password = hash;
    }
  });

  return signInFormData;
};
