const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
   try {
      if (req.files) {
         const productImage = req.files.image;
         if (!productImage.mimetype.startsWith("image")) {
            throw new CustomError.BadRequestError("Please upload an image");
         }
         const maxSize = 5 * 1024 * 1024;

         if (productImage.size > maxSize) {
            throw new CustomError.BadRequestError(
               "Please upload an image smaller than 5 MB"
            );
         }
         const imagePath = path.join(
            __dirname,
            "../public/uploads/" + `${productImage.name}`
         );
         await productImage.mv(imagePath);
         req.body.image = `/uploads/${productImage.name}`;
      }
      req.body.user = req.user.userId;
      const product = await Product.create(req.body);
      res.status(StatusCodes.CREATED).json({ product });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getAllProducts = async (req, res) => {
   try {
      const { category, name } = req.query;
      const queryObject = { };
      // const queryObject = { isDeleted: false };
      if (name) {
         const nameRegex = name
            .split(" ")
            .map((word) => `(?=.*${word})`)
            .join("");

         queryObject.name = { $regex: nameRegex, $options: "i" };
      }

      if (category) {
         queryObject.category = { $regex: category, $options: "i" };
      }

      let products = await Product.find(queryObject);

      const productsToDelete = products.filter(
         (product) => product.inventory === 0
      );

      if (productsToDelete.length > 0) {
         const deleteIds = productsToDelete.map((product) => product._id);
         await Product.deleteMany({ _id: { $in: deleteIds } });

         products = await Product.find(queryObject);
      }

      const totalStock = products.reduce(
         (acc, product) => acc + product.inventory,
         0
      );

      res.status(StatusCodes.OK).json({
         numberOfProducts: products.length,
         totalStock,
         products,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getSingleProduct = async (req, res) => {
   try {
      const { id: productId } = req.params;
      const product = await Product.findOne({ _id: productId }).populate(
         "reviews"
      );
      if (!product) {
         throw new CustomError.NotFoundError(
            `No product with id : ${productId}`
         );
      }
      res.status(StatusCodes.OK).json({ product });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const updateProduct = async (req, res) => {
   try {
      const { id: productId } = req.params;

      const product = await Product.findOneAndUpdate(
         { _id: productId },
         req.body,
         {
            new: true,
            runValidators: true,
         }
      );

      if (!product) {
         throw new CustomError.NotFoundError(
            `No product with id : ${productId}`
         );
      }

      res.status(StatusCodes.OK).json({ product });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const deleteProduct = async (req, res) => {
   try {
      const { id: productId } = req.params;
      const product = await Product.findOneAndDelete({ _id: productId });
      if (!product) {
         throw new CustomError.BadRequestError(
            `no product with id : ${productId}`
         );
      }
      res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

module.exports = {
   createProduct,
   getAllProducts,
   getSingleProduct,
   updateProduct,
   deleteProduct,
};
