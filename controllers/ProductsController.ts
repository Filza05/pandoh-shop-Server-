import { getDatabase } from "../utils/db";
import { RequestHandlerFunction } from "../types/types";
import {
  checkProductExists,
  generateImagesInsertQuery,
} from "./utils/HelperFunctions";
import { AddProductFormData } from "../types/types";
import { ResultSetHeader } from "mysql2";
import { Request, Response, NextFunction } from "express";
import { FETCH_PRODUCTS_QUERY } from "../constants/queries";
import { stripe } from "../stripe";
import { removeExtraAttributesFromProducts } from "./utils/HelperFunctions";
import { generateFetchReviewsQuery } from "../utils/generateQueries";

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
      const insertImageQuery = generateImagesInsertQuery(
        data.insertId,
        uploadedImages
      );

      db.query(insertImageQuery);
    }

    return res.status(200).send({ message: "Product added Successful" });
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

export const createStripeCheckoutSession = async (
  req: Request,
  res: Response
) => {
  const { products } = req.body;
  const { userId } = req.body;

  const lineItems = products.map((product: any) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.productname,
          description: product.description,
          // images: [`http://localhost:4000/${product.images[0].image_url}`],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity,
    };
  });

  const productsData = removeExtraAttributesFromProducts(products);

  try {
    const session = await stripe.checkout.sessions.create({
      metadata: {
        products: JSON.stringify(productsData),
        userid: userId,
      },
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://whatever.com",
      cancel_url: "http://whatever.com",
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Can't process payment" });
  }
};
//Updating Products in database
export const UpdateProduct: RequestHandlerFunction = async (
  req: Request,
  res: Response
) => {
  const productid = parseInt(req.params.productid);
  const newInStock = req.body.newInstock;
  try {
    let response = db.query<ResultSetHeader>(
      `UPDATE products SET instock = ? WHERE productid = ?;
  `,
      [newInStock, productid]
    );

    return res
      .status(200)
      .json({ message: "Product Stock Updated Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "could not access database" });
  }
};

export const DeleteProduct: RequestHandlerFunction = async (
  req: Request,
  res: Response
) => {
  const productid = parseInt(req.params.productid);
  try {
    db.query(`DELETE FROM products WHERE productid = ${productid};`);
    return res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: "error deleting the product" });
  }
};

export const AddUserReview: RequestHandlerFunction = async (
  req: Request,
  res: Response
) => {
  const body = req.body;
  const userid = req.params.userid;

  try {
    await db.query(
      `INSERT INTO user_reviews (user_id, product_id, review, rating) VALUES (${userid}, ${body.productid}, '${body.text}', ${body.rating});`
    );

    return res.status(200).json({ message: "review added" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "couldn't add review" });
  }
};

export const GetProductReviews: RequestHandlerFunction = async (
  req: Request,
  res: Response
) => {
  const { productid } = req.params;

  try {
    const [response] = await db.query(generateFetchReviewsQuery(productid));
    console.log(response);
    return res.status(200).json({ reviews: response });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "could'nt get reviews" });
  }
};
