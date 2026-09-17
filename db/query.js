const { QueryTypes } = require("sequelize");
const sequelize = require("./sequelize");

/** Add `_id` (and product/user aliases) so the existing frontend keeps working. */
const withCompat = (row) => {
   if (!row || typeof row !== "object") return row;
   const out = { ...row };
   if (out.id != null) out._id = out.id;
   if (
      out.productId != null &&
      (out.product == null || typeof out.product !== "object")
   ) {
      out.product = out.productId;
   }
   if (
      out.userId != null &&
      (out.user == null || typeof out.user !== "object")
   ) {
      out.user = out.userId;
   }
   return out;
};

const withCompatMany = (rows) => (rows || []).map(withCompat);

/**
 * Run SQL with Postgres positional binds (`$1`, `$2`, ...).
 * @param {string} query
 * @param {any[]} [params]
 * @param {{ transaction?: import('sequelize').Transaction, type?: string }} [options]
 */
const sql = async (query, params = [], options = {}) => {
   const bind = Array.isArray(params) ? params : [];
   const returnsRows =
      options.type === QueryTypes.SELECT ||
      /^\s*SELECT\b/i.test(query) ||
      /\bRETURNING\b/i.test(query);

   if (returnsRows) {
      return sequelize.query(query, {
         bind,
         type: QueryTypes.SELECT,
         transaction: options.transaction,
      });
   }

   const [, metadata] = await sequelize.query(query, {
      bind,
      transaction: options.transaction,
   });
   return metadata;
};

const sqlOne = async (query, params = [], options = {}) => {
   const rows = await sql(query, params, options);
   if (!Array.isArray(rows)) return null;
   return rows[0] || null;
};

module.exports = {
   sequelize,
   sql,
   sqlOne,
   withCompat,
   withCompatMany,
   QueryTypes,
};
