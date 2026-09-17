const path = require("path");
const { Op } = require("sequelize");
const Product = require("./product.model");
const Review = require("../review/review.model");
const CustomError = require("../../errors");

const createProduct = async ({ body, files, userId }) => {
   const data = { ...body, userId };

   if (files && files.image) {
      const productImage = files.image;
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
         "../../public/uploads/",
         productImage.name
      );
      await productImage.mv(imagePath);
      data.image = `/uploads/${productImage.name}`;
   }

   if (typeof data.colors === "string") {
      try {
         data.colors = JSON.parse(data.colors);
      } catch {
         data.colors = [data.colors];
      }
   }

   return Product.create(data);
};

const getAllProducts = async ({ category, name }) => {
   const where = {};

   if (name) {
      const words = name.trim().split(/\s+/).filter(Boolean);
      where[Op.and] = words.map((word) => ({
         name: { [Op.iLike]: `%${word}%` },
      }));
   }

   if (category) {
      where.category = category.toLowerCase();
   }

   let products = await Product.findAll({ where });

   const productsToDelete = products.filter((product) => product.inventory === 0);
   if (productsToDelete.length > 0) {
      const deleteIds = productsToDelete.map((product) => product.id);
      await Product.destroy({ where: { id: { [Op.in]: deleteIds } } });
      products = await Product.findAll({ where });
   }

   const totalStock = products.reduce(
      (acc, product) => acc + product.inventory,
      0
   );

   return {
      numberOfProducts: products.length,
      totalStock,
      products,
   };
};

const getSingleProduct = async (productId) => {
   const product = await Product.findByPk(productId, {
      include: [{ model: Review, as: "reviews" }],
   });
   if (!product) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
   }
   return product;
};

const updateProduct = async (productId, body) => {
   const product = await Product.findByPk(productId);
   if (!product) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
   }

   const data = { ...body };
   if (data.user) {
      data.userId = data.user;
      delete data.user;
   }
   if (typeof data.colors === "string") {
      try {
         data.colors = JSON.parse(data.colors);
      } catch {
         data.colors = [data.colors];
      }
   }

   await product.update(data);
   return product;
};

const deleteProduct = async (productId) => {
   const product = await Product.findByPk(productId);
   if (!product) {
      throw new CustomError.BadRequestError(
         `no product with id : ${productId}`
      );
   }
   await Review.destroy({ where: { productId } });
   await product.destroy();
};

module.exports = {
   createProduct,
   getAllProducts,
   getSingleProduct,
   updateProduct,
   deleteProduct,
};
