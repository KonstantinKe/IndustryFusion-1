module.exports = {
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    }
  },
  "/auth": {
    "target": "http://localhost:8081",
    "secure": false,
  },
};
