import express, { Express, Request, Response } from "express";
import cors from "cors";
import router from "./Routes/routes";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(router)
app.use(cors)
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});