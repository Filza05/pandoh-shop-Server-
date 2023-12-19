import { Request, Response } from "express"

export type SignInFormData = {
    email: string,
    username: string,
    password: string
}

export type RequestHandlerFunction = (req: Request, res: Response) => Promise<Response>