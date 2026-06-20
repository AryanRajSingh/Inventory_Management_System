# Inventory Management System

## Overview

The Inventory Management System is a full-stack web application designed to manage products, customers, orders, and inventory in a simple and efficient way. The system provides a clean user interface for managing business operations while ensuring data consistency through backend business rules.

The project was developed as part of a Software Engineer technical assessment and demonstrates backend development, API design, database management, containerization, deployment, and full-stack integration.

---

## Live Application

### Frontend

https://inventory-management-system-six-orcin.vercel.app

### Backend API

https://inventory-backend-api-2yg0.onrender.com

### API Documentation

https://inventory-backend-api-2yg0.onrender.com/docs

### Health Check

https://inventory-backend-api-2yg0.onrender.com/health

---

## Source Code

### GitHub Repository

https://github.com/AryanRajSingh/Inventory_Management_System

### Docker Hub Image

https://hub.docker.com/r/darpan15/inventory-backend

---

## Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic

### Database

* PostgreSQL

### DevOps & Deployment

* Docker
* Docker Compose
* Render
* Vercel
* GitHub

---

## Features

### Product Management

Users can:

* Add products
* View all products
* Update product details
* Delete products
* Track available inventory

Each product contains:

* Product Name
* SKU
* Price
* Quantity in Stock

---

### Customer Management

Users can:

* Add customers
* View customer details
* Delete customers

Each customer contains:

* Full Name
* Email Address
* Phone Number

---

### Order Management

Users can:

* Create orders
* View order history
* Cancel orders

Each order contains:

* Customer Information
* Product Information
* Ordered Quantity
* Total Amount

---

### Dashboard

The dashboard displays:

* Total Products
* Total Customers
* Total Orders
* Low Stock Products

---

## Business Rules Implemented

The application enforces the following rules:

* Product SKU must be unique.
* Customer email must be unique.
* Product quantity cannot be negative.
* Orders cannot be created if stock is insufficient.
* Product inventory is automatically reduced after order creation.
* Product inventory is restored when an order is cancelled.
* Order total amount is automatically calculated by the backend.
* Request validation is handled before processing.
* Proper HTTP status codes are returned for all API responses.
* Error handling is implemented across all endpoints.

---

## Project Structure

```text
Inventory_Management_System/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## API Endpoints

### Products

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /products      |
| GET    | /products      |
| GET    | /products/{id} |
| PUT    | /products/{id} |
| DELETE | /products/{id} |

### Customers

| Method | Endpoint        |
| ------ | --------------- |
| POST   | /customers      |
| GET    | /customers      |
| GET    | /customers/{id} |
| DELETE | /customers/{id} |

### Orders

| Method | Endpoint     |
| ------ | ------------ |
| POST   | /orders      |
| GET    | /orders      |
| GET    | /orders/{id} |
| DELETE | /orders/{id} |

### Dashboard

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | /dashboard/summary |

---

## Running Locally with Docker

### Clone Repository

```bash
git clone https://github.com/AryanRajSingh/Inventory_Management_System.git
cd Inventory_Management_System
```

### Create Environment File

Linux / macOS / WSL:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### Start Application

```bash
docker compose up --build
```

For WSL users:

```bash
sudo docker compose up --build
```

### Access Application

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

Health Endpoint:

```text
http://localhost:8000/health
```

---

## Environment Variables

### Backend

```env
DATABASE_URL=postgresql://username:password@host:5432/database
CORS_ORIGINS=http://localhost:3000
```

### Frontend

```env
VITE_API_URL=http://localhost:8000
```

---

## Docker Commands

### Build Backend Image

```bash
docker build -t darpan15/inventory-backend:1.0 ./backend
```

### Login to Docker Hub

```bash
docker login
```

### Push Image

```bash
docker push darpan15/inventory-backend:1.0
```

---

## Deployment

### Backend Deployment

Platform: Render

Backend URL:

```text
https://inventory-backend-api-2yg0.onrender.com
```

API Documentation:

```text
https://inventory-backend-api-2yg0.onrender.com/docs
```

---

### Frontend Deployment

Platform: Vercel

Frontend URL:

```text
https://inventory-management-system-six-orcin.vercel.app
```

Environment Variable Used:

```env
VITE_API_URL=https://inventory-backend-api-2yg0.onrender.com
```

---

## Testing Scenarios

The following scenarios were tested:

* Create Product
* Update Product
* Delete Product
* Create Customer
* Delete Customer
* Create Order
* Insufficient Inventory Validation
* Automatic Stock Reduction
* Order Cancellation
* Inventory Restoration
* Dashboard Statistics
* API Validation and Error Handling

---

## Future Improvements

* User Authentication and Authorization
* Role-Based Access Control
* Inventory Alerts and Notifications
* Product Search and Filtering
* Order Status Tracking
* Export Reports to Excel or PDF
* Audit Logs
* Advanced Analytics Dashboard

---

## Author

Aryan Raj


Email:
[aryanraj844101@gmail.com](mailto:aryanraj844101@gmail.com)
