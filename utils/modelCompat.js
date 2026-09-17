const applyApiCompat = (model) => {
   const originalToJSON = model.prototype.toJSON;

   model.prototype.toJSON = function toJSON() {
      const values = originalToJSON
         ? originalToJSON.call(this)
         : { ...this.get({ plain: true }) };

      if (values.id != null) {
         values._id = values.id;
      }

      if (
         values.productId != null &&
         (values.product == null || typeof values.product !== "object")
      ) {
         values.product = values.productId;
      }

      if (
         values.userId != null &&
         (values.user == null || typeof values.user !== "object")
      ) {
         values.user = values.userId;
      }

      return values;
   };
};

module.exports = applyApiCompat;
