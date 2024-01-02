import express, { Express, Request, Response } from "express";
import cors from "cors";
import router from "./Routes/routes";
import bodyParser from "body-parser";
import multer from "multer";

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET, POST",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(router);
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
