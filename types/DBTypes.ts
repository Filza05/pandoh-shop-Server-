import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
  userid: number;
  username: string;
  email: string;
  password: string;
}

export interface Product extends RowDataPacket {
  productid?: number;
  productname: string;
  price: Number;
  description: string;
  instock: number;
  category: string;
}

export interface Order extends RowDataPacket {
  username: string;
  email: string;
  orderid: number;
  userid: number;
  order_date: Date;
  total_price: number;
  status: string;
  order_items: OrderItem[];
}

type OrderItem = {
  price: number;
  images: string[];
  quantity: number;
  product_id: number;
  description: string;
  product_name: string;
};
