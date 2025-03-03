const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const VITE_PORT = 5173;

// Proxy all requests to the Vite dev server
app.use('/', createProxyMiddleware({
  target: `http://localhost:${VITE_PORT}`,
  changeOrigin: true,
  ws: true,
}));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Proxying to Vite server on port ${VITE_PORT}`);
});
