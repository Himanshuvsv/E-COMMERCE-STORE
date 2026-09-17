const { StatusCodes } = require("http-status-codes");
const productService = require("./product.service");

const createProduct = async (req, res) => {
   try {
      const product = await productService.createProduct({
         body: req.body,
         files: req.files,
         userId: req.user.userId,
      });
      res.status(StatusCodes.CREATED).json({ product });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getAllProducts = async (req, res) => {
   try {
      const result = await productService.getAllProducts(req.query);
      res.status(StatusCodes.OK).json(result);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getSingleProduct = async (req, res) => {
   try {
      const product = await productService.getSingleProduct(req.params.id);
      res.status(StatusCodes.OK).json({ product });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const updateProduct = async (req, res) => {
   try {
      const product = await productService.updateProduct(
         req.params.id,
         req.body
      );
      res.status(StatusCodes.OK).json({ product });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const deleteProduct = async (req, res) => {
   try {
      await productService.deleteProduct(req.params.id);
      res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

module.exports = {
   createProduct,
   getAllProducts,
   getSingleProduct,
   updateProduct,
   deleteProduct,
};
