import express from "express";
import { Router } from "express-serve-static-core";
import {
  UserSignUp,
  UserSignIn,
} from "../controllers/UserAuthenticationController";
import {
  AddProduct,
  FetchProducts,
  performProductChecks,
  UpdateProduct,
} from "../controllers/ProductsController";
import { upload } from "../multer.config";
import { createStripeCheckoutSession } from "../controllers/ProductsController";
import {
  handleSuccesfulPayment,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/OrdersController";

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

router.post("/create-checkout-session", createStripeCheckoutSession);
//Fetch all Added Products Route
router.get("/get-products", FetchProducts);

router.post("/webhook", handleSuccesfulPayment);

//Retrieve all Orders
router.get("/get-all-orders", getAllOrders);

//Updating Orders for Admin
router.post("/update-order-status/:orderid", updateOrderStatus);

//Updating Products for Admin
router.post("update-product/:productid", UpdateProduct);

export default router;
