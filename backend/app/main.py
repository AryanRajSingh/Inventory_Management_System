from decimal import Decimal
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import Base, engine, get_db, settings
from .models import Customer, Order, OrderItem, Product
from .schemas import (
    CustomerCreate,
    CustomerOut,
    DashboardSummary,
    OrderCreate,
    OrderOut,
    ProductCreate,
    ProductOut,
    ProductUpdate,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API", version="1.0.0")

allowed_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    return DashboardSummary(
        total_products=db.query(Product).count(),
        total_customers=db.query(Customer).count(),
        total_orders=db.query(Order).count(),
        low_stock_products=db.query(Product).filter(Product.quantity <= 5).count(),
    )


# ---------------- PRODUCTS ----------------
@app.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=409, detail="Product SKU already exists")

    product = Product(**payload.model_dump())
    db.add(product)
    try:
        db.commit()
        db.refresh(product)
        return product
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid product data")


@app.get("/products", response_model=List[ProductOut])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id.desc()).all()


@app.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "sku" in update_data:
        duplicate = db.query(Product).filter(Product.sku == update_data["sku"], Product.id != product_id).first()
        if duplicate:
            raise HTTPException(status_code=409, detail="Product SKU already exists")

    for key, value in update_data.items():
        setattr(product, key, value)

    try:
        db.commit()
        db.refresh(product)
        return product
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid product update")


@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.order_items:
        raise HTTPException(status_code=400, detail="Product exists in orders, so it cannot be deleted")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}


# ---------------- CUSTOMERS ----------------
@app.post("/customers", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Customer email already exists")

    customer = Customer(**payload.model_dump())
    db.add(customer)
    try:
        db.commit()
        db.refresh(customer)
        return customer
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid customer data")


@app.get("/customers", response_model=List[CustomerOut])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.id.desc()).all()


@app.get("/customers/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if customer.orders:
        raise HTTPException(status_code=400, detail="Customer has orders, so it cannot be deleted")

    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted successfully"}


# ---------------- ORDERS ----------------
@app.post("/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    qty_by_product = {}
    for item in payload.items:
        qty_by_product[item.product_id] = qty_by_product.get(item.product_id, 0) + item.quantity

    products = (
        db.query(Product)
        .filter(Product.id.in_(qty_by_product.keys()))
        .with_for_update()
        .all()
    )
    product_map = {product.id: product for product in products}

    missing_ids = set(qty_by_product.keys()) - set(product_map.keys())
    if missing_ids:
        raise HTTPException(status_code=404, detail=f"Product not found: {sorted(missing_ids)}")

    total_amount = Decimal("0.00")
    order_lines = []

    for product_id, requested_qty in qty_by_product.items():
        product = product_map[product_id]
        if product.quantity < requested_qty:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}. Available: {product.quantity}, requested: {requested_qty}",
            )

        unit_price = product.price
        line_total = unit_price * requested_qty
        total_amount += line_total
        product.quantity -= requested_qty

        order_lines.append(
            {
                "product_id": product_id,
                "quantity": requested_qty,
                "unit_price": unit_price,
                "line_total": line_total,
            }
        )

    order = Order(customer_id=payload.customer_id, total_amount=total_amount, status="PLACED")
    db.add(order)
    db.flush()

    for line in order_lines:
        db.add(OrderItem(order_id=order.id, **line))

    try:
        db.commit()
        db.refresh(order)
        return order
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Order could not be created")


@app.get("/orders", response_model=List[OrderOut])
def get_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.id.desc()).all()


@app.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Cancel logic: restore stock before deleting the order.
    for item in order.items:
        product = db.get(Product, item.product_id)
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
    return {"message": "Order cancelled/deleted successfully and stock restored"}
