import { RowDataPacket } from "mysql2"

export interface User extends RowDataPacket {
    userid: number,
    username: string,
    email: string,
    password: string
}

export interface Product extends RowDataPacket {
    productid?: number,
    productname: string,
    price: Number,
    description: string,
    instock: number,
    category: string,
}