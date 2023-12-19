import express from "express";
import { Router } from "express-serve-static-core";
import { UserSignUp, UserSignIn } from "../controllers/UserAuthenticationController";


const router: Router = express.Router()
//SIGN UP ROUTE
router.post("/sign-up-user", UserSignUp);

//SIGN IN ROUTE
router.post("/sign-in-user", UserSignIn)


export default router;



