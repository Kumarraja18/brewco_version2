import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosClient";
import toast from "react-hot-toast";
import {
  FaCoffee, FaMoneyBillWave, FaShoppingCart, FaCheckCircle,
  FaClipboardList, FaChair, FaCalendarAlt, FaUtensils, FaUserFriends,
  FaUserCircle, FaSignOutAlt, FaPlus, FaPlusCircle, FaEdit, FaLock
} from "react-icons/fa";
import "../styles/dashboard.css";
import AddItemModal from "../model/addItemModel";

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

const STATUS_COLORS = {
  PENDING_BOOKING: "#9ca3af", PLACED: "#f59e0b", CONFIRMED: "#3b82f6", SENT_TO_KITCHEN: "#8b5cf6",
  PREPARING: "#f97316", READY: "#10b981", DELIVERED: "#6b7280", CANCELLED: "#ef4444"
};

export default function CafeOwnerDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [menuFilter, setMenuFilter] = useState("ALL");
  const [tableCapacityFilter, setTableCapacityFilter] = useState("ALL");
  const [tableTypeFilter, setTableTableTypeFilter] = useState("ALL");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [bookingDateFilter, setBookingDateFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

  const [renamingCatId, setRenamingCatId] = useState(null);
  const [renameCatName, setRenameCatName] = useState("");

  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit hours modal
  const [editHours, setEditHours] = useState(false);
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");

  // Change password modal
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Assign staff modal for an order
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [assignChefId, setAssignChefId] = useState("");
  const [assignWaiterId, setAssignWaiterId] = useState("");

  const selectedCafeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadCafes();
  }, []);

  // Auto-refresh orders and bookings every 30 seconds
  useEffect(() => {
    if (selectedCafeRef.current) {
      intervalRef.current = setInterval(() => {
        refreshLive(selectedCafeRef.current.id);
      }, 30000);
    }
    return () => clearInterval(intervalRef.current);
  }, [selectedCafe]);

  const refreshLive = async (cafeId) => {
    try {
      const [ordRes, bookRes, dashRes] = await Promise.all([
        api.get(`/cafe-owner/cafes/${cafeId}/orders`),
        api.get(`/cafe-owner/cafes/${cafeId}/bookings`),
        api.get(`/cafe-owner/cafes/${cafeId}/dashboard`),
      ]);
      setOrders(ordRes.data || []);
      setBookings(bookRes.data || []);
      setDashboard(dashRes.data || null);
    } catch (e) { /* silent refresh */ }
  };

  const loadCafes = async () => {
    try {
      const res = await api.get("/cafe-owner/cafes");
      setCafes(res.data || []);
      if (res.data?.length > 0) {
        setSelectedCafe(res.data[0]);
        selectedCafeRef.current = res.data[0];
        await loadCafeData(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load cafes:", err);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const loadCafeData = async (cafeId) => {
    const fetchers = [
      { key: "dashboard", url: `/cafe-owner/cafes/${cafeId}/dashboard`, setter: setDashboard },
      { key: "orders", url: `/cafe-owner/cafes/${cafeId}/orders`, setter: setOrders },
      { key: "tables", url: `/cafe-owner/cafes/${cafeId}/tables`, setter: setTables },
      { key: "categories", url: `/cafe-owner/cafes/${cafeId}/menu/categories`, setter: setCategories },
      { key: "items", url: `/cafe-owner/cafes/${cafeId}/menu/items`, setter: setMenuItems },
      { key: "staff", url: `/cafe-owner/cafes/${cafeId}/staff`, setter: setStaff },
      { key: "bookings", url: `/cafe-owner/cafes/${cafeId}/bookings`, setter: setBookings },
    ];
    await Promise.all(fetchers.map(async (f) => {
      try {
        const res = await api.get(f.url);
        f.setter(res.data || []);
      } catch (err) {
        console.error(`Failed to load ${f.key}:`, err.response?.data || err.message);
      }
    }));
  };

  const handleAddClick = (type) => { setModalType(type); setIsModalOpen(true); };

  const handleSave = async (data) => {
    if (!selectedCafe) return;
    try {
      if (modalType === "chef" || modalType === "waiter") {
        await api.post(`/cafe-owner/cafes/${selectedCafe.id}/staff`, {
          firstName: data.firstName, lastName: data.lastName, email: data.email, role: modalType.toUpperCase()
        });
        toast.success(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} added!`);
      } else if (modalType === "category") {
        await api.post(`/cafe-owner/cafes/${selectedCafe.id}/menu/categories`, {
          name: data.name, displayOrder: parseInt(data.displayOrder || 0), isActive: true
        });
        toast.success("Category saved!");
      } else if (modalType === "menu") {
        await api.post(`/cafe-owner/cafes/${selectedCafe.id}/menu/items`, {
          name: data.name, description: data.description, price: parseFloat(data.price),
          type: data.type, categoryId: parseInt(data.categoryId),
          isAvailable: data.isAvailable, imageUrl: data.imageUrl || ""
        });
        toast.success("Menu item added!");
      } else if (modalType === "table") {
        await api.post(`/cafe-owner/cafes/${selectedCafe.id}/tables`, {
          tableNumber: parseInt(data.tableName), capacity: parseInt(data.capacity),
          tableType: data.tableType, status: data.status
        });
        toast.success("Table added!");
      } else if (modalType === "booking") {
        await api.post(`/cafe-owner/cafes/${selectedCafe.id}/bookings`, {
          customerName: data.firstName + " " + data.lastName,
          customerEmail: data.email, customerPhone: data.phone,
          bookingDate: data.dob, startTime: data.startTime || "12:00",
          slotDuration: parseInt(data.slotDuration || 60),
          numberOfGuests: parseInt(data.capacity), status: "CONFIRMED"
        });
        toast.success("Booking confirmed!");
      }
      setIsModalOpen(false);
      await loadCafeData(selectedCafe.id);
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to add ${modalType}`);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/cafe-owner/cafes/${selectedCafe.id}/bookings/${bookingId}/status`, { status: newStatus });
      toast.success(`Booking ${newStatus.toLowerCase()}!`);
      await refreshLive(selectedCafe.id);
    } catch (err) { toast.error("Failed to update booking"); }
  };

  const toggleMenuAvailability = async (item) => {
    try {
      await api.put(`/cafe-owner/cafes/${selectedCafe.id}/menu/items/${item.id}`, { isAvailable: !item.isAvailable });
      toast.success(item.isAvailable ? "Item marked unavailable" : "Item marked available");
      const res = await api.get(`/cafe-owner/cafes/${selectedCafe.id}/menu/items`);
      setMenuItems(res.data || []);
    } catch (err) { toast.error("Failed to update item"); }
  };

  const toggleTableStatus = async (table) => {
    const newStatus = table.status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE";
    try {
      await api.put(`/cafe-owner/cafes/${selectedCafe.id}/tables/${table.id}`, { status: newStatus });
      toast.success(`Table ${table.tableNumber} set to ${newStatus}`);
      const res = await api.get(`/cafe-owner/cafes/${selectedCafe.id}/tables`);
      setTables(res.data || []);
    } catch (err) { toast.error("Failed to update table"); }
  };

  const handleAssignStaff = async (orderId) => {
    const payload = {};
    if (assignChefId) payload.chefId = parseInt(assignChefId);
    if (assignWaiterId) payload.waiterId = parseInt(assignWaiterId);
    try {
      await api.put(`/cafe-owner/cafes/${selectedCafe.id}/orders/${orderId}/assign`, payload);
      toast.success("Staff assigned!");
      setAssignOrderId(null);
      setAssignChefId(""); setAssignWaiterId("");
      await refreshLive(selectedCafe.id);
    } catch (err) { toast.error(err.response?.data?.error || "Failed to assign staff"); }
  };

  const handleSaveHours = async () => {
    try {
      await api.put(`/cafe-owner/cafes/${selectedCafe.id}`, { openingTime, closingTime });
      toast.success("Operating hours updated!");
      setEditHours(false);
      const res = await api.get("/cafe-owner/cafes");
      setCafes(res.data || []);
      const updated = res.data.find(c => c.id === selectedCafe.id);
      if (updated) { setSelectedCafe(updated); selectedCafeRef.current = updated; }
    } catch (err) { toast.error("Failed to update hours"); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (pwdForm.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setPwdLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success("Password changed successfully!");
      setShowChangePwd(false);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { toast.error(err.response?.data?.message || "Failed to change password"); }
    finally { setPwdLoading(false); }
  };

  const handleCategoryRename = async (catId) => {
    if (!renameCatName.trim()) { setRenamingCatId(null); return; }
    try {
      await api.put(`/cafe-owner/cafes/${selectedCafe.id}/menu/categories/${catId}`, { name: renameCatName.trim() });
      toast.success("Category renamed!");
      setRenamingCatId(null); setRenameCatName("");
      await loadCafeData(selectedCafe.id);
    } catch (err) { toast.error("Rename failed: " + (err.response?.data?.error || err.message)); }
  };

  if (loading && cafes.length === 0) return <div className="dashboard-page"><div className="brew-spinner" /></div>;

  const getMenuItemImage = (item) => {
    if (item.imageUrl) return item.imageUrl;
    const n = (item.name || "").toLowerCase();
    if (n.includes("cappuccino") || n.includes("latte") || n.includes("coffee") || n.includes("espresso") || n.includes("mocha") || n.includes("americano"))
      return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop";
    if (n.includes("tea") || n.includes("chai")) return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop";
    if (n.includes("waffle") || n.includes("pancake")) return "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=200&h=200&fit=crop";
    if (n.includes("sandwich") || n.includes("burger") || n.includes("wrap")) return "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=200&h=200&fit=crop";
    if (n.includes("cake") || n.includes("muffin") || n.includes("brownie") || n.includes("pastry")) return "https://images.unsplash.com/photo-1558303152-05fd9da2ee53?w=200&h=200&fit=crop";
    if (n.includes("juice") || n.includes("smoothie") || n.includes("shake")) return "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop";
    return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop";
  };

  if (!selectedCafe && !loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="empty-state__icon">--</div>
          <div className="empty-state__text">No café registered yet</div>
          <button className="brew-btn brew-btn--primary" onClick={() => navigate("/cafe-setup")}>Set Up Your Café</button>
        </div>
      </div>
    );
  }

  // Exclude PENDING_BOOKING orders — they only appear after booking is confirmed
  const activeOrders = orders.filter(o => o.status !== "PENDING_BOOKING");
  const pendingOrders = activeOrders.filter((o) => o.status === "PLACED");
  const chefs = staff.filter(s => s.role === "CHEF");
  const waiters = staff.filter(s => s.role === "WAITER");

  const filteredOrders = orderStatusFilter === "ALL" ? activeOrders : activeOrders.filter(o => o.status === orderStatusFilter);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f0ebe4", fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className="sidebar-premium" style={{ width: "280px", flexShrink: 0, color: "#fff", display: "flex", flexDirection: "column", padding: "20px 0", boxShadow: "4px 0 15px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "0 25px 25px", borderBottom: "1px solid rgba(166,124,82,0.18)", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
              {user?.firstName?.charAt(0) || "O"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f5e9dc", wordWrap: "break-word" }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: "0.72rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginTop: "4px", color: "#a67c52" }}>Cafe Manager</div>
            </div>
          </div>
          <div style={{ marginTop: "20px", padding: "10px 15px", background: "rgba(166,124,82,0.12)", borderRadius: "10px", border: "1px solid rgba(166,124,82,0.18)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", color: "#f5e9dc" }}>
              <FaCoffee color="#a67c52" /> {selectedCafe?.name || "My Café"}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }} className="hide-scrollbar">
          {SIDEBAR_ITEMS.map((item) => (
            <div key={item.key} onClick={() => setActiveTab(item.key)}
              className={`nav-item-premium ${activeTab === item.key ? "active" : ""}`}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "15px", borderRadius: "10px", fontSize: "0.88rem", fontWeight: 500, color: activeTab === item.key ? "#fff" : "rgba(245,233,220,0.7)" }}>
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.key === "orders" && pendingOrders.length > 0 && (
                <span style={{ marginLeft: "auto", background: "var(--danger)", color: "#fff", borderRadius: "12px", padding: "2px 8px", fontSize: "0.7rem", fontWeight: 800 }}>{pendingOrders.length}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "20px" }}>
          <button onClick={handleLogout} className="brew-btn" style={{ width: "100%", padding: "12px", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: "10px", color: "#ff9999", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 600 }}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto", height: "100vh" }} className="hide-scrollbar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
          <div>
            <h2 className="section-title-premium" style={{ fontSize: "1.8rem", margin: 0, fontWeight: 800, color: "#2e241f" }}>
              {SIDEBAR_ITEMS.find(i => i.key === activeTab)?.label || activeTab}
            </h2>
            <p style={{ color: "#8b6f63", marginTop: "5px", fontSize: "0.9rem", fontWeight: 500 }}>Manage your cafe operations</p>
          </div>
          {["menu", "tables", "chefs", "waiters", "bookings"].includes(activeTab) && (
            <div style={{ display: "flex", gap: "12px" }}>
              {activeTab === "menu" && (
                <button className="brew-btn" style={{ background: "#fff", color: "var(--brown)", border: "2px solid var(--brown)", padding: "10px 20px", fontSize: "0.8rem" }} onClick={() => handleAddClick("category")}>
                  <FaPlusCircle style={{ marginRight: "8px" }} /> Category
                </button>
              )}
              <button className="brew-btn brew-btn--primary" style={{ padding: "10px 25px", color: "#fff", fontSize: "0.8rem" }}
                onClick={() => handleAddClick(activeTab === "chefs" ? "chef" : activeTab === "waiters" ? "waiter" : activeTab === "menu" ? "menu" : activeTab === "tables" ? "table" : "booking")}>
                <FaPlus style={{ marginRight: "8px" }} /> {activeTab === "menu" ? "Item" : activeTab.slice(0, -1)}
              </button>
            </div>
          )}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && dashboard && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "25px" }}>
              {[
                { label: "Total Revenue", value: `₹${parseFloat(dashboard.totalRevenue || 0).toFixed(2)}`, color: "#27ae60" },
                { label: "Today's Revenue", value: `₹${parseFloat(dashboard.todayRevenue || 0).toFixed(2)}`, color: "#e67e22" },
                { label: "Today's Orders", value: dashboard.todayOrders ?? 0, color: "#3b82f6" },
                { label: "Available Tables", value: `${dashboard.availableTables ?? 0} / ${dashboard.totalTables ?? 0}`, color: "#2980b9" },
                { label: "Pending Orders", value: dashboard.pendingOrders ?? 0, color: "#f59e0b" },
                { label: "Orders In Progress", value: (dashboard.confirmedOrders ?? 0) + (dashboard.preparingOrders ?? 0), color: "#8e44ad" },
                { label: "Ready to Deliver", value: dashboard.readyOrders ?? 0, color: "#10b981" },
                { label: "Total Staff", value: (dashboard.totalChefs ?? 0) + (dashboard.totalWaiters ?? 0), color: "#6b7280" },
              ].map((card, i) => (
                <div key={i} className="card-premium" style={{ padding: "24px", borderLeft: `4px solid ${card.color}` }}>
                  <div style={{ fontSize: "0.68rem", color: "#8b6f63", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>{card.label}</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2e241f" }}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* Quick order summary */}
            {pendingOrders.length > 0 && (
              <div className="card-premium" style={{ padding: "20px" }}>
                <div className="category-header-premium" style={{ marginBottom: "15px" }}>{pendingOrders.length} Pending Order{pendingOrders.length > 1 ? "s" : ""} Need Confirmation</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {pendingOrders.slice(0, 3).map(order => (
                    <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#fffbf0", borderRadius: "10px", border: "1px solid #fde68a" }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>#{order.orderRef}</span>
                        <span style={{ marginLeft: "12px", fontSize: "0.8rem", color: "#8b6f63" }}>{order.orderType} • ₹{parseFloat(order.grandTotal || 0).toFixed(2)}</span>
                      </div>
                      <button className="brew-btn brew-btn--primary" style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                        onClick={async () => { try { await api.put(`/cafe-owner/cafes/${selectedCafe.id}/orders/${order.id}/confirm`); toast.success("Confirmed!"); await refreshLive(selectedCafe.id); } catch { toast.error("Failed"); } }}>
                        Confirm
                      </button>
                    </div>
                  ))}
                  {pendingOrders.length > 3 && <div style={{ textAlign: "center", color: "#8b6f63", fontSize: "0.82rem", cursor: "pointer" }} onClick={() => setActiveTab("orders")}>View all {pendingOrders.length} pending orders →</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {/* Status filter pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
              {["ALL", "PLACED", "CONFIRMED", "SENT_TO_KITCHEN", "PREPARING", "READY", "DELIVERED"].map(s => (
                <button key={s} onClick={() => setOrderStatusFilter(s)}
                  className={`admin-filter-pill ${orderStatusFilter === s ? "active" : ""}`}
                  style={{ fontSize: "0.75rem" }}>
                  {s === "ALL" ? "All" : s.replace(/_/g, " ")}
                  {s !== "ALL" && orders.filter(o => o.status === s).length > 0 && (
                    <span style={{ marginLeft: "5px", background: STATUS_COLORS[s] + "33", color: STATUS_COLORS[s], borderRadius: "10px", padding: "1px 6px", fontWeight: 800, fontSize: "0.68rem" }}>
                      {orders.filter(o => o.status === s).length}
                    </span>
                  )}
                </button>
              ))}
              <button onClick={() => refreshLive(selectedCafe.id)} style={{ marginLeft: "auto", background: "none", border: "1px solid #d4c0a8", borderRadius: "8px", padding: "5px 12px", fontSize: "0.75rem", cursor: "pointer", color: "#6f4e37" }}>↻ Refresh</button>
            </div>

            {filteredOrders.length > 0 ? filteredOrders.map(order => (
              <div key={order.id} className="card-premium" style={{ padding: "20px", borderLeft: `5px solid ${STATUS_COLORS[order.status] || "#d4c0a8"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "#111827" }}>#{order.orderRef}</span>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 700, background: (STATUS_COLORS[order.status] || "#999") + "22", color: STATUS_COLORS[order.status] || "#999", textTransform: "uppercase" }}>{order.status?.replace(/_/g, " ")}</span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "0.8rem", color: "#6b7280", flexWrap: "wrap" }}>
                      <span>{order.orderType}</span>
                      {order.table && <span>• Table {order.table.tableNumber}</span>}
                      <span>• {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>• ₹{parseFloat(order.grandTotal || 0).toFixed(2)}</span>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div style={{ marginTop: "8px", fontSize: "0.78rem", color: "#8b6f63" }}>
                        {order.items.map((it, i) => <span key={i}>{it.menuItem?.name || it.name} ×{it.quantity}{i < order.items.length - 1 ? ", " : ""}</span>)}
                      </div>
                    )}
                    <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "#9ca3af" }}>
                      {order.assignedChef && <span>Chef: {order.assignedChef.firstName} {order.assignedChef.lastName}</span>}
                      {order.assignedWaiter && <span style={{ marginLeft: "10px" }}>Waiter: {order.assignedWaiter.firstName} {order.assignedWaiter.lastName}</span>}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                    {order.status === "PLACED" && (
                      <button className="brew-btn brew-btn--primary" style={{ padding: "7px 14px", fontSize: "0.75rem", whiteSpace: "nowrap" }}
                        onClick={async () => { try { await api.put(`/cafe-owner/cafes/${selectedCafe.id}/orders/${order.id}/confirm`); toast.success("Order confirmed!"); refreshLive(selectedCafe.id); } catch { toast.error("Failed"); } }}>
                        ✓ Confirm
                      </button>
                    )}
                    {["PLACED", "CONFIRMED"].includes(order.status) && (
                      <button className="brew-btn" style={{ padding: "7px 14px", fontSize: "0.75rem", background: "#f0ebe4", border: "1px solid #d4c0a8", color: "#6f4e37", whiteSpace: "nowrap" }}
                        onClick={() => { setAssignOrderId(order.id); setAssignChefId(order.assignedChef?.id?.toString() || ""); setAssignWaiterId(order.assignedWaiter?.id?.toString() || ""); }}>
                        Assign Staff
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline assign staff panel */}
                {assignOrderId === order.id && (
                  <div style={{ marginTop: "15px", padding: "15px", background: "#faf8f5", borderRadius: "10px", border: "1px solid #ece5dc" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#6f4e37", marginBottom: "12px" }}>Assign Staff to Order #{order.orderRef}</div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                      <div>
                        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8b6f63", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Chef</label>
                        <select value={assignChefId} onChange={e => setAssignChefId(e.target.value)}
                          style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #d4c0a8", fontSize: "0.82rem", background: "#fff", minWidth: "160px" }}>
                          <option value="">No chef assigned</option>
                          {chefs.map(s => <option key={s.staff.id} value={s.staff.id}>{s.staff.firstName} {s.staff.lastName}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8b6f63", display: "block", marginBottom: "4px", textTransform: "uppercase" }}>Waiter</label>
                        <select value={assignWaiterId} onChange={e => setAssignWaiterId(e.target.value)}
                          style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #d4c0a8", fontSize: "0.82rem", background: "#fff", minWidth: "160px" }}>
                          <option value="">No waiter assigned</option>
                          {waiters.map(s => <option key={s.staff.id} value={s.staff.id}>{s.staff.firstName} {s.staff.lastName}</option>)}
                        </select>
                      </div>
                      <button className="brew-btn brew-btn--primary" style={{ padding: "8px 16px", fontSize: "0.78rem", marginTop: "16px" }} onClick={() => handleAssignStaff(order.id)}>Save Assignment</button>
                      <button className="brew-btn" style={{ padding: "8px 12px", fontSize: "0.78rem", marginTop: "16px", background: "#f5f1ec", border: "1px solid #d4c0a8" }} onClick={() => setAssignOrderId(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px", color: "#8b6f63", border: "1px dashed #d4c0a8" }}>
                No orders for the selected filter.
              </div>
            )}
          </div>
        )}

        {/* ── MENU ── */}
        {activeTab === "menu" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "8px" }}>
              <button onClick={() => setMenuFilter("ALL")} className={`admin-filter-pill ${menuFilter === "ALL" ? "active" : ""}`}>All Items</button>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {renamingCatId === cat.id ? (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input autoFocus value={renameCatName} onChange={e => setRenameCatName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleCategoryRename(cat.id); if (e.key === "Escape") setRenamingCatId(null); }}
                        style={{ padding: "5px 10px", borderRadius: "8px", border: "1.5px solid #a67c52", fontSize: "0.82rem", outline: "none", width: "130px" }} />
                      <button onClick={() => handleCategoryRename(cat.id)} style={{ background: "#27ae60", color: "#fff", border: "none", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", fontSize: "0.78rem" }}>✓</button>
                      <button onClick={() => setRenamingCatId(null)} style={{ background: "#f5f1ec", color: "#6f4e37", border: "1px solid #d4c0a8", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", fontSize: "0.78rem" }}>✕</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setMenuFilter(cat.id)} className={`admin-filter-pill ${menuFilter === cat.id ? "active" : ""}`}>{cat.name}</button>
                      <button title="Rename" onClick={() => { setRenamingCatId(cat.id); setRenameCatName(cat.name); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", opacity: 0.55, padding: "2px 4px" }}>Edit</button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {categories.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
                {categories.filter(cat => menuFilter === "ALL" || cat.id === menuFilter).map(category => {
                  const itemsInCat = menuItems.filter(item => item.category?.id === category.id);
                  if (menuFilter === "ALL" && itemsInCat.length === 0) return null;
                  return (
                    <div key={category.id}>
                      <div className="category-header-premium">{category.name} <span style={{ float: "right", fontSize: "0.75rem", opacity: 0.6 }}>{itemsInCat.length} Items</span></div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                        {itemsInCat.map(item => (
                          <div key={item.id} className="card-premium" style={{ display: "flex", height: "130px", overflow: "hidden", opacity: item.isAvailable ? 1 : 0.65 }}>
                            <div style={{ width: "130px", flexShrink: 0, position: "relative", overflow: "hidden", background: "#f3f0eb" }}>
                              <img src={getMenuItemImage(item)} alt={item.name} onError={e => { e.target.src = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop"; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              <span style={{ position: "absolute", top: 6, left: 6, background: item.type === "VEG" ? "#27ae60" : item.type === "EGG" ? "#f59e0b" : "#c0392b", borderRadius: "50%", width: 10, height: 10, display: "block", border: "1.5px solid #fff" }} />
                            </div>
                            <div style={{ padding: "12px 15px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                  <div style={{ fontWeight: 800, color: "#111827", fontSize: "0.95rem", lineHeight: 1.2 }}>{item.name}</div>
                                </div>
                                {item.description && <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 3, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.description}</div>}
                                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#6f4e37", marginTop: "5px" }}>₹{item.price}</div>
                              </div>
                              <button onClick={() => toggleMenuAvailability(item)}
                                style={{ padding: "4px 10px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700, background: item.isAvailable ? "#dcfce7" : "#fee2e2", color: item.isAvailable ? "#16a34a" : "#dc2626", alignSelf: "flex-start" }}>
                                {item.isAvailable ? "● Available" : "○ Unavailable"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 40px", background: "#fff", borderRadius: "16px", border: "1px dashed #d1d5db" }}>
                <h3 style={{ color: "#374151" }}>Your Menu is Empty</h3>
                <p style={{ color: "#6b7280", marginBottom: "25px" }}>Start by creating your first category.</p>
                <button className="brew-btn brew-btn--primary" style={{ padding: "10px 25px" }} onClick={() => handleAddClick("category")}>Create Category</button>
              </div>
            )}
          </div>
        )}

        {/* ── TABLES ── */}
        {activeTab === "tables" && (() => {
          // Find bookings for each table
          const getTableBookings = (tableId) => {
            return bookings.filter(b => b.table?.id === tableId && ["PENDING", "CONFIRMED"].includes(b.status));
          };
          return (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <div style={{ display: "flex", gap: "20px", marginBottom: "5px", flexWrap: "wrap" }}>
              <div className="admin-filter-group">
                <label className="admin-filter-label">Capacity</label>
                <select value={tableCapacityFilter} onChange={e => setTableCapacityFilter(e.target.value)} className="admin-filter-select">
                  <option value="ALL">All</option>
                  <option value="2">2 Members</option>
                  <option value="4">4 Members</option>
                  <option value="6">6 Members</option>
                  <option value="8">8+</option>
                </select>
              </div>
              <div className="admin-filter-group">
                <label className="admin-filter-label">Table Type</label>
                <select value={tableTypeFilter} onChange={e => setTableTableTypeFilter(e.target.value)} className="admin-filter-select">
                  <option value="ALL">All Types</option>
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="EXCLUSIVE">Exclusive</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
              {tables
                .filter(t => tableCapacityFilter === "ALL" || (tableCapacityFilter === "8" ? t.capacity >= 8 : t.capacity === parseInt(tableCapacityFilter)))
                .filter(t => tableTypeFilter === "ALL" || t.tableType === tableTypeFilter)
                .map(table => {
                  const tableBookings = getTableBookings(table.id);
                  return (
                  <div key={table.id} className="card-premium" style={{ padding: 0, textAlign: "center", overflow: "hidden" }}>
                    {/* Table Image */}
                    <div style={{ height: "130px", overflow: "hidden", position: "relative", background: "#f5ede6" }}>
                      <img
                        src={table.imageUrl || `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop&q=80&t=${table.id}`}
                        alt={`Table ${table.tableNumber}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'; }}
                      />
                      <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(0,0,0,0.55)",
                        color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: "5px",
                        textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {table.tableType}
                      </div>
                      <div style={{ position: "absolute", top: "8px", right: "8px", background: table.status === "AVAILABLE" ? "#16a34a" : "#dc2626",
                        color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: "5px" }}>
                        {table.status === "AVAILABLE" ? "● Free" : "○ Busy"}
                      </div>
                    </div>
                    {/* Table Info */}
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#111827" }}>Table {table.tableNumber}</div>
                      <div style={{ fontSize: "0.78rem", color: "#6b7280", margin: "4px 0 8px" }}>{table.capacity} Guests • {table.tableType}</div>
                      {/* Upcoming bookings for this table */}
                      {tableBookings.length > 0 && (
                        <div style={{ marginBottom: "10px", textAlign: "left" }}>
                          {tableBookings.slice(0, 2).map(b => (
                            <div key={b.id} style={{ fontSize: "0.68rem", color: "#6f4e37", background: "#faf5ef", borderRadius: "6px", padding: "4px 8px", marginBottom: "4px", border: "1px solid #ece5dc" }}>
                              {b.bookingDate} {b.startTime}{b.endTime ? `–${b.endTime}` : ''} • {b.numberOfGuests}g
                              <span style={{ marginLeft: "4px", fontWeight: 700, color: b.status === "CONFIRMED" ? "#27ae60" : "#e67e22" }}>{b.status}</span>
                            </div>
                          ))}
                          {tableBookings.length > 2 && <div style={{ fontSize: "0.65rem", color: "#8b6f63", textAlign: "center" }}>+{tableBookings.length - 2} more</div>}
                        </div>
                      )}
                      <button onClick={() => toggleTableStatus(table)}
                        style={{ padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700,
                          background: table.status === "AVAILABLE" ? "#dcfce7" : "#fee2e2",
                          color: table.status === "AVAILABLE" ? "#16a34a" : "#dc2626", width: "100%" }}>
                        {table.status === "AVAILABLE" ? "Mark Occupied" : "Mark Available"}
                      </button>
                    </div>
                  </div>
                  );
                })}
            </div>
          </div>
          );
        })()}

        {/* ── STAFF (Chefs / Waiters) ── */}
        {["chefs", "waiters"].includes(activeTab) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" }}>
            {staff.filter(s => s.role === (activeTab === "chefs" ? "CHEF" : "WAITER")).map(s => (
              <div key={s.id} className="card-premium" style={{ padding: "25px", display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "14px", background: "linear-gradient(135deg, var(--brown), var(--accent))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 900 }}>
                  {s.staff.firstName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--dark)" }}>{s.staff.firstName} {s.staff.lastName}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{s.staff.email}</div>
                  <div style={{ fontSize: "0.72rem", background: "var(--light-cream)", color: "var(--brown)", padding: "2px 8px", borderRadius: "5px", marginTop: "6px", display: "inline-block", fontWeight: 700 }}>STAFF-{s.staff.id}</div>
                </div>
              </div>
            ))}
            {staff.filter(s => s.role === (activeTab === "chefs" ? "CHEF" : "WAITER")).length === 0 && (
              <div style={{ gridColumn: "1/-1", padding: "60px", textAlign: "center", background: "#fff", borderRadius: "16px", color: "#8b6f63", border: "1px dashed #d4c0a8" }}>
                No {activeTab} added yet.
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {activeTab === "bookings" && (() => {
          const filteredBookings = bookings
            .filter(b => bookingStatusFilter === "ALL" || b.status === bookingStatusFilter)
            .filter(b => !bookingDateFilter || b.bookingDate === bookingDateFilter);
          return (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <div className="admin-filter-group">
                <label className="admin-filter-label">Status</label>
                <select value={bookingStatusFilter} onChange={e => setBookingStatusFilter(e.target.value)} className="admin-filter-select">
                  <option value="ALL">All Bookings</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="admin-filter-group">
                <label className="admin-filter-label">Date</label>
                <input type="date" value={bookingDateFilter} onChange={e => setBookingDateFilter(e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #d4c0a8", fontSize: "0.82rem", color: "#2e241f" }} />
              </div>
              {bookingDateFilter && (
                <button onClick={() => setBookingDateFilter("")} style={{ background: "none", border: "1px solid #d4c0a8", borderRadius: "8px", padding: "6px 12px", fontSize: "0.75rem", cursor: "pointer", color: "#c0392b" }}>Clear Date</button>
              )}
              <button onClick={() => refreshLive(selectedCafe.id)} style={{ marginLeft: "auto", background: "none", border: "1px solid #d4c0a8", borderRadius: "8px", padding: "8px 14px", fontSize: "0.78rem", cursor: "pointer", color: "#6f4e37" }}>↻ Refresh</button>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {filteredBookings.map(b => (
                <div key={b.id} className="card-premium" style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div style={{ padding: "10px", background: "#faf8f5", borderRadius: "10px", textAlign: "center", minWidth: "72px", border: "1px solid #ece5dc" }}>
                      <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#8b6f63", textTransform: "uppercase" }}>{new Date(b.bookingDate + 'T00:00').toLocaleDateString("en-US", { month: "short" })}</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#2e241f" }}>{new Date(b.bookingDate + 'T00:00').getDate()}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#2e241f" }}>
                        {b.customer?.firstName ? `${b.customer.firstName} ${b.customer.lastName}` : b.customerName || "Walk-in Guest"}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#8b6f63", marginTop: "3px" }}>
                        {b.startTime}{b.endTime ? ` – ${b.endTime}` : ''}{b.slotDuration ? ` (${b.slotDuration === 120 ? '2 hrs' : '1 hr'})` : ''} • {b.numberOfGuests} guests • #{b.bookingRef}
                      </div>
                      {b.table && <div style={{ fontSize: "0.72rem", color: "#6f4e37", marginTop: "2px" }}>Table {b.table.tableNumber} ({b.table.tableType})</div>}
                      {b.specialRequests && <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "2px" }}>{b.specialRequests}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: b.status === "CONFIRMED" ? "#eaf7ed" : b.status === "PENDING" ? "#fef3e2" : b.status === "COMPLETED" ? "#e8f4fd" : "#fdf2f2", color: b.status === "CONFIRMED" ? "#27ae60" : b.status === "PENDING" ? "#e67e22" : b.status === "COMPLETED" ? "#2980b9" : "#c0392b", textTransform: "uppercase" }}>
                      {b.status}
                    </span>
                    {b.status === "PENDING" && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => updateBookingStatus(b.id, "CONFIRMED")} className="brew-btn" style={{ padding: "5px 10px", fontSize: "0.72rem", background: "#27ae60", color: "#fff", border: "none" }}>Confirm</button>
                        <button onClick={() => updateBookingStatus(b.id, "CANCELLED")} className="brew-btn" style={{ padding: "5px 10px", fontSize: "0.72rem", background: "#c0392b", color: "#fff", border: "none" }}>Reject</button>
                      </div>
                    )}
                    {b.status === "CONFIRMED" && (
                      <button onClick={() => updateBookingStatus(b.id, "COMPLETED")} className="brew-btn" style={{ padding: "5px 10px", fontSize: "0.72rem", background: "#2980b9", color: "#fff", border: "none" }}>Complete</button>
                    )}
                  </div>
                </div>
              ))}
              {filteredBookings.length === 0 && (
                <div style={{ padding: "60px", textAlign: "center", background: "#fff", borderRadius: "16px", color: "#8b6f63", border: "1px dashed #d4c0a8" }}>No bookings found{bookingDateFilter ? ` for ${bookingDateFilter}` : ''}.</div>
              )}
            </div>
          </div>
          );
        })()}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Personal Details */}
            <div className="card-premium" style={{ padding: "30px" }}>
              <div className="category-header-premium" style={{ marginBottom: "20px" }}>
                <FaUserCircle style={{ marginRight: "10px", verticalAlign: "middle" }} /> Personal Details
              </div>
              <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
                <div style={{ width: "100px", height: "100px", borderRadius: "20px", background: "linear-gradient(135deg, #1e1610 0%, #a67c52 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: 800, flexShrink: 0 }}>
                  {user?.firstName?.charAt(0)}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div className="admin-filter-group"><label className="admin-filter-label">Full Name</label><div style={{ fontWeight: 600, color: "#2e241f" }}>{user?.firstName} {user?.lastName}</div></div>
                  <div className="admin-filter-group"><label className="admin-filter-label">Email</label><div style={{ fontWeight: 600, color: "#2e241f" }}>{user?.email}</div></div>
                  <div className="admin-filter-group"><label className="admin-filter-label">Phone</label><div style={{ fontWeight: 600, color: "#2e241f" }}>{user?.phoneNumber || "Not provided"}</div></div>
                  <div className="admin-filter-group"><label className="admin-filter-label">Role</label><div style={{ fontWeight: 600, color: "#a67c52" }}>{user?.role}</div></div>
                </div>
              </div>
              <div style={{ marginTop: "20px", borderTop: "1px solid #ece5dc", paddingTop: "18px" }}>
                <button onClick={() => setShowChangePwd(true)} className="brew-btn" style={{ padding: "8px 20px", fontSize: "0.82rem", background: "#f0ebe4", border: "1px solid #d4c0a8", color: "#6f4e37", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaLock /> Change Password
                </button>
              </div>
            </div>

            {/* Business Info */}
            <div className="card-premium" style={{ padding: "30px" }}>
              <div className="category-header-premium" style={{ marginBottom: "20px" }}>
                <FaCoffee style={{ marginRight: "10px", verticalAlign: "middle" }} /> Business Information
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                <div className="admin-filter-group"><label className="admin-filter-label">Café Name</label><div style={{ fontWeight: 600, color: "#2e241f" }}>{selectedCafe?.name}</div></div>
                <div className="admin-filter-group"><label className="admin-filter-label">GST Number</label><div style={{ fontWeight: 600, color: "#2e241f" }}>{selectedCafe?.gstNumber || "N/A"}</div></div>
                <div className="admin-filter-group"><label className="admin-filter-label">Status</label>
                  <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: selectedCafe?.isVerified ? "#eaf7ed" : "#fef3e2", color: selectedCafe?.isVerified ? "#27ae60" : "#e67e22" }}>
                    {selectedCafe?.isVerified ? "VERIFIED" : "PENDING VERIFICATION"}
                  </div>
                </div>
                <div className="admin-filter-group" style={{ gridColumn: "span 3" }}><label className="admin-filter-label">Address</label><div style={{ fontWeight: 600, color: "#2e241f" }}>{selectedCafe?.address}, {selectedCafe?.city}, {selectedCafe?.state} - {selectedCafe?.zipCode}</div></div>
                <div className="admin-filter-group"><label className="admin-filter-label">Contact</label><div style={{ fontWeight: 600, color: "#2e241f" }}>{selectedCafe?.contactNumber}</div></div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Operating Hours</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: 600, color: "#2e241f" }}>{selectedCafe?.openingTime} – {selectedCafe?.closingTime}</span>
                    <button onClick={() => { setEditHours(true); setOpeningTime(selectedCafe?.openingTime || "09:00"); setClosingTime(selectedCafe?.closingTime || "22:00"); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#a67c52", fontSize: "0.8rem", padding: "2px 6px" }}>
                      <FaEdit />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <AddItemModal type={modalType} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} menuItems={menuItems} categories={categories} />
      </main>

      {/* ── Edit Hours Modal ── */}
      {editHours && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000 }} onClick={() => setEditHours(false)}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "30px", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 700, color: "#2e241f" }}>Edit Operating Hours</h3>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8b6f63", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Opening Time</label>
              <input type="time" value={openingTime} onChange={e => setOpeningTime(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d4c0a8", fontSize: "0.9rem" }} />
            </div>
            <div style={{ marginBottom: "25px" }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8b6f63", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Closing Time</label>
              <input type="time" value={closingTime} onChange={e => setClosingTime(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d4c0a8", fontSize: "0.9rem" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setEditHours(false)} className="brew-btn" style={{ padding: "8px 18px", background: "#f5f1ec", border: "1px solid #d4c0a8", fontSize: "0.82rem" }}>Cancel</button>
              <button onClick={handleSaveHours} className="brew-btn brew-btn--primary" style={{ padding: "8px 18px", color: "#fff", fontSize: "0.82rem" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showChangePwd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000 }} onClick={() => setShowChangePwd(false)}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "30px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 700, color: "#2e241f" }}>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              {[
                { label: "Current Password", key: "currentPassword" },
                { label: "New Password", key: "newPassword" },
                { label: "Confirm New Password", key: "confirmPassword" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8b6f63", display: "block", marginBottom: "5px", textTransform: "uppercase" }}>{f.label}</label>
                  <input type="password" value={pwdForm[f.key]} onChange={e => setPwdForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d4c0a8", fontSize: "0.88rem", boxSizing: "border-box" }} required />
                </div>
              ))}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowChangePwd(false)} className="brew-btn" style={{ padding: "8px 18px", background: "#f5f1ec", border: "1px solid #d4c0a8", fontSize: "0.82rem" }}>Cancel</button>
                <button type="submit" className="brew-btn brew-btn--primary" style={{ padding: "8px 18px", color: "#fff", fontSize: "0.82rem" }} disabled={pwdLoading}>{pwdLoading ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
