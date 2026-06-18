# Inventory and Order Management System

A full-stack Inventory and Order Management System built with React, FastAPI, PostgreSQL, and Docker.
The application helps manage products, customers, orders, and stock updates from one simple dashboard.

## Tech Stack

**Frontend**

* React
* Vite
* JavaScript
* CSS

**Backend**

* Python
* FastAPI
* SQLAlchemy
* Pydantic

**Database**

* PostgreSQL

**Containerization**

* Docker
* Docker Compose

## Features

### Product Management

* Add new products
* View all products
* View product details
* Update product information
* Delete products
* Track available stock

### Customer Management

* Add new customers
* View all customers
* View customer details
* Delete customers

### Order Management

* Create customer orders
* View all orders
* View order details
* Cancel or delete orders
* Automatically reduce stock after order creation
* Restore stock when an order is cancelled or deleted

### Dashboard

The dashboard shows:

* Total products
* Total customers
* Total orders
* Low stock products

## Business Rules

The backend handles the main business logic:

* Product SKU must be unique.
* Customer email must be unique.
* Product quantity cannot be negative.
* Orders cannot be placed if stock is not enough.
* Stock is reduced automatically after an order is created.
* Stock is restored when an order is cancelled or deleted.
* Order total amount is calculated by the backend.
* APIs return proper error messages and HTTP status codes.

## Project Structure

```txt
inventory-order-management-system/
│
├── backend/
│   ├── app/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml
├── .env.example
├── README.md
└── .gitignore
```

## Local Setup with Docker Compose

### 1. Create the environment file

In the root folder, copy `.env.example` and create a new `.env` file.

For Linux, macOS, or WSL:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 2. Start the application

```bash
docker compose up --build
```

If you are using Docker inside WSL, run the command from the Ubuntu terminal.

```bash
sudo docker compose up --build
```

### 3. Open the application

Frontend:

```txt
http://localhost:3000
```

Backend API:

```txt
http://localhost:8000
```

Swagger API Docs:

```txt
http://localhost:8000/docs
```

Health Check:

```txt
http://localhost:8000/health
```

## Running Docker Again

If the terminal was closed or the containers were stopped, start Docker again and run the project:

```bash
sudo service docker start
cd /mnt/c/Users/DELL/Desktop/EtharaAI
sudo docker compose up -d
```

Check running containers:

```bash
sudo docker ps
```

Stop the containers:

```bash
sudo docker compose down
```

## Development Mode

The default Docker setup runs the frontend in production mode.
If you change the code, rebuild the containers:

```bash
sudo docker compose up --build
```

For a full clean rebuild:

```bash
sudo docker compose build --no-cache
sudo docker compose up
```

## Manual Backend Setup

Use this only if you want to run the backend without Docker.

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

For Windows:

```bash
venv\Scripts\activate
```

For Linux, macOS, or WSL:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the backend environment file:

```bash
copy .env.example .env
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend will run on:

```txt
http://localhost:8000
```

## Manual Frontend Setup

Use this only if you want to run the frontend without Docker.

```bash
cd frontend
npm install
```

Create the frontend environment file:

```bash
copy .env.example .env
```

Start the frontend:

```bash
npm run dev
```

Frontend will run on:

```txt
http://localhost:5173
```

## API Endpoints

### Products

```txt
POST   /products
GET    /products
GET    /products/{id}
PUT    /products/{id}
DELETE /products/{id}
```

### Customers

```txt
POST   /customers
GET    /customers
GET    /customers/{id}
DELETE /customers/{id}
```

### Orders

```txt
POST   /orders
GET    /orders
GET    /orders/{id}
DELETE /orders/{id}
```

### Dashboard

```txt
GET /dashboard/summary
```

## Docker Hub Backend Image

Build the backend Docker image:

```bash
docker build -t yourdockerusername/inventory-backend:1.0 ./backend
```

Login to Docker Hub:

```bash
docker login
```

Push the image:

```bash
docker push yourdockerusername/inventory-backend:1.0
```

Example Docker Hub image link:

```txt
https://hub.docker.com/r/yourdockerusername/inventory-backend
```

## Deployment

### Backend Deployment on Render

1. Push the project to GitHub.
2. Open Render and create a new Web Service.
3. Connect the GitHub repository.
4. Set the root directory as:

```txt
backend
```

5. Use Docker as the deployment method.
6. Add the required environment variables:

```txt
DATABASE_URL=your_production_postgresql_url
CORS_ORIGINS=your_frontend_deployed_url
```

7. Deploy the backend.
8. After deployment, test the backend URL:

```txt
https://your-backend-url.onrender.com/docs
```

### Frontend Deployment on Vercel

1. Open Vercel and import the GitHub repository.
2. Set the root directory as:

```txt
frontend
```

3. Set the build command:

```txt
npm run build
```

4. Set the output directory:

```txt
dist
```

5. Add the frontend environment variable:

```txt
VITE_API_URL=your_backend_deployed_url
```

6. Deploy the frontend.
7. After deployment, open the live frontend URL and test the full flow.

## Environment Variables

### Backend

```txt
DATABASE_URL=postgresql://username:password@host:port/database_name
CORS_ORIGINS=http://localhost:3000
```

### Frontend

```txt
VITE_API_URL=http://localhost:8000
```

## Final Submission Items

The final submission should include:

```txt
GitHub Repository Link:
https://github.com/yourusername/inventory-order-management-system

Docker Hub Backend Image Link:
https://hub.docker.com/r/yourdockerusername/inventory-backend

Live Frontend URL:
https://your-frontend-url.vercel.app

Live Backend API URL:
https://your-backend-url.onrender.com/docs
```

## Notes

* Do not commit `.env` files to GitHub.
* Keep database credentials in environment variables.
* Test all APIs from Swagger before submitting.
* Test the frontend on desktop and mobile screen sizes.
* Make sure the deployed frontend can connect to the deployed backend.
