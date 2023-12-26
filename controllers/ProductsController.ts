import { getDatabase } from "../utils/db";
import { RequestHandlerFunction } from "../types/types";
import { checkProductExists } from "./utils/HelperFunctions";
import { AddProductFormData } from "../types/types";
import { error } from "console";
import { ResultSetHeader } from "mysql2";
const db = getDatabase();

export const AddProducts: RequestHandlerFunction = async (req, res) => {
    const product: AddProductFormData = req.body

    const modifiedProduct = {
        ...product,
        instock: 1
    }

    try {
        const productExists = await checkProductExists(modifiedProduct.productname)
        if (productExists) {
            return res.status(400).json({ message: "Product Already Exists" })
        }

        try {
            let response =  await db.query<ResultSetHeader>(
                "insert into products (PRODUCTNAME, PRICE, INSTOCK, DESCRIPTION, CATEGORY) values (?,?,?,?,?)",
                [modifiedProduct.productname, modifiedProduct.price, modifiedProduct.instock, modifiedProduct.description, modifiedProduct.category]
            );
            const data: ResultSetHeader = response[0]
            console.log(data.insertId)

            return res.status(200).json({ message: "Registration Successful" });
        } catch {
            console.error("Couldn't add to database", error);
            return res!.status(500).json({ error: "Internal Server Error" });
        }

    } catch (error) {
        console.error("Error querying the database:", error);
        return res!.status(500).json({ error: "Internal Server Error" });
    }
}