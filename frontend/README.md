# CodeVector Products Frontend - React Version

Modern React-based UI for the CodeVector Products catalog with cursor-based pagination, category filtering, and price range filtering.

## Technologies Used

### **Core Framework**
- **React 18** - UI library for building component-based interfaces
- **React DOM** - Renders React components to the browser

### **Development & Bundling**
- **Vite** - Fast build tool and dev server (replaces Webpack)
- **@vitejs/plugin-react** - Fast Refresh support for React in Vite

### **API Communication**
- **Axios** - Promise-based HTTP client for API requests (more feature-rich than native Fetch)

### **Code Quality**
- **ESLint** - Static code analysis for JavaScript/React

## Project Structure

```
src/
├── main.jsx              # Entry point, renders React to DOM
├── App.jsx              # Main app component with state management
├── index.css            # Global styles
└── components/
    ├── Toolbar.jsx      # Filter controls (category, price range)
    ├── ProductGrid.jsx  # Product list display
    ├── ProductCard.jsx  # Individual product card
    ├── Status.jsx       # Count and page indicator
    └── Pager.jsx        # Next/Previous pagination buttons
```

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

Start the dev server on `http://localhost:3000`:

```bash
npm run dev
```

The app automatically proxies `/api/*` requests to `http://localhost:8000`.

### Build for Production

```bash
npm run build
```

Output goes to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Key Features

- **Cursor-based Pagination** - Stable pagination using `(created_at, id)` cursors
- **Category Filtering** - Filter products by category
- **Price Range Filtering** - Optional min/max price filters
- **Responsive Design** - Mobile-friendly layout
- **Loading States** - Visual feedback during API calls
- **Error Handling** - Graceful error messages

## API Integration

The frontend connects to the Spring Boot backend at `/api`:

- `GET /api/categories` - Fetch all product categories
- `GET /api/products` - Fetch paginated products with optional filters

## Components

### App.jsx
Main component managing all state and API calls:
- Pagination state (cursor, history, page)
- Filter state (category, minPrice, maxPrice)
- Product loading and error handling

### Toolbar.jsx
Filter controls component:
- Category dropdown
- Min/Max price inputs
- Apply filters button

### ProductGrid.jsx
Displays product list with loading/error states

### ProductCard.jsx
Individual product card displaying:
- Product name
- Category badge
- Price
- Creation date

### Status.jsx
Shows product count and current page

### Pager.jsx
Pagination controls with Next/Previous buttons

## Development Tips

- React 18 with Strict Mode enabled for development warnings
- Use Axios interceptors in App.jsx for common headers if needed
- CSS variables are defined in index.css for theming
- Responsive breakpoint at 768px for mobile
