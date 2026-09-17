const {
   sequelize,
   sql,
   sqlOne,
   withCompat,
   withCompatMany,
} = require("../../db/query");
const CustomError = require("../../errors");
const { checkPermissions } = require("../../utils");

const resolveProductId = (item) =>
   item.productId ||
   (typeof item.product === "object"
      ? item.product?.id || item.product?._id
      : item.product);

const createOrder = async ({ userId, cartItems }) => {
   if (!cartItems || cartItems.length === 0) {
      throw new CustomError.BadRequestError("No Cart Items Provided");
   }

   const orderItemsPayload = cartItems.map((item) => ({
      productId: resolveProductId(item),
      name: item.name,
      description: item.description || "",
      category: item.category,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
   }));

   const subtotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
   );
   const shippingFee = 50;
   const total = subtotal + shippingFee;

   const result = await sequelize.transaction(async (transaction) => {
      const newOrder = await sqlOne(
         `INSERT INTO orders (
            id, subtotal, "shippingFee", total, status, "paymentStatus",
            "userId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, 'pending', 'pending',
            $4, NOW(), NOW()
          )
          RETURNING *`,
         [subtotal, shippingFee, total, userId],
         { transaction }
      );

      for (const item of orderItemsPayload) {
         await sql(
            `INSERT INTO order_items (
               id, "orderId", "productId", name, description, category, price,
               image, quantity, "createdAt", "updatedAt"
             ) VALUES (
               gen_random_uuid(), $1, $2, $3, $4,
               $5, $6, $7, $8, NOW(), NOW()
             )`,
            [
               newOrder.id,
               item.productId,
               item.name,
               item.description,
               item.category,
               item.price,
               item.image,
               item.quantity,
            ],
            { transaction }
         );

         await sql(
            `UPDATE products
             SET inventory = inventory - $1, "updatedAt" = NOW()
             WHERE id = $2`,
            [item.quantity, item.productId],
            { transaction }
         );
      }

      await sql(
         `DELETE FROM carts WHERE "userId" = $1`,
         [userId],
         { transaction }
      );

      const orderItems = await sql(
         `SELECT * FROM order_items WHERE "orderId" = $1`,
         [newOrder.id],
         { transaction }
      );

      return withCompat({
         ...newOrder,
         orderItems: withCompatMany(orderItems),
      });
   });

   return result;
};

const getAllOrders = async ({ orderId, name, status }) => {
   const clauses = [];
   const params = [];

   if (orderId) {
      params.push(orderId);
      clauses.push(`o.id = $${params.length}`);
   }
   if (status) {
      params.push(status);
      clauses.push(`o.status = $${params.length}`);
   }

   const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

   const rows = await sql(
      `SELECT
         o.*,
         json_build_object(
           'id', u.id,
           '_id', u.id,
           'name', u.name,
           'email', u.email,
           'role', u.role
         ) AS "user",
         COALESCE(
           (
             SELECT json_agg(
               json_build_object(
                 'id', oi.id,
                 '_id', oi.id,
                 'orderId', oi."orderId",
                 'productId', oi."productId",
                 'product', oi."productId",
                 'name', oi.name,
                 'description', oi.description,
                 'category', oi.category,
                 'price', oi.price,
                 'image', oi.image,
                 'quantity', oi.quantity
               )
               ORDER BY oi."createdAt"
             )
             FROM order_items oi
             WHERE oi."orderId" = o.id
           ),
           '[]'::json
         ) AS "orderItems"
       FROM orders o
       LEFT JOIN users u ON u.id = o."userId"
       ${whereSql}
       ORDER BY o."createdAt" DESC`,
      params
   );

   let orders = withCompatMany(rows);

   if (name) {
      const searchTerms = name.toLowerCase().split(/\s+/).filter(Boolean);
      orders = orders.filter((order) =>
         (order.orderItems || []).some((item) => {
            const productName = String(item.name || "").toLowerCase();
            return searchTerms.every((term) => productName.includes(term));
         })
      );
   }

   const statusCounts = await sql(
      `SELECT status, COUNT(*)::int AS count
       FROM orders
       GROUP BY status`
   );

   const orderStatusCounts = {
      pending: 0,
      canceled: 0,
      failed: 0,
      delivered: 0,
      shipped: 0,
      processing: 0,
   };

   statusCounts.forEach((row) => {
      orderStatusCounts[row.status] = Number(row.count);
   });

   return {
      orderStatusCounts,
      numberOfOrders: orders.length,
      orders,
   };
};

const getSingleOrder = async ({ orderId, requestUser }) => {
   const order = await sqlOne(
      `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
      [orderId]
   );
   if (!order) {
      throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
   }
   checkPermissions(requestUser, order.userId);

   const orderItems = await sql(
      `SELECT * FROM order_items WHERE "orderId" = $1`,
      [orderId]
   );

   return withCompat({
      ...order,
      orderItems: withCompatMany(orderItems),
   });
};

const getCurrentUserOrders = async (userId) => {
   const rows = await sql(
      `SELECT
         o.*,
         COALESCE(
           (
             SELECT json_agg(
               json_build_object(
                 'id', oi.id,
                 '_id', oi.id,
                 'orderId', oi."orderId",
                 'productId', oi."productId",
                 'product', oi."productId",
                 'name', oi.name,
                 'description', oi.description,
                 'category', oi.category,
                 'price', oi.price,
                 'image', oi.image,
                 'quantity', oi.quantity
               )
               ORDER BY oi."createdAt"
             )
             FROM order_items oi
             WHERE oi."orderId" = o.id
           ),
           '[]'::json
         ) AS "orderItems"
       FROM orders o
       WHERE o."userId" = $1
       ORDER BY o."createdAt" DESC`,
      [userId]
   );

   const orders = withCompatMany(rows);
   return { TotalOrders: orders.length, orders };
};

const updateOrder = async (orderId, body) => {
   const existing = await sqlOne(
      `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
      [orderId]
   );
   if (!existing) {
      throw new CustomError.BadRequestError(`No Order With Id ${orderId}`);
   }

   const order = await sqlOne(
      `UPDATE orders SET
         status = $1,
         "paymentStatus" = $2,
         "paymentIntentId" = $3,
         subtotal = $4,
         "shippingFee" = $5,
         total = $6,
         "updatedAt" = NOW()
       WHERE id = $7
       RETURNING *`,
      [
         body.status ?? existing.status,
         body.paymentStatus ?? existing.paymentStatus,
         body.paymentIntentId !== undefined
            ? body.paymentIntentId
            : existing.paymentIntentId,
         body.subtotal ?? existing.subtotal,
         body.shippingFee ?? existing.shippingFee,
         body.total ?? existing.total,
         orderId,
      ]
   );

   return withCompat(order);
};

const cancelOrder = async (orderId) => {
   const order = await sqlOne(
      `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
      [orderId]
   );
   if (!order) {
      throw new CustomError.NotFoundError(`order not found with id ${orderId}`);
   }
   if (order.status === "canceled") {
      throw new CustomError.BadRequestError(
         `Order is already cancelled with id: ${orderId}`
      );
   }
   if (["shipped", "delivered"].includes(order.status)) {
      throw new CustomError.BadRequestError(
         `Order cannot be cancelled at this stage`
      );
   }

   const orderItems = await sql(
      `SELECT * FROM order_items WHERE "orderId" = $1`,
      [orderId]
   );

   await sequelize.transaction(async (transaction) => {
      await sql(
         `UPDATE orders
          SET status = 'canceled', "updatedAt" = NOW()
          WHERE id = $1`,
         [orderId],
         { transaction }
      );

      for (const item of orderItems) {
         await sql(
            `UPDATE products
             SET inventory = inventory + $1, "updatedAt" = NOW()
             WHERE id = $2`,
            [item.quantity, item.productId],
            { transaction }
         );
      }
   });

   const updated = await sqlOne(
      `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
      [orderId]
   );

   return withCompat({
      ...updated,
      orderItems: withCompatMany(orderItems),
   });
};

const deleteOrder = async (orderId) => {
   const order = await sqlOne(
      `SELECT id FROM orders WHERE id = $1 LIMIT 1`,
      [orderId]
   );
   if (!order) {
      throw new CustomError.BadRequestError(`No order with id ${orderId}`);
   }

   await sql(`DELETE FROM order_items WHERE "orderId" = $1`, [orderId]);
   await sql(`DELETE FROM orders WHERE id = $1`, [orderId]);
};

const getDashboardStats = async () => {
   const stats = await sqlOne(
      `SELECT
         COUNT(*) FILTER (
           WHERE "createdAt" >= date_trunc('day', NOW())
             AND "createdAt" < date_trunc('day', NOW()) + interval '1 day'
         )::int AS "todayOrders",
         COUNT(*) FILTER (
           WHERE "createdAt" >= date_trunc('day', NOW()) - interval '1 day'
             AND "createdAt" < date_trunc('day', NOW())
         )::int AS "yesterdayOrders",
         COUNT(*) FILTER (
           WHERE "createdAt" >= date_trunc('month', NOW())
         )::int AS "thisMonthOrders",
         COUNT(*) FILTER (
           WHERE "createdAt" >= date_trunc('month', NOW()) - interval '1 month'
             AND "createdAt" < date_trunc('month', NOW())
         )::int AS "lastMonthOrders",
         COUNT(*)::int AS "allTimeOrders"
       FROM orders`
   );

   return {
      todayOrders: stats.todayOrders || 0,
      yesterdayOrders: stats.yesterdayOrders || 0,
      thisMonthOrders: stats.thisMonthOrders || 0,
      lastMonthOrders: stats.lastMonthOrders || 0,
      allTimeOrders: stats.allTimeOrders || 0,
   };
};

module.exports = {
   getAllOrders,
   getSingleOrder,
   getCurrentUserOrders,
   createOrder,
   updateOrder,
   cancelOrder,
   deleteOrder,
   getDashboardStats,
};
