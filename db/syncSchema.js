const sequelize = require("./sequelize");
const { storeSchema, parseColumn, quoteIdent } = require("./schema");

const ensureTable = async (tableName, columnSpecs) => {
   const columns = columnSpecs.map(parseColumn);
   const hasId = columns.some((c) => c.name === "id");
   if (!hasId) {
      columns.unshift({
         name: "id",
         type: "uuid",
         notNull: true,
         indexType: "btree",
      });
   }

   const colDefs = columns.map((col) => {
      const nullSql = col.notNull ? "NOT NULL" : "";
      const pk = col.name === "id" ? "PRIMARY KEY" : "";
      return `${quoteIdent(col.name)} ${col.type} ${nullSql} ${pk}`
         .replace(/\s+/g, " ")
         .trim();
   });

   await sequelize.query(
      `CREATE TABLE IF NOT EXISTS ${quoteIdent(tableName)} (
         ${colDefs.join(",\n         ")}
       )`
   );

   for (const col of columns) {
      if (!col.indexType || col.name === "id") continue;

      const indexName = `${tableName}_${col.name}_${col.indexType}_idx`
         .toLowerCase()
         .replace(/[^a-z0-9_]/g, "_");

      if (col.indexType === "unique") {
         await sequelize.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS ${quoteIdent(indexName)}
             ON ${quoteIdent(tableName)} (${quoteIdent(col.name)})`
         );
         continue;
      }

      if (col.indexType === "btree" || col.indexType === "brin") {
         await sequelize.query(
            `CREATE INDEX IF NOT EXISTS ${quoteIdent(indexName)}
             ON ${quoteIdent(tableName)} USING ${col.indexType} (${quoteIdent(
               col.name
            )})`
         );
      }
   }
};

const syncSchema = async () => {
   const tables = Object.keys(storeSchema.table);
   console.log(`[schema] RUN_CREATE_SCHEMA_DB=true — syncing ${tables.length} table(s)`);

   for (const [tableName, columns] of Object.entries(storeSchema.table)) {
      console.log(`[schema] syncing table: ${tableName}`);
      await ensureTable(tableName, columns);
      console.log(`[schema] synced table: ${tableName}`);
   }

   console.log(`[schema] syncing unique index: reviews (userId, productId)`);
   await sequelize.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "reviews_userId_productId_unique"
       ON "reviews" ("userId", "productId")`
   );

   console.log("[schema] database schema sync complete");
};

module.exports = { syncSchema };
