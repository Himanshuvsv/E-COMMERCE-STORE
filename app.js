require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const { connectDB } = require("./db");

const authRouter = require("./modules/auth/auth.routes");
const userRouter = require("./modules/user/user.routes");
const productRouter = require("./modules/product/product.routes");
const reviewRouter = require("./modules/review/review.routes");
const cartRouter = require("./modules/cart/cart.routes");
const orderRouter = require("./modules/order/order.routes");
const wishlistRouter = require("./modules/wishlist/wishlist.routes");
const paymentRouter = require("./modules/payment/payment.routes");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const corsOrigins = [
   "http://127.0.0.1:5050",
   "http://localhost:5050",
   "http://127.0.0.1:5000",
   "http://localhost:5000",
];

app.set("trust proxy", 1);
app.use(
   cors({
      origin: corsOrigins,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
   })
);
app.options(
   "*",
   cors({
      origin: corsOrigins,
      credentials: true,
   })
);
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

const modules = [
   { name: "auth", path: "/api/auth", router: authRouter },
   { name: "user", path: "/api/users", router: userRouter },
   { name: "product", path: "/api/products", router: productRouter },
   { name: "review", path: "/api/reviews", router: reviewRouter },
   { name: "cart", path: "/api/cart", router: cartRouter },
   { name: "order", path: "/api/orders", router: orderRouter },
   { name: "wishlist", path: "/api/wishlist", router: wishlistRouter },
   { name: "payment", path: "/api/payment", router: paymentRouter },
];

for (const mod of modules) {
   app.use(mod.path, mod.router);
   console.log(`[module] ${mod.name} initialized (${mod.path})`);
}

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
   try {
      await connectDB();
      app.listen(port, () =>
         console.log(`[server] listening on port ${port}`)
      );
   } catch (error) {
      console.error("[server] failed to start", error);
   }
};

start();
