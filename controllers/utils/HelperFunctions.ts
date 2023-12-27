import { SignUpFormData } from "../../types/types";
import { getDatabase } from "../../utils/db";
import bcrypt from "bcrypt";
import { User, Product } from "../../types/DBTypes";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { UserPayload, AddProductFormData } from "../../types/types";

dotenv.config();

const db = getDatabase();

export const checkUsername = async (
  username: string
): Promise<boolean> => {
  const [result] = await db.query<User[]>(
    "SELECT * FROM users WHERE USERNAME = ?",
    [username]
  );

  if (result[0]) {
    return true;
  } else {
    return false;
  }
};

export const checkUserEmail = async (email: string): Promise<boolean> => {
  const [result] = await db.query<User[]>(
    "SELECT * FROM users WHERE EMAIL = ?",
    [email]
  );

  if (result[0]) {
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
    const isMatch = await bcrypt.compare(enteredPassword, storedHash);
    return isMatch;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function createJWTToken(user: User) {
  const payload: UserPayload = {
    userid: user.userid,
    username: user.username,
    email: user.email,
  };
  const token = jwt.sign(payload, process.env.TOKEN_KEY as string, {
    expiresIn: "3hr",
  });
  return token;
}

export async function verifyJWTToken(
  token: string,
  secretKey: Secret
): Promise<UserPayload | null> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.error("Error verifying token:", err);
        resolve(null); // Token verification failed
      } else {
        const userPayload = decoded as UserPayload;
        resolve(userPayload); // Token verified successfully
      }
    });
  });
}

export const checkProductExists = async (
  productName: string
): Promise<boolean> => {
  const [result] = await db.query<Product[]>(
    "SELECT * FROM products WHERE productname = ?",
    [productName]
  );

  if (result[0]) {
    return true;
  } else {
    return false;
  }
};

export const generateInsertQuery = (
  insertId: Number,
  imagesArray: Express.Multer.File[]
): string => {
  const query = `INSERT INTO product_images (product_id, imageURL) VALUES
  ${imagesArray.map((imageObj, index) => {
    return `(${insertId}, ${imageObj.path})${
      index == imagesArray.length - 1 ? ";" : ","
    }`;
  })}
  `;

  return query;
};
