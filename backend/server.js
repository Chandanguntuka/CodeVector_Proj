import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 8000);
const TOTAL_PRODUCTS = Number(process.env.PRODUCT_COUNT || 20_000);
const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const TOKEN_TTL_SECONDS = Number(process.env.TOKEN_TTL_SECONDS || 60 * 60 * 8);
const DEMO_USER = {
  id: "admin",
  name: "Catalog Admin",
  email: process.env.ADMIN_EMAIL || "admin@codevector.local",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

const CATEGORIES = ["Smartphones", "Laptops", "Home Appliances", "Fashion", "Electronics", "Kitchen", "Gaming", "Audio"];
const BRANDS = ["Samsung", "MI Xiaomi", "Realme", "OnePlus", "Vivo", "Oppo", "Apple", "LG", "Panasonic", "Sony", "Boat", "Noise", "Zebronics", "Lenovo", "HP", "Asus", "Dell", "Philips", "Bajaj", "Crompton"];
const MODELS = ["Pro Max", "Ultra", "Plus", "X", "Z Fold", "Mini", "Air", "Power", "Sports", "Lite", "Edition", "Pro", "Gaming", "Wifi", "Smart", "Portable", "3D", "HD"];

let productsCache = null;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/login", (req, res) => {
  const email = clean(req.body?.email)?.toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (email !== DEMO_USER.email.toLowerCase() || password !== DEMO_USER.password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const user = publicUser(DEMO_USER);
  res.json({
    token: createToken(user),
    user,
    expires_in: TOKEN_TTL_SECONDS,
  });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/categories", requireAuth, (_req, res) => {
  res.json([...CATEGORIES].sort());
});

app.get("/api/products", requireAuth, (req, res) => {
  const products = getProducts();
  const limit = clamp(Number(req.query.limit || 20), 1, 100);
  const category = clean(req.query.category);
  const minPrice = req.query.min_price === undefined ? null : Number(req.query.min_price);
  const maxPrice = req.query.max_price === undefined ? null : Number(req.query.max_price);
  const cursor = clean(req.query.cursor);

  if ((minPrice !== null && Number.isNaN(minPrice)) || (maxPrice !== null && Number.isNaN(maxPrice))) {
    return res.status(400).json({ error: "Invalid price filter" });
  }

  let cursorValue = null;
  if (cursor) {
    try {
      cursorValue = decodeCursor(cursor);
    } catch {
      return res.status(400).json({ error: "Invalid cursor" });
    }
  }

  const filtered = [];
  let totalHint = 0;

  for (const product of products) {
    if (category && product.category !== category) continue;
    if (minPrice !== null && product.price < minPrice) continue;
    if (maxPrice !== null && product.price > maxPrice) continue;

    totalHint += 1;

    if (cursorValue && !isAfterCursor(product, cursorValue)) continue;
    if (filtered.length < limit) filtered.push(product);
  }

  const last = filtered.at(-1);
  const nextCursor = filtered.length === limit && last ? encodeCursor(last) : null;

  res.json({
    items: filtered,
    next_cursor: nextCursor,
    total_hint: totalHint,
  });
});

const frontendDist = path.resolve(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get("*", (_req, res, next) => {
  const indexFile = path.join(frontendDist, "index.html");
  res.sendFile(indexFile, (error) => {
    if (error) next();
  });
});

app.listen(PORT, () => {
  console.log(`Node backend running at http://127.0.0.1:${PORT}`);
  console.log(`Products will be generated on first request: ${TOTAL_PRODUCTS.toLocaleString()}`);
  console.log(`Demo login: ${DEMO_USER.email} / ${DEMO_USER.password}`);
});

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Authentication required" });
  }
}

function createToken(user) {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifyToken(token) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload))) {
    throw new Error("Invalid token");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Expired token");
  }

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
  };
}

function sign(value) {
  return crypto.createHmac("sha256", AUTH_SECRET).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function getProducts() {
  if (!productsCache) productsCache = generateProducts(TOTAL_PRODUCTS);
  return productsCache;
}

function generateProducts(total) {
  const now = Date.now();
  const twoYearsMs = 63_072_000_000;
  const rows = [];

  for (let i = 1; i <= total; i += 1) {
    const createdAt = new Date(now - pseudoRandom(i) * twoYearsMs).toISOString();
    rows.push({
      id: i,
      name: `${pick(BRANDS, i)} ${pick(MODELS, i * 7)} ${100 + (i % 900)}`,
      category: pick(CATEGORIES, i * 13),
      price: Math.floor(199 + pseudoRandom(i * 17) * 9800),
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  rows.sort((a, b) => {
    const dateOrder = b.created_at.localeCompare(a.created_at);
    return dateOrder || b.id - a.id;
  });

  return rows;
}

function encodeCursor(product) {
  return Buffer.from(JSON.stringify({ created_at: product.created_at, id: product.id }), "utf8")
    .toString("base64url");
}

function decodeCursor(cursor) {
  const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  if (!decoded.created_at || typeof decoded.id !== "number") throw new Error("Bad cursor");
  return decoded;
}

function isAfterCursor(product, cursor) {
  return product.created_at < cursor.created_at || (product.created_at === cursor.created_at && product.id < cursor.id);
}

function pick(values, seed) {
  return values[Math.abs(seed) % values.length];
}

function pseudoRandom(seed) {
  const value = Math.sin(seed * 9999) * 10000;
  return value - Math.floor(value);
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.floor(value), min), max);
}

function clean(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}
