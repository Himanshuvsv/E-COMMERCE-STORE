const path = require("path");
const { sql, sqlOne, withCompat, withCompatMany } = require("../../db/query");
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

   let colors = data.colors;
   if (typeof colors === "string") {
      try {
         colors = JSON.parse(colors);
      } catch {
         colors = colors.split(",").map((c) => c.trim()).filter(Boolean);
      }
   }
   if (!Array.isArray(colors)) colors = ["#222"];

   const product = await sqlOne(
      `INSERT INTO products (
         id, name, price, description, image, category, company, colors,
         featured, "freeShipping", inventory, "averageRating", "numOfReviews",
         "userId", "isDeleted", "createdAt", "updatedAt"
       ) VALUES (
         gen_random_uuid(), $1, $2, $3, $4, $5, $6,
         $7::jsonb, $8, $9, $10, 0, 0,
         $11, false, NOW(), NOW()
       )
       RETURNING *`,
      [
         data.name,
         Number(data.price) || 0,
         data.description,
         data.image || "/uploads/example.jpeg",
         data.category,
         data.company,
         JSON.stringify(colors),
         data.featured === true || data.featured === "true",
         data.freeShipping === true || data.freeShipping === "true",
         Number(data.inventory) || 15,
         userId,
      ]
   );

   return withCompat(product);
};

const buildProductFilter = ({ category, name }) => {
   const clauses = [];
   const params = [];

   if (category) {
      params.push(category.toLowerCase());
      clauses.push(`category = $${params.length}`);
   }

   if (name) {
      const words = name.trim().split(/\s+/).filter(Boolean);
      words.forEach((word) => {
         params.push(`%${word}%`);
         clauses.push(`name ILIKE $${params.length}`);
      });
   }

   return {
      whereSql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
      params,
   };
};

const getAllProducts = async ({ category, name }) => {
   const { whereSql, params } = buildProductFilter({ category, name });

   await sql(
      `DELETE FROM products
       WHERE inventory = 0
       ${whereSql ? `AND id IN (SELECT id FROM products ${whereSql})` : ""}`,
      params
   );

   const products = await sql(
      `SELECT * FROM products ${whereSql} ORDER BY "createdAt" DESC`,
      params
   );

   const mapped = withCompatMany(products);
   const totalStock = mapped.reduce(
      (acc, product) => acc + Number(product.inventory || 0),
      0
   );

   return {
      numberOfProducts: mapped.length,
      totalStock,
      products: mapped,
   };
};

const getSingleProduct = async (productId) => {
   const product = await sqlOne(
      `SELECT * FROM products WHERE id = $1 LIMIT 1`,
      [productId]
   );
   if (!product) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
   }

   const reviews = await sql(
      `SELECT * FROM reviews WHERE "productId" = $1 ORDER BY "createdAt" DESC`,
      [productId]
   );

   return withCompat({
      ...product,
      reviews: withCompatMany(reviews),
   });
};

const updateProduct = async (productId, body) => {
   const existing = await sqlOne(
      `SELECT * FROM products WHERE id = $1 LIMIT 1`,
      [productId]
   );
   if (!existing) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
   }

   const data = { ...body };
   if (data.user) {
      data.userId = data.user;
      delete data.user;
   }

   let colors = data.colors !== undefined ? data.colors : existing.colors;
   if (typeof colors === "string") {
      try {
         colors = JSON.parse(colors);
      } catch {
         colors = colors.split(",").map((c) => c.trim()).filter(Boolean);
      }
   }

   const product = await sqlOne(
      `UPDATE products SET
         name = $1,
         price = $2,
         description = $3,
         image = $4,
         category = $5,
         company = $6,
         colors = $7::jsonb,
         featured = $8,
         "freeShipping" = $9,
         inventory = $10,
         "userId" = $11,
         "updatedAt" = NOW()
       WHERE id = $12
       RETURNING *`,
      [
         data.name ?? existing.name,
         data.price != null ? Number(data.price) : existing.price,
         data.description ?? existing.description,
         data.image ?? existing.image,
         data.category ?? existing.category,
         data.company ?? existing.company,
         JSON.stringify(colors || ["#222"]),
         data.featured != null
            ? data.featured === true || data.featured === "true"
            : existing.featured,
         data.freeShipping != null
            ? data.freeShipping === true || data.freeShipping === "true"
            : existing.freeShipping,
         data.inventory != null ? Number(data.inventory) : existing.inventory,
         data.userId ?? existing.userId,
         productId,
      ]
   );

   return withCompat(product);
};

const deleteProduct = async (productId) => {
   const product = await sqlOne(
      `SELECT id FROM products WHERE id = $1 LIMIT 1`,
      [productId]
   );
   if (!product) {
      throw new CustomError.BadRequestError(
         `no product with id : ${productId}`
      );
   }

   await sql(`DELETE FROM reviews WHERE "productId" = $1`, [productId]);
   await sql(`DELETE FROM products WHERE id = $1`, [productId]);
};

module.exports = {
   createProduct,
   getAllProducts,
   getSingleProduct,
   updateProduct,
   deleteProduct,
};
