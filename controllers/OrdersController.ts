import { Response, Request } from "express";
import { stripe } from "../stripe";
import { getDatabase } from "../utils/db";
import { ResultSetHeader } from "mysql2";
import { insertProductsInOrderQuery } from "./utils/HelperFunctions";
import { FETCH_ALL_ORDERS_QUERY } from "../constants/queries";
import { Order } from "../types/DBTypes";
import { generateGetUserOrderQuery } from "../utils/generateQueries";
import { removeExtraAttributesFromProducts } from "./utils/HelperFunctions";

const db = getDatabase();

export const handleSuccesfulPayment = async (req: Request, res: Response) => {
  const {
    type,
    data: {
      object: { id: sessionId },
    },
  } = req.body;

  if (type === "checkout.session.completed") {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const metaData = session.metadata!;
    const totalAmountPaid = session.amount_total;

    const parsedProducts = JSON.parse(metaData.products);
    const userid = metaData.userid;
    const addressid = metaData.addressid;

    try {
      const response = await db.query<ResultSetHeader>(
        `insert into orders (USERID, TOTAL_PRICE, ADDRESS) values (?,?,?)`,
        [userid, totalAmountPaid, addressid]
      );
      const data: ResultSetHeader = response[0];

      const insertQuery = insertProductsInOrderQuery(
        data.insertId,
        parsedProducts
      );

      await db.query(insertQuery);
      return res.status(200).json({ message: "order added succesfully" });
    } catch (error) {
      console.log(error);
    }
  }
};

export const createStripeCheckoutSession = async (
  req: Request,
  res: Response
) => {
  const { products, userId, addressid } = req.body;

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
        addressid: addressid,
      },
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/pages/order-placed-success`,
      cancel_url: `${process.env.CLIENT_URL}/pages/payment-failed`,
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Can't process payment" });
  }
};

export const addOrderInDB = async (req: Request, res: Response) => {
  const totalAmountPaid = req.body.total_amount;
  const userid = req.params.userid;
  const products = req.body.products;
  const addressid = req.body.addressid;

  try {
    const response = await db.query<ResultSetHeader>(
      `insert into orders (USERID, TOTAL_PRICE, ADDRESS) values (?,?,?)`,
      [userid, totalAmountPaid * 100, addressid]
    );
    const data: ResultSetHeader = response[0];

    const insertQuery = insertProductsInOrderQuery(data.insertId, products);

    await db.query(insertQuery);
    return res.status(200).json({ message: "order added succesfully" });
  } catch (error) {
    return res.status(400).json({ message: "internal server error" });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const [result] = await db.query<Order[]>(FETCH_ALL_ORDERS_QUERY);
    return res.status(200).json({ orders: result });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Error fetching orders" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const orderId = parseInt(req.params.orderid);
  const newStatus = req.body.status;

  try {
    let response = db.query<ResultSetHeader>(
      `UPDATE orders SET status = ? WHERE orderid = ?;
  `,
      [newStatus, orderId]
    );

    return res
      .status(200)
      .json({ message: "order status updated succesfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "could not access database" });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const userOrdersQuery = generateGetUserOrderQuery(userId);
  try {
    const [response] = await db.query<Order[]>(userOrdersQuery);
    return res.status(200).json({ userOrders: response });
  } catch (error) {
    return res.status(400).json({ error: "could'nt fetch data" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  const orderid = parseInt(req.params.orderid);
  try {
    await db.query(`DELETE FROM orders WHERE orderid = ${orderid}`);
    return res.status(200).json({ message: "order has been deleted." });
  } catch (error) {
    return res.status(400).json({ error: "something went wrong" });
  }
};
