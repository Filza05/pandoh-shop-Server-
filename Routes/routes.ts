import express, { Request, Response } from "express";
import { Router } from "express-serve-static-core";

const router: Router = express.Router()

router.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
  });

export default router;



