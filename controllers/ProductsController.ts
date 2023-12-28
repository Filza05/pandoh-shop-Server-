import { getDatabase } from "../utils/db";
import { RequestHandlerFunction } from "../types/types";
import {
  checkProductExists,
  generateInsertQuery,
} from "./utils/HelperFunctions";
import { AddProductFormData } from "../types/types";
import { ResultSetHeader } from "mysql2";
import { Request, Response, NextFunction } from "express";
const db = getDatabase();

//HELPER MIDDLEWARE
export const performProductChecks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const product: AddProductFormData = req.body;

  const modifiedProduct = {
    ...product,
    instock: 1,
  };

  req.body.modifiedProduct = modifiedProduct;
  try {
    const productExists = await checkProductExists(
      modifiedProduct.productname
    );

    if (!productExists) {
      return res.status(400).json({ message: "Product Already Exists" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "could not access database" });
  }
};

export const AddProducts: RequestHandlerFunction = async (
  req: Request,
  res: Response
) => {
  const modifiedProduct = req.body.modifiedProduct;
  const uploadedImages = req.files;

  try {
    let response = await db.query<ResultSetHeader>(
      "insert into products (PRODUCTNAME, PRICE, INSTOCK, DESCRIPTION, CATEGORY) values (?,?,?,?,?)",
      [
        modifiedProduct.productname,
        modifiedProduct.price,
        modifiedProduct.instock,
        modifiedProduct.description,
        modifiedProduct.category,
      ]
    );
    const data: ResultSetHeader = response[0];

    if (uploadedImages && Array.isArray(uploadedImages)) {
      const insertImageQuery = generateInsertQuery(
        data.insertId,
        uploadedImages
      );

      db.query(insertImageQuery);
    }

    return res.status(200).json({ message: "Product added Successful" });
  } catch (error) {
    console.error("Couldn't add to database", error);
    return res!.status(500).json({ error: "Could'nt add to database" });
  }
};
