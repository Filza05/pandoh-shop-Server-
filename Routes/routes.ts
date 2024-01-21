import express from "express";
import { Router } from "express-serve-static-core";
import {
  PerformSignUpChecks,
  UserSignIn,
  VerifyEmail,
  SignUpUser,
  VerifyToken,
  handleGoogleSignIn,
} from "../controllers/UserAuthenticationController";
import {
  AddProduct,
  DeleteProduct,
  FetchProducts,
  performProductChecks,
  UpdateProduct,
  AddUserReview,
  GetProductReviews,
} from "../controllers/ProductsController";
import { upload } from "../multer.config";
import { createStripeCheckoutSession } from "../controllers/OrdersController";
import {
  handleSuccesfulPayment,
  getAllOrders,
  updateOrderStatus,
  getUserOrders,
  deleteOrder,
  addOrderInDB,
} from "../controllers/OrdersController";
import { AddUserAddress, GetUserAddress } from "../controllers/UserController";

const router: Router = express.Router();

//SIGN UP ROUTE
router.post("/perform-sign-up-checks", PerformSignUpChecks);

router.post("/verify-email", VerifyEmail);

router.post("/sign-up-user", SignUpUser);

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

router.post("/add-order/:userid", addOrderInDB);

//Retrieve all Orders
router.get("/get-all-orders", getAllOrders);

//Updating Orders for Admin`
router.post("/update-order-status/:orderid", updateOrderStatus);

//Updating Products for Admin
router.post("/update-product/:productid", UpdateProduct);

router.post("/handle-google-sign-in", handleGoogleSignIn);

router.get("/get-user-orders/:id", getUserOrders);

router.post("/delete-order/:orderid", deleteOrder);

router.post("/delete-product/:productid", DeleteProduct);

router.post("/add-user-review/:userid", AddUserReview);

router.get("/get-product-reviews/:productid", GetProductReviews);

router.get("/profile", VerifyToken);

router.get("/get-user-address/:userid", GetUserAddress);

router.post("/add-new-address/:userid", AddUserAddress);

export default router;
