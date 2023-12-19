import express, { Express, Request, Response } from "express";
import cors from "cors";
import router from "./Routes/routes";
import bodyParser from "body-parser";

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(router);
app.use(cors);
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
