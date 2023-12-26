import express from "express";
import { Router } from "express-serve-static-core";
import { UserSignUp, UserSignIn } from "../controllers/UserAuthenticationController";
import { AddProducts } from "../controllers/ProductsController";


const router: Router = express.Router()
//SIGN UP ROUTE
router.post("/sign-up-user", UserSignUp);

//SIGN IN ROUTE
router.post("/sign-in-user", UserSignIn);

//ADD PRODUCTS ROUTE
router.post("/add-product", AddProducts )


export default router;



