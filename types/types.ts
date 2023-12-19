import { Request, Response } from "express";

export type SignUpFormData = {
  email: string;
  username: string;
  password: string;
};

export type RequestHandlerFunction = (
  req: Request,
  res: Response
) => Promise<Response>;
