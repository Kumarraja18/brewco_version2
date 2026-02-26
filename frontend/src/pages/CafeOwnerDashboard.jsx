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
      if (res.data?.length > 0) {
        setCafes(res.data);
        setSelectedCafe(res.data[0]);
        await loadCafeData(res.data[0].id);
      } else {
          setLoading(false);
      }
    } catch (err) {
      console.error("Failed to load cafes:", err);
      setLoading(false);
    }
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
    // We don't set global loading to true here to avoid flickering
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
    setLoading(false);
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
      }
      
      setIsModalOpen(false);
      setTimeout(() => loadCafeData(selectedCafe.id), 500);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.error || `Failed to add ${modalType}`);
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
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#fdfaf7" }}>
      {/* Premium Sidebar */}
      <aside className="sidebar-premium" style={{ width: "280px", flexShrink: 0, color: "#fff", display: "flex", flexDirection: "column", padding: "20px 0", boxShadow: "4px 0 15px rgba(0,0,0,0.1)" }}>
        
        {/* Profile Section */}
        <div style={{ padding: "0 25px 25px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "var(--accent)", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: "1.5rem", fontWeight: 800, border: "2px solid rgba(255,255,255,0.2)", display: 'flex', justifyContent: 'center' }}>
              {user?.firstName?.charAt(0) || "O"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", color: "var(--cream)" }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px" }}>Cafe Manager</div>
            </div>
          </div>
          
          <div style={{ marginTop: "25px", padding: "12px 15px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", color: "var(--cream)" }}>
              <FaCoffee color="var(--accent)" /> {selectedCafe?.name || "My Café"}
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
                fontSize: "0.95rem",
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
          <button onClick={handleLogout} className="brew-btn" style={{ width: "100%", padding: "12px", background: "rgba(192, 57, 43, 0.1)", border: "1px solid rgba(192, 57, 43, 0.3)", borderRadius: "10px", color: "#ff9999", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto", height: "100vh" }} className="hide-scrollbar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
            <div>
                <h2 className="section-title-premium" style={{ fontSize: "2rem", margin: 0 }}>
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('chefs', 'Chefs').replace('waiters', 'Waiters')}
                </h2>
                <p style={{ color: "var(--muted)", marginTop: "5px", fontSize: "0.95rem" }}>Manage your cafe operations and inventory</p>
            </div>

            {/* Action Buttons */}
            {["menu", "tables", "chefs", "waiters", "bookings"].includes(activeTab) && (
                <div style={{ display: "flex", gap: "12px" }}>
                    {activeTab === "menu" && (
                    <button className="brew-btn" style={{ background: "#fff", color: "var(--brown)", border: "2px solid var(--brown)", padding: "10px 20px" }} onClick={() => handleAddClick("category")}>
                        <FaPlusCircle style={{marginRight: '8px'}} /> Category
                    </button>
                    )}
                    <button className="brew-btn brew-btn--primary" style={{ padding: "10px 25px", color: "#fff" }} onClick={() => handleAddClick(activeTab === "chefs" ? "chef" : activeTab === "waiters" ? "waiter" : activeTab === "menu" ? "menu" : activeTab === "tables" ? "table" : "booking")}>
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
                <div style={{ fontSize: '2.5rem', background: `${card.color}15`, width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                <div>
                    <div style={{ fontSize: "0.9rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.label}</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--dark)" }}>{card.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Menu View — Integrated with Categories */}
        {activeTab === "menu" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {categories.length > 0 ? (
              categories.map(category => {
                const itemsInCat = menuItems.filter(item => item.category?.id === category.id);
                return (
                  <div key={category.id}>
                    <div className="category-header-premium">
                      {category.name} <span style={{ float: 'right', fontSize: '0.8rem', opacity: 0.6 }}>{itemsInCat.length} Items</span>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
                      {itemsInCat.length > 0 ? itemsInCat.map(item => (
                        <div key={item.id} className="card-premium" style={{ display: 'flex', height: '120px' }}>
                          <div style={{ width: '120px', background: item.imageUrl ? `url(${item.imageUrl}) center/cover` : 'var(--cream)', flexShrink: 0 }}></div>
                          <div style={{ padding: "15px 20px", flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 800, color: "var(--dark)", fontSize: '1.05rem' }}>{item.name}</div>
                                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.isAvailable ? "var(--success)" : "var(--danger)" }}></div>
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "var(--muted)", marginTop: '4px' }}>{item.type} • {item.description?.substring(0, 40)}...</div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--brown)", marginTop: '8px' }}>₹{item.price}</div>
                          </div>
                        </div>
                      )) : (
                          <div style={{ gridColumn: '1/-1', padding: '30px', textAlign: 'center', border: '2px dashed var(--cream)', borderRadius: '15px', color: 'var(--muted)' }}>
                              No items added to this category yet.
                          </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "80px 40px", background: "#fff", borderRadius: "20px", border: '2px dashed var(--accent)' }}>
                <h3 style={{ color: "var(--brown)", fontSize: '1.5rem' }}>Your Menu is Empty</h3>
                <p style={{ color: "var(--muted)", marginBottom: '30px' }}>Add categories first, then start adding your signature dishes!</p>
                <button className="brew-btn brew-btn--primary" style={{color: '#fff', padding: '12px 30px'}} onClick={() => handleAddClick("category")}>Create First Category</button>
              </div>
            )}
          </div>
        )}

        {/* Tables View */}
        {activeTab === "tables" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "25px" }}>
            {tables.map(table => (
              <div key={table.id} className="card-premium table-premium" style={{ padding: "35px 20px", textAlign: "center" }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🪑</div>
                <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "var(--brown)" }}>Table {table.tableNumber}</div>
                <div style={{ fontSize: "0.9rem", color: "var(--muted)", margin: "8px 0 15px" }}>{table.capacity} Guests • {table.tableType}</div>
                <div className={table.status === 'AVAILABLE' ? 'status-available' : 'status-occupied'} style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>
                  {table.status}
                </div>
              </div>
            ))}
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
