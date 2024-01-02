import express from "express";
import { Router } from "express-serve-static-core";
import {
  UserSignUp,
  UserSignIn,
} from "../controllers/UserAuthenticationController";
import {
  AddProduct,
  FetchProducts,
  performProductChecks
} from "../controllers/ProductsController";
import { upload } from "../multer.config";

const router: Router = express.Router();

//SIGN UP ROUTE
router.post("/sign-up-user", UserSignUp);

//SIGN IN ROUTE
router.post("/sign-in-user", UserSignIn);

//ADD PRODUCTS ROUTE
router.post(
  "/add-product",
  upload.array("images"),
  performProductChecks,
  AddProduct
);

//Fetch all Added Products Route
router.get("/get-products", FetchProducts)

export default router;
