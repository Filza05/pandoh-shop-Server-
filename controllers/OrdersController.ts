import { Response, Request } from "express";
import { stripe } from "../stripe";
import { getDatabase } from "../utils/db";
import { ResultSetHeader } from "mysql2";
import { insertProductsInOrderQuery } from "./utils/HelperFunctions";
import { FETCH_ALL_ORDERS_QUERY } from "../constants/queries";
import { Order } from "../types/DBTypes";

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

    try {
      const response = await db.query<ResultSetHeader>(
        `insert into orders (USERID, TOTAL_PRICE) values (?,?)`,
        [userid, totalAmountPaid]
      );
      const data: ResultSetHeader = response[0];

      const insertQuery = insertProductsInOrderQuery(
        data.insertId,
        parsedProducts
      );

      db.query(insertQuery);

      return res.status(200).json({ message: "order added succesfully" });
    } catch (error) {
      console.log(error);
    }
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
