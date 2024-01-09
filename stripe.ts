import Stripe from "stripe";

require("dotenv").config();

export const stripe = new Stripe(process.env.STRIPE_SECRET!);
