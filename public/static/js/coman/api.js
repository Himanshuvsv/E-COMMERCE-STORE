/* Shared Bearer-token helpers for every authenticated HTML page. */

(function () {
   var TOKEN_KEY = "shopease_token";

   function getToken() {
      try {
         return localStorage.getItem(TOKEN_KEY);
      } catch (error) {
         return null;
      }
   }

   function setToken(token) {
      if (!token) return;
      try {
         localStorage.setItem(TOKEN_KEY, token);
      } catch (error) {
         /* private mode / blocked storage */
      }
   }

   function clearToken() {
      try {
         localStorage.removeItem(TOKEN_KEY);
      } catch (error) {
         /* ignore */
      }
   }

   function apiFetch(url, options) {
      var opts = Object.assign({}, options || {});
      var headers = Object.assign({}, opts.headers || {});
      var token = getToken();

      if (token) {
         headers.Authorization = "Bearer " + token;
      }

      if (
         opts.body &&
         typeof opts.body === "object" &&
         !(opts.body instanceof FormData) &&
         !(opts.body instanceof Blob)
      ) {
         headers["Content-Type"] =
            headers["Content-Type"] || "application/json";
         opts.body = JSON.stringify(opts.body);
      }

      opts.headers = headers;
      return fetch(url, opts);
   }

   window.getToken = getToken;
   window.setToken = setToken;
   window.clearToken = clearToken;
   window.apiFetch = apiFetch;
})();
