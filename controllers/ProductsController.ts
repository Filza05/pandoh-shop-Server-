import { getDatabase } from "../utils/db";
import { RequestHandlerFunction } from "../types/types";
import {
  checkProductExists,
  generateInsertQuery,
} from "./utils/HelperFunctions";
import { AddProductFormData } from "../types/types";
import { ResultSetHeader } from "mysql2";
import { Request, Response, NextFunction } from "express";
import { FETCH_PRODUCTS_QUERY } from "../constants/queries";

const db = getDatabase();

//HELPER MIDDLEWARE
export const performProductChecks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const product: AddProductFormData = req.body;

  console.log(product);
  const modifiedProduct = {
    ...product,
    instock: 1,
  };

  req.body.modifiedProduct = modifiedProduct;
  try {
    const productExists = await checkProductExists(modifiedProduct.productname);

    if (productExists) {
      return res.status(400).json({ message: "Product Already Exists" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "could not access database" });
  }
};

//Adding Products in Database
export const AddProduct: RequestHandlerFunction = async (
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

    return res.status(200).send({ message: "Product added Successful"});
  } catch (error) {
    console.error("Couldn't add to database", error);
    return res!.status(500).json({ error: "Couldn't add to database" });
  }
};

//Fetching Products from Database (CACHE FUNCTIONALITY NEEDZ TO BE ADDED PLEASE)
export const FetchProducts: RequestHandlerFunction = async (
  req: Request,
  res: Response
) => {
  try {
    const [result] = await db.query(FETCH_PRODUCTS_QUERY);
    res.status(200).json({ products: result });
  } catch (error) {
    res.status(401).json({ error: "error getting products" });
  }

  return res;
};
