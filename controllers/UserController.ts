import { ResultSetHeader } from "mysql2";
import { generateInsertAddressQuery } from "../constants/queries";
import { Address } from "../types/DBTypes";
import { getDatabase } from "../utils/db";
import { Request, Response } from "express";
import {
  generateCurrentAddressQuery,
  generateInsertInCurrentAddressQuery,
} from "../utils/generateQueries";

const db = getDatabase();

export const AddUserAddress = async (req: Request, res: Response) => {
  const userid: number = Number(req.params.userid);
  const address: Address = req.body;

  try {
    const [response] = await db.query<ResultSetHeader>(
      generateInsertAddressQuery(address, userid)
    );

    const insertId = response.insertId;
    await db.query(generateInsertInCurrentAddressQuery(insertId, userid));
    return res.status(200).json({ message: "address updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const GetUserAddress = async (req: Request, res: Response) => {
  const userid = req.params.userid;

  try {
    const [response] = await db.query<Address[]>(
      generateCurrentAddressQuery(Number(userid))
    );

    return res.status(200).json({ address: response[0] });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};
