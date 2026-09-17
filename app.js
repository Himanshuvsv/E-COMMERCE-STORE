require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

const morgan = require("morgan");
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

app.set("trust proxy", 1);
app.use(morgan("tiny"));
app.use(
   cors({
      origin: [
         "http://127.0.0.1:5050",
         "http://localhost:5050",
         "http://127.0.0.1:5000",
         "http://localhost:5000",
      ],
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
   })
);
app.options("*", cors({
   origin: [
      "http://127.0.0.1:5050",
      "http://localhost:5050",
      "http://127.0.0.1:5000",
      "http://localhost:5000",
   ],
   credentials: true,
}));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/payment", paymentRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
   try {
      await connectDB();
      app.listen(port, () =>
         console.log(`Server is listening on port ${port}...`)
      );
   } catch (error) {
      console.log(error);
   }
};

start();
