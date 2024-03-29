import { getDatabase } from "../../utils/db";
import bcrypt from "bcrypt";
import { User, Product } from "../../types/DBTypes";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import { UserPayload } from "../../types/types";

dotenv.config();
const db = getDatabase();

export const checkUsername = async (username: string): Promise<boolean> => {
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

export async function createJWTToken(payload: UserPayload) {
  console.log(process.env.TOKEN_KEY);
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
        reject(); // Token verification failed
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

export const generateImagesInsertQuery = (
  insertId: Number,
  imagesArray: Express.Multer.File[]
): string => {
  const query = `INSERT INTO product_images (product_id, imageURL) VALUES
  ${imagesArray.map((imageObj, index) => {
    let imagePath = imageObj.path;
    imagePath = imagePath.replace(/\\/g, "/");
    return `(${insertId}, '${imagePath}')${
      index + 1 == imagesArray.length ? ";" : ""
    }`;
  })}
  `;

  return query;
};

export function removeExtraAttributesFromProducts(products: Product[]) {
  return products.map(({ productid, quantity }) => ({ productid, quantity }));
}

export const insertProductsInOrderQuery = (
  orderId: number,
  products: { productid: number; quantity: number }[]
) => {
  const query = `INSERT INTO order_items (orderid, productid, quantity) VALUES ${products.map(
    (product) => {
      return `(${orderId}, ${product.productid}, ${product.quantity})`;
    }
  )};`;

  return query;
};

export const storeVerificationCodeToDB = async (
  email: string,
  verificationCode: number
) => {
  await db.query(`INSERT INTO pandoh_shop.verification_codes (user_email, verification_code)
  VALUES ('${email}', ${verificationCode})
  ON DUPLICATE KEY UPDATE verification_code = VALUES(verification_code);
`);
};
