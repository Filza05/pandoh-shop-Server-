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

export type UserPayload = {
  userid: number;
  username: string;
  email: string;
  isAdmin: boolean;
};

export type AddProductFormData = {
  productname: string;
  description: string;
  price: Number;
  category: string;
  images: FileList | null;
};

export type Address = {
  address: string;
  city: string;
  state: string;
  zipCode: number;
  phoneNumber: number;
  country: string;
};
