import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosClient";
import toast from "react-hot-toast";
import {
  FaCoffee, FaMoneyBillWave, FaShoppingCart, FaCheckCircle,
  FaClipboardList, FaChair, FaCalendarAlt, FaUtensils, FaUserFriends,
  FaUserCircle, FaSignOutAlt, FaPlus, FaPlusCircle
} from "react-icons/fa";
import "../styles/dashboard.css";
import AddItemModal from "../model/addItemModel"

const SIDEBAR_ITEMS = [
  { key: "overview", icon: <FaCoffee />, label: "Dashboard" },
  { key: "orders", icon: <FaShoppingCart />, label: "Orders" },
  { key: "menu", icon: <FaClipboardList />, label: "Menu Items" },
  { key: "tables", icon: <FaChair />, label: "Tables" },
  { key: "chefs", icon: <FaUtensils />, label: "Chefs" },
  { key: "waiters", icon: <FaUserFriends />, label: "Waiters" },
  { key: "bookings", icon: <FaCalendarAlt />, label: "Bookings" },
  { key: "profile", icon: <FaUserCircle />, label: "My Profile" },
];

export default function CafeOwnerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Main States
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Sub-data
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Filter States
  const [menuFilter, setMenuFilter] = useState("ALL");
  const [tableCapacityFilter, setTableCapacityFilter] = useState("ALL");
  const [tableTypeFilter, setTableTableTypeFilter] = useState("ALL");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");

  // Modal states
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load cafes on mount
  useEffect(() => {
    loadCafes();
  }, []);

  const loadCafes = async () => {
    try {
      const res = await api.get("/cafe-owner/cafes");
      setCafes(res.data || []);
      if (res.data?.length > 0) {
        setSelectedCafe(res.data[0]);
        await loadCafeData(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load cafes:", err);
      // Only use mock if we have absolutely no data and it's a real failure
      if (cafes.length === 0) {
          console.warn("Using fallback view");
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const loadCafeData = async (cafeId) => {
    // Each fetcher has its own try-catch internally via the map
    const fetchers = [
      { key: "dashboard", url: `/cafe-owner/cafes/${cafeId}/dashboard`, setter: setDashboard },
      { key: "orders", url: `/cafe-owner/cafes/${cafeId}/orders`, setter: setOrders },
      { key: "tables", url: `/cafe-owner/cafes/${cafeId}/tables`, setter: setTables },
      { key: "categories", url: `/cafe-owner/cafes/${cafeId}/menu/categories`, setter: setCategories },
      { key: "items", url: `/cafe-owner/cafes/${cafeId}/menu/items`, setter: setMenuItems },
      { key: "staff", url: `/cafe-owner/cafes/${cafeId}/staff`, setter: setStaff },
      { key: "bookings", url: `/cafe-owner/cafes/${cafeId}/bookings`, setter: setBookings },
    ];

    await Promise.all(
      fetchers.map(async (f) => {
        try {
          const res = await api.get(f.url);
          f.setter(res.data || []);
        } catch (err) {
          console.error(`Failed to load ${f.key}:`, err.response?.data || err.message);
        }
      })
    );
  };

  const handleAddClick = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    if (!selectedCafe) return;
    
    try {
      if (modalType === "chef" || modalType === "waiter") {
        await api.post(`/cafe-owner/cafes/${selectedCafe.id}/staff`, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: modalType.toUpperCase()
        });
        toast.success(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} added successfully!`);
      } else if (modalType === "category") {
        await api.post(`/cafe-owner/cafes/${selectedCafe.id}/menu/categories`, {
          name: data.name,
          displayOrder: parseInt(data.displayOrder || 0),
          isActive: true
        });
        toast.success("Category saved!");
      } else if (modalType === "menu") {
        const itemPayload = {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          type: data.type,
          categoryId: parseInt(data.categoryId),
          isAvailable: data.isAvailable
        };
        await api.post(`/cafe-owner/cafes/${selectedCafe.id}/menu/items`, itemPayload);
        toast.success("Menu item added!");
      } else if (modalType === "table") {
        await api.post(`/cafe-owner/cafes/${selectedCafe.id}/tables`, {
          tableNumber: parseInt(data.tableName),
          capacity: parseInt(data.capacity),
          tableType: data.tableType,
          status: data.status
        });
        toast.success("Table added!");
      } else if (modalType === "booking") {
        const hour = parseInt(data.displayOrder || 12);
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        
        await api.post(`/cafe-owner/cafes/${selectedCafe.id}/bookings`, {
          customerName: data.firstName + " " + data.lastName,
          customerEmail: data.email,
          customerPhone: data.phone,
          bookingDate: data.dob,
          startTime: startTime,
          numberOfGuests: parseInt(data.capacity),
          status: "CONFIRMED"
        });
        toast.success("Booking confirmed!");
      }
      
      setIsModalOpen(false);
      // Wait for the data to reload properly
      await loadCafeData(selectedCafe.id);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.error || `Failed to add ${modalType}`);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/cafe-owner/cafes/${selectedCafe.id}/bookings/${bookingId}/status`, { status: newStatus });
      toast.success(`Booking ${newStatus.toLowerCase()}!`);
      await loadCafeData(selectedCafe.id);
    } catch (err) {
      toast.error("Failed to update booking");
    }
  };

  if (loading && cafes.length === 0) return <div className="dashboard-page"><div className="brew-spinner" /></div>;

  if (!selectedCafe && !loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="empty-state__icon">🏪</div>
          <div className="empty-state__text">No café registered yet</div>
          <button className="brew-btn brew-btn--primary" onClick={() => navigate("/cafe-setup")}>
            Set Up Your Café
          </button>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === "PLACED");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f0ebe4", fontFamily: "'Inter', sans-serif" }}>
      {/* Premium Sidebar */}
      <aside className="sidebar-premium" style={{ width: "280px", flexShrink: 0, color: "#fff", display: "flex", flexDirection: "column", padding: "20px 0", boxShadow: "4px 0 15px rgba(0,0,0,0.1)" }}>
        
        {/* Profile Section */}
        <div style={{ padding: "0 25px 25px", borderBottom: "1px solid rgba(166, 124, 82, 0.18)", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
              {user?.firstName?.charAt(0) || "O"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: "1.2", color: "#f5e9dc", wordWrap: "break-word" }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: "0.72rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginTop: "4px", color: "#a67c52" }}>Cafe Manager</div>
            </div>
          </div>
          
          {/* Cafe Name separate box */}
          <div style={{ marginTop: "20px", padding: "10px 15px", background: "rgba(166, 124, 82, 0.12)", borderRadius: "10px", border: "1px solid rgba(166, 124, 82, 0.18)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", color: "#f5e9dc" }}>
              <FaCoffee color="#a67c52" /> {selectedCafe?.name || "My Café"}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }} className="hide-scrollbar">
          {SIDEBAR_ITEMS.map((item) => (
            <div
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`nav-item-premium ${activeTab === item.key ? "active" : ""}`}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                borderRadius: "10px",
                fontSize: "0.88rem",
                fontWeight: 500,
                color: activeTab === item.key ? "#fff" : "rgba(245,233,220,0.7)",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.key === "orders" && pendingOrders.length > 0 && (
                <span style={{ marginLeft: "auto", background: "var(--danger)", color: "#fff", borderRadius: "12px", padding: "2px 8px", fontSize: "0.7rem", fontWeight: 800 }}>
                  {pendingOrders.length}
                </span>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "20px" }}>
          <button onClick={handleLogout} className="brew-btn" style={{ width: "100%", padding: "12px", background: "rgba(192, 57, 43, 0.1)", border: "1px solid rgba(192, 57, 43, 0.3)", borderRadius: "10px", color: "#ff9999", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 600 }}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto", height: "100vh" }} className="hide-scrollbar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
            <div>
                <h2 className="section-title-premium" style={{ fontSize: "1.8rem", margin: 0, fontWeight: 800, color: '#2e241f' }}>
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('chefs', 'Chefs').replace('waiters', 'Waiters')}
                </h2>
                <p style={{ color: "#8b6f63", marginTop: "5px", fontSize: "0.9rem", fontWeight: 500 }}>Manage your cafe operations and inventory</p>
            </div>

            {/* Action Buttons */}
            {["menu", "tables", "chefs", "waiters", "bookings"].includes(activeTab) && (
                <div style={{ display: "flex", gap: "12px" }}>
                    {activeTab === "menu" && (
                    <button className="brew-btn" style={{ background: "#fff", color: "var(--brown)", border: "2px solid var(--brown)", padding: "10px 20px", fontSize: '0.8rem' }} onClick={() => handleAddClick("category")}>
                        <FaPlusCircle style={{marginRight: '8px'}} /> Category
                    </button>
                    )}
                    <button className="brew-btn brew-btn--primary" style={{ padding: "10px 25px", color: "#fff", fontSize: '0.8rem' }} onClick={() => handleAddClick(activeTab === "chefs" ? "chef" : activeTab === "waiters" ? "waiter" : activeTab === "menu" ? "menu" : activeTab === "tables" ? "table" : "booking")}>
                        <FaPlus style={{marginRight: '8px'}} /> {activeTab === "menu" ? "Item" : activeTab.slice(0, -1)}
                    </button>
                </div>
            )}
        </div>

        {/* Tab Views */}
        
        {/* Dashboard Overview */}
        {activeTab === "overview" && dashboard && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "25px" }}>
            {[
              { label: "Total Revenue", value: `₹${dashboard.totalRevenue}`, icon: "💰", color: "#27ae60" },
              { label: "Today's Orders", value: dashboard.todayOrders, icon: "☕", color: "#e67e22" },
              { label: "Available Tables", value: dashboard.availableTables, icon: "🪑", color: "#2980b9" },
              { label: "Total Staff", value: (dashboard.totalChefs || 0) + (dashboard.totalWaiters || 0), icon: "👥", color: "#8e44ad" }
            ].map((card, i) => (
              <div key={i} className="card-premium" style={{ padding: "30px", display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '2rem', background: `${card.color}15`, width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                <div>
                    <div style={{ fontSize: "0.72rem", color: "#8b6f63", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>{card.label}</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2e241f" }}>{card.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders View */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {orders.length > 0 ? (
              orders.map(order => (
                <div key={order.id} className="card-premium" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `6px solid ${order.status === 'PLACED' ? '#f59e0b' : '#27ae60'}` }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827" }}>Order #{order.orderRef}</div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "0.82rem", color: "#6b7280", fontWeight: 500 }}>
                      <span>{order.orderType}</span>
                      <span>•</span>
                      <span>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      {order.table && <span>• Table {order.table.tableNumber}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827" }}>₹{order.grandTotal}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.7rem", marginTop: "4px", color: order.status === "PLACED" ? "#f59e0b" : "#27ae60", textTransform: "uppercase" }}>{order.status}</div>
                    </div>
                    {order.status === 'PLACED' && (
                      <button 
                        onClick={async () => {
                          try {
                            await api.put(`/cafe-owner/cafes/${selectedCafe.id}/orders/${order.id}/confirm`);
                            toast.success("Order confirmed!");
                            loadCafeData(selectedCafe.id);
                          } catch (err) { toast.error("Failed to confirm"); }
                        }}
                        className="brew-btn brew-btn--primary" 
                        style={{ padding: "8px 15px", fontSize: "0.75rem", borderRadius: '8px' }}
                      >Confirm</button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px", color: "#8b6f63", border: '1px dashed #d4c0a8' }}>
                No orders received yet.
              </div>
            )}
          </div>
        )}

        {/* Menu View — Integrated with Categories */}
        {activeTab === "menu" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Category Filter Bar */}
            <div className="admin-filter-pills hide-scrollbar">
              <button
                onClick={() => setMenuFilter("ALL")}
                className={`admin-filter-pill ${menuFilter === "ALL" ? "active" : ""}`}
              >
                All Items
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setMenuFilter(cat.id)}
                  className={`admin-filter-pill ${menuFilter === cat.id ? "active" : ""}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {categories.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
                {categories
                  .filter(cat => menuFilter === "ALL" || cat.id === menuFilter)
                  .map(category => {
                    const itemsInCat = menuItems.filter(item => item.category?.id === category.id);
                    if (menuFilter === "ALL" && itemsInCat.length === 0) return null;
                    
                    return (
                      <div key={category.id}>
                        <div className="category-header-premium">
                          {category.name} <span style={{ float: 'right', fontSize: '0.75rem', opacity: 0.6 }}>{itemsInCat.length} Items</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
                          {itemsInCat.map(item => (
                            <div key={item.id} className="card-premium" style={{ display: 'flex', height: '120px' }}>
                              <div style={{ width: '120px', background: item.imageUrl ? `url(${item.imageUrl}) center/cover` : '#f3f4f6', flexShrink: 0 }}></div>
                              <div style={{ padding: "15px 20px", flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 800, color: "#111827", fontSize: '1rem' }}>{item.name}</div>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.isAvailable ? "var(--success)" : "var(--danger)" }}></div>
                                </div>
                                <div style={{ fontSize: "0.82rem", color: "#8b6f63", marginTop: '4px' }}>
                                  {item.type}
                                </div>
                                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6b4e3d", marginTop: '8px' }}>₹{item.price}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                {menuFilter !== "ALL" && menuItems.filter(item => item.category?.id === menuFilter).length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '16px', color: '#8b6f63', border: '1px dashed #d4c0a8' }}>
                    No items found in this category.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 40px", background: "#fff", borderRadius: "16px", border: '1px dashed #d1d5db' }}>
                <h3 style={{ color: "#374151", fontSize: '1.25rem' }}>Your Menu is Empty</h3>
                <p style={{ color: "#6b7280", marginBottom: '25px' }}>Start by creating your first category.</p>
                <button className="brew-btn brew-btn--primary" style={{padding: '10px 25px'}} onClick={() => handleAddClick("category")}>Create Category</button>
              </div>
            )}
          </div>
        )}

        {/* Tables View */}
        {activeTab === "tables" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Table Filters */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "5px" }}>
              <div className="admin-filter-group">
                <label className="admin-filter-label">Capacity</label>
                <select 
                  value={tableCapacityFilter} 
                  onChange={(e) => setTableCapacityFilter(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="ALL">All Capacities</option>
                  <option value="2">2 Members</option>
                  <option value="4">4 Members</option>
                  <option value="6">6 Members</option>
                  <option value="8">8+ Members</option>
                </select>
              </div>
              <div className="admin-filter-group">
                <label className="admin-filter-label">Table Type</label>
                <select 
                  value={tableTypeFilter} 
                  onChange={(e) => setTableTableTypeFilter(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="ALL">All Types</option>
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="EXCLUSIVE">Exclusive</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "25px" }}>
              {tables
                .filter(t => (tableCapacityFilter === "ALL" || (tableCapacityFilter === "8" ? t.capacity >= 8 : t.capacity === parseInt(tableCapacityFilter))))
                .filter(t => (tableTypeFilter === "ALL" || t.tableType === tableTypeFilter))
                .map(table => (
                  <div key={table.id} className="card-premium" style={{ padding: "30px 20px", textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: "1.25rem", color: "#111827" }}>Table {table.tableNumber}</div>
                    <div style={{ fontSize: "0.85rem", color: "#6b7280", margin: "8px 0 15px" }}>{table.capacity} Guests • {table.tableType}</div>
                    <div style={{ 
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: table.status === 'AVAILABLE' ? '#dcfce7' : '#fee2e2',
                        color: table.status === 'AVAILABLE' ? '#16a34a' : '#dc2626'
                    }}>
                      {table.status}
                    </div>
                  </div>
                ))}
              {tables
                .filter(t => (tableCapacityFilter === "ALL" || (tableCapacityFilter === "8" ? t.capacity >= 8 : t.capacity === parseInt(tableCapacityFilter))))
                .filter(t => (tableTypeFilter === "ALL" || t.tableType === tableTypeFilter))
                .length === 0 && (
                  <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '16px', color: '#8b6f63', border: '1px dashed #d4c0a8' }}>
                    No tables match the selected filters.
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Staff Views */}
        {["chefs", "waiters"].includes(activeTab) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" }}>
            {staff.filter(s => s.role === (activeTab === 'chefs' ? 'CHEF' : 'WAITER')).map(s => (
              <div key={s.id} className="card-premium" style={{ padding: "25px", display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, var(--brown), var(--accent))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: '1.5rem', fontWeight: 900 }}>
                    {s.staff.firstName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--dark)' }}>{s.staff.firstName} {s.staff.lastName}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{s.staff.email}</div>
                  <div style={{ fontSize: "0.75rem", background: 'var(--light-cream)', color: 'var(--brown)', padding: '2px 8px', borderRadius: '5px', marginTop: '8px', display: 'inline-block', fontWeight: 700 }}>ID: STAFF-{s.staff.id}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings View */}
        {activeTab === "bookings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Booking Filters */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "5px" }}>
              <div className="admin-filter-group">
                <label className="admin-filter-label">Booking Status</label>
                <select 
                  value={bookingStatusFilter} 
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="ALL">All Bookings</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gap: "15px" }}>
              {bookings
                .filter(b => bookingStatusFilter === "ALL" || b.status === bookingStatusFilter)
                .map(b => (
                  <div key={b.id} className="card-premium" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
                      <div style={{ padding: "12px", background: "#faf8f5", borderRadius: "12px", textAlign: "center", minWidth: "85px", border: "1px solid #ece5dc" }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#8b6f63", textTransform: "uppercase" }}>{new Date(b.bookingDate).toLocaleDateString('en-US', {month: 'short'})}</div>
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#2e241f" }}>{new Date(b.bookingDate).getDate()}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#2e241f" }}>
                          {b.customer?.firstName ? `${b.customer.firstName} ${b.customer.lastName}` : b.customerName || "Walk-in Guest"}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#8b6f63", marginTop: "4px", display: "flex", gap: "15px" }}>
                          <span>Time: {b.startTime}</span>
                          <span>Guests: {b.numberOfGuests}</span>
                          <span>Ref: #{b.bookingRef}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <div style={{ 
                          padding: "6px 15px", 
                          borderRadius: "20px", 
                          fontSize: "0.75rem", 
                          fontWeight: 700,
                          background: b.status === 'CONFIRMED' ? '#eaf7ed' : b.status === 'PENDING' ? '#fef3e2' : '#fdf2f2',
                          color: b.status === 'CONFIRMED' ? '#27ae60' : b.status === 'PENDING' ? '#e67e22' : '#c0392b',
                          textTransform: "uppercase"
                      }}>
                        {b.status}
                      </div>
                      
                      {b.status === 'PENDING' && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'CONFIRMED')}
                            className="brew-btn" 
                            style={{ padding: "6px 12px", fontSize: "0.75rem", background: "#27ae60", color: "#fff", border: "none" }}
                          >Confirm</button>
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'CANCELLED')}
                            className="brew-btn" 
                            style={{ padding: "6px 12px", fontSize: "0.75rem", background: "#c0392b", color: "#fff", border: "none" }}
                          >Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {bookings.filter(b => bookingStatusFilter === "ALL" || b.status === bookingStatusFilter).length === 0 && (
                <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '16px', color: '#8b6f63', border: '1px dashed #d4c0a8' }}>
                  No bookings found for this filter.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* Personal Details Card */}
            <div className="card-premium" style={{ padding: "35px" }}>
              <div className="category-header-premium" style={{ marginBottom: "25px", borderLeftColor: "#a67c52" }}>
                <FaUserCircle style={{ marginRight: "10px", verticalAlign: "middle" }} /> Personal Details
              </div>
              <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
                <div style={{ width: "120px", height: "120px", borderRadius: "24px", background: "linear-gradient(135deg, #1e1610 0%, #a67c52 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", fontWeight: 800 }}>
                  {user?.firstName?.charAt(0)}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                  <div className="admin-filter-group">
                    <label className="admin-filter-label">Full Name</label>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#2e241f" }}>{user?.firstName} {user?.lastName}</div>
                  </div>
                  <div className="admin-filter-group">
                    <label className="admin-filter-label">Email Address</label>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#2e241f" }}>{user?.email}</div>
                  </div>
                  <div className="admin-filter-group">
                    <label className="admin-filter-label">Phone Number</label>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#2e241f" }}>{user?.phoneNumber || user?.phone || "Not Provided"}</div>
                  </div>
                  <div className="admin-filter-group">
                    <label className="admin-filter-label">Account Role</label>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "#a67c52" }}>{user?.role?.replace("ROLE_", "")}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cafe Details Card */}
            <div className="card-premium" style={{ padding: "35px" }}>
              <div className="category-header-premium" style={{ marginBottom: "25px", borderLeftColor: "#a67c52" }}>
                <FaCoffee style={{ marginRight: "10px", verticalAlign: "middle" }} /> Business Information
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "30px" }}>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Café Name</label>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#2e241f" }}>{selectedCafe?.name}</div>
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">GST Number</label>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#2e241f" }}>{selectedCafe?.gstNumber || "N/A"}</div>
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Status</label>
                  <div style={{ 
                    display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
                    background: selectedCafe?.isVerified ? "#eaf7ed" : "#fef3e2", color: selectedCafe?.isVerified ? "#27ae60" : "#e67e22"
                  }}>
                    {selectedCafe?.isVerified ? "VERIFIED" : "VERIFICATION PENDING"}
                  </div>
                </div>
                <div className="admin-filter-group" style={{ gridColumn: "span 3" }}>
                  <label className="admin-filter-label">Full Address</label>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#2e241f" }}>
                    {selectedCafe?.address}, {selectedCafe?.city}, {selectedCafe?.state} - {selectedCafe?.zipCode}
                  </div>
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Operating Hours</label>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#2e241f" }}>
                    {selectedCafe?.openingTime} - {selectedCafe?.closingTime}
                  </div>
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Primary Contact</label>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "#2e241f" }}>{selectedCafe?.contactNumber}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <AddItemModal
          type={modalType}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          menuItems={menuItems}
          categories={categories}
        />
      </main>
    </div>
  );
}
