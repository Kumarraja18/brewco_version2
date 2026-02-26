import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosClient";
import toast from "react-hot-toast";
import {
  FaCoffee, FaMoneyBillWave, FaShoppingCart, FaCheckCircle,
  FaClipboardList, FaChair, FaCalendarAlt, FaUtensils, FaUserFriends
} from "react-icons/fa";
import "../styles/dashboard.css";
import AddItemModal from "../model/addItemModel"
// 🧪 Mock Data
const MOCK_CAFE = { id: 1, name: "Brew & Co Demo Cafe", isVerified: false };
const MOCK_DASHBOARD = { totalRevenue: 45230, todayRevenue: 5600, todayOrders: 12, deliveredOrders: 85, pendingOrders: 3, confirmedOrders: 4, preparingOrders: 2, readyOrders: 1, totalTables: 10, availableTables: 6, totalChefs: 2, totalWaiters: 3, totalMenuItems: 15 };
const MOCK_ORDERS = [
  { id: 1, orderRef: "ORD001", status: "PLACED", orderType: "DINE_IN", grandTotal: 450 },
  { id: 2, orderRef: "ORD002", status: "CONFIRMED", orderType: "TAKEAWAY", grandTotal: 320 },
];
const MOCK_STAFF = [
  { id: 1, role: "CHEF", staff: { id: 11, firstName: "Ravi", lastName: "Kumar", email: "ravi@demo.com" } },
  { id: 2, role: "WAITER", staff: { id: 12, firstName: "Amit", lastName: "Shah", email: "amit@demo.com" } },
];
const MOCK_TABLES = [
  { id: 1, tableNumber: 1, capacity: 4, tableType: "STANDARD", status: "AVAILABLE" },
  { id: 2, tableNumber: 2, capacity: 2, tableType: "PREMIUM", status: "OCCUPIED" },
];
const MOCK_MENU = [
  { id: 1, name: "Cappuccino", price: 120, type: "VEG", isAvailable: true },
  { id: 2, name: "Veg Sandwich", price: 180, type: "VEG", isAvailable: true },
];
const MOCK_BOOKINGS = [
  { id: 1, bookingRef: "BK001", bookingDate: "2026-02-25", startTime: "18:00", numberOfGuests: 4, status: "CONFIRMED" },
];
const SIDEBAR_ITEMS = [
  { key: "overview", icon: <FaCoffee />, label: "Dashboard" },
  { key: "orders", icon: <FaShoppingCart />, label: "Orders" },
  { key: "menu", icon: <FaClipboardList />, label: "Menu" },
  { key: "tables", icon: <FaChair />, label: "Tables" },
  { key: "chefs", icon: <FaUtensils />, label: "Chefs" },
  { key: "waiters", icon: <FaUserFriends />, label: "Waiters" },
  { key: "bookings", icon: <FaCalendarAlt />, label: "Bookings" },
];

export default function CafeOwnerDashboard() {
  const { user } = useContext(AuthContext);
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
      } else throw new Error("No cafes");
    } catch (err) {
      console.warn("⚠ Using Mock Data (Dev Mode)");
      setCafes([MOCK_CAFE]);
      setSelectedCafe(MOCK_CAFE);
      setDashboard(MOCK_DASHBOARD);
      setOrders(MOCK_ORDERS);
      setStaff(MOCK_STAFF);
      setTables(MOCK_TABLES);
      setMenuItems(MOCK_MENU);
      setCategories([{ id: 1, name: "Beverages" }]);
      setBookings(MOCK_BOOKINGS);
    }
    setLoading(false);
  };

  const loadCafeData = async (cafeId) => {
    try {
      const [dashRes, ordRes, tabRes, catRes, itemRes, staffRes, bookRes] =
        await Promise.all([
          api.get(`/cafe-owner/cafes/${cafeId}/dashboard`),
          api.get(`/cafe-owner/cafes/${cafeId}/orders`),
          api.get(`/cafe-owner/cafes/${cafeId}/tables`),
          api.get(`/cafe-owner/cafes/${cafeId}/menu/categories`),
          api.get(`/cafe-owner/cafes/${cafeId}/menu/items`),
          api.get(`/cafe-owner/cafes/${cafeId}/staff`),
          api.get(`/cafe-owner/cafes/${cafeId}/bookings`),
        ]);

      setDashboard(dashRes.data);
      setOrders(ordRes.data || []);
      setTables(tabRes.data || []);
      setCategories(catRes.data || []);
      setMenuItems(itemRes.data || []);
      setStaff(staffRes.data || []);
      setBookings(bookRes.data || []);
    } catch (err) {
      console.warn("⚠ Using Mock Data for Cafe Load");
      setDashboard(MOCK_DASHBOARD);
      setOrders(MOCK_ORDERS);
      setStaff(MOCK_STAFF);
      setTables(MOCK_TABLES);
      setMenuItems(MOCK_MENU);
      setCategories([{ id: 1, name: "Beverages" }]);
      setBookings(MOCK_BOOKINGS);
    }
  };

  // Modal handlers
  const handleAddClick = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSave = (data) => {
    if (modalType === "chef" || modalType === "waiter") {
      setStaff([...staff, { id: Date.now(), role: modalType.toUpperCase(), staff: data }]);
    } else if (modalType === "menu") {
      setMenuItems([...menuItems, { id: Date.now(), ...data }]);
    } else if (modalType === "combo") {
      toast.success("Combo added (mock)!");
    }
    setIsModalOpen(false);
  };

  if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>;

  if (!selectedCafe) {
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
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif", background: "#f4f6f9" }}>
      {/* Sidebar */}
      <aside style={{ width: "260px", background: "linear-gradient(135deg, var(--brown) 0%, var(--accent) 100%)", color: "#fff", display: "flex", flexDirection: "column", padding: "20px 0", boxShadow: "2px 0 8px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "1.4rem", fontWeight: 700 }}><FaCoffee style={{ marginRight: 8 }} /> {selectedCafe?.name}</div>
          <div style={{ fontSize: "0.75rem", marginTop: "5px", opacity: 0.7 }}>
            {selectedCafe?.isVerified ? "Verified" : "Pending Verification"}
          </div>
        </div>
        <div style={{ flex: 1, marginTop: "20px" }}>
          {SIDEBAR_ITEMS.map((item) => (
            <div
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                background: activeTab === item.key ? "rgba(255, 255, 255, 0.15)" : "transparent",
                borderRadius: "8px",
                boxShadow: activeTab === item.key ? "0 2px 6px rgba(0,0,0,0.2)" : "none",
                transition: "0.2s",
                fontSize: "0.95rem",
                color: "#fff",
                padding: "12px 20px",
              }}
            >
              {item.icon} <span>{item.label}</span>
              {item.key === "orders" && pendingOrders.length > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#ef4444",
                    borderRadius: "20px",
                    padding: "2px 8px",
                    fontSize: "0.75rem",
                  }}
                >
                  {pendingOrders.length}
                </span>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: "15px 20px", borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "0.8rem", opacity: 0.7 }}>
          Logged in as <br />
          <strong>{user?.firstName || "Dev"} {user?.lastName || "User"}</strong>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "20px", color: "#111827" }}>
          {activeTab === "overview" ? "My Café" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>

        {/* Add Button */}
        {/* Add Button */}
        {["menu", "tables", "chefs", "waiters", "bookings"].includes(activeTab) && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
            <button
              className="brew-btn brew-btn--primary"
              onClick={() =>
                handleAddClick(
                  activeTab === "chefs"
                    ? "chef"
                    : activeTab === "waiters"
                      ? "waiter"
                      : activeTab === "menu"
                        ? "menu"
                        : activeTab === "tables"
                          ? "table"
                          : "booking"
                )
              }
            >
              + Add{" "}
              {activeTab === "chefs"
                ? "Chef"
                : activeTab === "waiters"
                  ? "Waiter"
                  : activeTab === "menu"
                    ? "Menu Item"
                    : activeTab === "tables"
                      ? "Table"
                      : "Booking"}
            </button>
          </div>
        )}

        {/* Tabs Content */}
        {/* Overview */}
        {activeTab === "overview" && dashboard && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            {[
              { icon: <FaMoneyBillWave size={24} color="#f59e0b" />, label: "Total Revenue", value: `₹${dashboard.totalRevenue}` },
              { icon: <FaMoneyBillWave size={24} color="#10b981" />, label: "Today's Revenue", value: `₹${dashboard.todayRevenue}` },
              { icon: <FaShoppingCart size={24} color="#3b82f6" />, label: "Today's Orders", value: dashboard.todayOrders },
              { icon: <FaCheckCircle size={24} color="#16a34a" />, label: "Completed Orders", value: dashboard.deliveredOrders }
            ].map((card, i) => (
              <div key={i} style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "12px" }}>
                <div>{card.icon}</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#111827" }}>{card.value}</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div style={{ display: "grid", gap: "15px" }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: "#fff", padding: "18px", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>#{order.orderRef}</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{order.orderType}</div>
                </div>
                <div style={{ fontWeight: 700, color: order.status === "PLACED" ? "#f59e0b" : "#10b981" }}>{order.status}</div>
              </div>
            ))}
          </div>
        )}

        {/* Menu */}
        {activeTab === "menu" && (
          <div style={{ display: "grid", gap: "12px" }}>
            {menuItems.map(item => (
              <div key={item.id} style={{ background: "#fff", padding: "15px 20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>₹{item.price} | {item.type} | {item.isAvailable ? "Available" : "Unavailable"}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tables */}
        {activeTab === "tables" && (
          <div style={{ display: "grid", gap: "12px" }}>
            {tables.map(table => (
              <div key={table.id} style={{ background: "#fff", padding: "15px 20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Table {table.tableNumber}</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{table.capacity} Seats | {table.tableType} | {table.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chefs */}
        {activeTab === "chefs" && (
          <div style={{ display: "grid", gap: "12px" }}>
            {staff.filter(s => s.role === "CHEF").map(s => (
              <div key={s.id} style={{ background: "#fff", padding: "15px 20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.staff.firstName} {s.staff.lastName}</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{s.staff.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Waiters */}
        {activeTab === "waiters" && (
          <div style={{ display: "grid", gap: "12px" }}>
            {staff.filter(s => s.role === "WAITER").map(s => (
              <div key={s.id} style={{ background: "#fff", padding: "15px 20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.staff.firstName} {s.staff.lastName}</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{s.staff.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings */}
        {activeTab === "bookings" && (
          <div style={{ display: "grid", gap: "12px" }}>
            {bookings.map(b => (
              <div key={b.id} style={{ background: "#fff", padding: "15px 20px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Booking {b.bookingRef}</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{b.bookingDate} | {b.startTime} | Guests: {b.numberOfGuests} | {b.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AddItemModal
          type={modalType}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          menuItems={menuItems}
        />
      </main>
    </div>
  );
}
