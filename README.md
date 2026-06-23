# CodeVector Products

React/Vite product catalog with a Node.js/Express backend. The API uses cursor-based pagination over `(created_at, id)`, category filtering, and optional price filtering.

The catalog API is protected with a lightweight signed-token login flow.

## Run locally

```powershell
cd backend
npm install
npm start
```

Open http://127.0.0.1:8000/health for the backend health check.

The backend generates deterministic products in memory on first request, so it starts quickly and needs no database. Set `PRODUCT_COUNT` to change the default number of products.

Default login:

```text
Email: admin@codevector.local
Password: admin123
```

For a non-demo setup, set these environment variables before starting the backend:

```powershell
$env:AUTH_SECRET="replace-with-a-long-random-secret"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="replace-this-password"
```

In another terminal, run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:3000 to use the app.

## API

`POST /api/login`

Request:

```json
{
  "email": "admin@codevector.local",
  "password": "admin123"
}
```

Response:

```json
{
  "token": "signed-token",
  "user": {
    "id": "admin",
    "name": "Catalog Admin",
    "email": "admin@codevector.local"
  },
  "expires_in": 28800
}
```

`GET /api/products`

Requires:

```text
Authorization: Bearer signed-token
```

Query parameters:

- `category`: optional category name
- `cursor`: pagination token from the previous response
- `limit`: 1-100, default 20
- `min_price`: optional minimum price
- `max_price`: optional maximum price

Response:

```json
{
  "items": [],
  "next_cursor": null,
  "total_hint": 20000
}
```

## Why cursor pagination

Offset pagination can repeat or skip rows while new products are inserted. This API uses the last seen `(created_at, id)` as a stable cursor:

```sql
WHERE created_at < :cur_time
   OR (created_at = :cur_time AND id < :cur_id)
ORDER BY created_at DESC, id DESC
LIMIT :limit
```

That keeps each page stable even when newer products arrive.
