import { RowDataPacket } from "mysql2"

export interface User extends RowDataPacket {
    userid: number,
    username: string,
    email: string,
    password: string
}