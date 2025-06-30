require("dotenv").config();
require("express-async-errors");
const path = require("path");
const fs = require("fs");

const express = require("express");
const app = express();

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

const connectDB = require("./db/connect");

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const cartRouter = require("./routes/cartRoutes");
const orderRouter = require("./routes/orderRoutes");
const wishlistRouter = require("./routes/wishlistRouter");

const paymentRouter = require("./routes/payment");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(mongoSanitize());
// const logStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
//    flags: "a",
// });
// app.use(morgan("tiny", { stream: logStream }));
app.use(morgan('tiny'))
app.use(
   cors({
      origin: "http://127.0.0.1:5000",
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
   })
);
app.options("*", cors());
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
      await connectDB(process.env.MONGO_URL);
      app.listen(port, () =>
         console.log(`Server is listening on port ${port}...`)
      );
   } catch (error) {
      console.log(error);
   }
};

start();
