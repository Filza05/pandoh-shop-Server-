import express from "express";
import { Router } from "express-serve-static-core";
import {
  UserSignUp,
  UserSignIn,
} from "../controllers/UserAuthenticationController";
import {
  AddProducts,
  performProductChecks,
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
  performProductChecks,
  upload.array("images"),
  AddProducts
);

export default router;
