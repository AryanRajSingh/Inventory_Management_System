import { useEffect, useState } from 'react';
import { apiRequest } from './api.js';

const emptyProduct = { name: '', sku: '', price: '', quantity: '' };
const emptyCustomer = { full_name: '', email: '', phone: '' };

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [orderCustomerId, setOrderCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadAll() {
    try {
      setError('');
      const [summaryData, productData, customerData, orderData] = await Promise.all([
        apiRequest('/dashboard/summary'),
        apiRequest('/products'),
        apiRequest('/customers'),
        apiRequest('/orders'),
      ]);
      setSummary(summaryData);
      setProducts(productData);
      setCustomers(customerData);
      setOrders(orderData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function showSuccess(text) {
    setMessage(text);
    setError('');
    setTimeout(() => setMessage(''), 2500);
  }

  async function handleAddProduct(event) {
    event.preventDefault();
    try {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: productForm.name,
          sku: productForm.sku,
          price: Number(productForm.price),
          quantity: Number(productForm.quantity),
        }),
      });
      setProductForm(emptyProduct);
      showSuccess('Product added successfully');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateProduct(product) {
    const newQuantity = window.prompt('Enter updated quantity', product.quantity);
    if (newQuantity === null) return;

    try {
      await apiRequest(`/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: Number(newQuantity) }),
      });
      showSuccess('Product updated successfully');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      showSuccess('Product deleted successfully');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddCustomer(event) {
    event.preventDefault();
    try {
      await apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(customerForm),
      });
      setCustomerForm(emptyCustomer);
      showSuccess('Customer added successfully');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCustomer(id) {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await apiRequest(`/customers/${id}`, { method: 'DELETE' });
      showSuccess('Customer deleted successfully');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function updateOrderItem(index, field, value) {
    setOrderItems((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addOrderRow() {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  }

  function removeOrderRow(index) {
    setOrderItems(orderItems.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleCreateOrder(event) {
    event.preventDefault();
    try {
      await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: Number(orderCustomerId),
          items: orderItems.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
          })),
        }),
      });
      setOrderCustomerId('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      showSuccess('Order created successfully. Stock updated automatically.');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteOrder(id) {
    if (!window.confirm('Cancel/delete this order? Stock will be restored.')) return;
    try {
      await apiRequest(`/orders/${id}`, { method: 'DELETE' });
      showSuccess('Order cancelled and stock restored');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          {/* <p className="eyebrow">Production Ready Starter</p> */}
          <h1>Inventory Management System</h1>
          {/* <p>Manage products, customers, orders and stock from one dashboard.</p> */}
        </div>
      </header>

      <nav className="tabs">
        {['dashboard', 'products', 'customers', 'orders'].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {activeTab === 'dashboard' && (
        <section className="grid cards">
          <SummaryCard title="Total Products" value={summary?.total_products ?? 0} />
          <SummaryCard title="Total Customers" value={summary?.total_customers ?? 0} />
          <SummaryCard title="Total Orders" value={summary?.total_orders ?? 0} />
          <SummaryCard title="Low Stock Products" value={summary?.low_stock_products ?? 0} />
        </section>
      )}

      {activeTab === 'products' && (
        <section className="section-grid">
          <form className="card form" onSubmit={handleAddProduct}>
            <h2>Add Product</h2>
            <input placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            <input placeholder="SKU / Code" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} required />
            <input placeholder="Price" type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
            <input placeholder="Quantity" type="number" min="0" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} required />
            <button>Add Product</button>
          </form>

          <DataCard title="Product List">
            <table>
              <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>₹{product.price}</td>
                    <td className={product.quantity <= 5 ? 'low' : ''}>{product.quantity}</td>
                    <td>
                      <button className="small" onClick={() => handleUpdateProduct(product)}>Update Stock</button>
                      <button className="small danger" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataCard>
        </section>
      )}

      {activeTab === 'customers' && (
        <section className="section-grid">
          <form className="card form" onSubmit={handleAddCustomer}>
            <h2>Add Customer</h2>
            <input placeholder="Full name" value={customerForm.full_name} onChange={(e) => setCustomerForm({ ...customerForm, full_name: e.target.value })} required />
            <input placeholder="Email" type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} required />
            <input placeholder="Phone" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} required />
            <button>Add Customer</button>
          </form>

          <DataCard title="Customer List">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Action</th></tr></thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.full_name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td><button className="small danger" onClick={() => handleDeleteCustomer(customer.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataCard>
        </section>
      )}

      {activeTab === 'orders' && (
        <section className="section-grid">
          <form className="card form" onSubmit={handleCreateOrder}>
            <h2>Create Order</h2>
            <select value={orderCustomerId} onChange={(e) => setOrderCustomerId(e.target.value)} required>
              <option value="">Select customer</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name}</option>)}
            </select>

            {orderItems.map((item, index) => (
              <div className="order-row" key={index}>
                <select value={item.product_id} onChange={(e) => updateOrderItem(index, 'product_id', e.target.value)} required>
                  <option value="">Select product</option>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name} - Stock {product.quantity}</option>)}
                </select>
                <input type="number" min="1" value={item.quantity} onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)} required />
                {orderItems.length > 1 && <button type="button" className="small danger" onClick={() => removeOrderRow(index)}>Remove</button>}
              </div>
            ))}

            <button type="button" className="secondary" onClick={addOrderRow}>+ Add Product</button>
            <button>Create Order</button>
          </form>

          <DataCard title="Order List">
            <table>
              <thead><tr><th>ID</th><th>Customer ID</th><th>Total</th><th>Items</th><th>Action</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_id}</td>
                    <td>₹{order.total_amount}</td>
                    <td>{order.items?.length || 0}</td>
                    <td><button className="small danger" onClick={() => handleDeleteOrder(order.id)}>Cancel</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataCard>
        </section>
      )}
    </main>
  );
}

function SummaryCard({ title, value }) {
  return (
    <article className="card summary-card">
      <p>{title}</p>
      <strong>{value}</strong>
    </article>
  );
}

function DataCard({ title, children }) {
  return (
    <article className="card data-card">
      <h2>{title}</h2>
      <div className="table-wrap">{children}</div>
    </article>
  );
}

export default App;
