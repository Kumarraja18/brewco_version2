import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

function AddItemModal({ type, isOpen, onClose, onSave, menuItems, categories = [] }) {
    // ... same state logic ...
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", phone: "",
        dob: "", gender: "MALE", street: "", city: "",
        state: "", pincode: "", name: "", type: "VEG",
        categoryId: "", price: "", isAvailable: true, 
        description: "", tableName: "", capacity: "2",
        tableType: "STANDARD", status: "AVAILABLE",
        displayOrder: "0", imageUrl: ""
    });

    // ... same effect logic ...
    useEffect(() => {
        if (isOpen) {
            const initialData = {
                firstName: "", lastName: "", email: "", phone: "",
                dob: "", gender: "MALE", street: "", city: "",
                state: "", pincode: "", name: "", type: "VEG",
                categoryId: categories[0]?.id?.toString() || "", 
                price: "", isAvailable: true, 
                description: "", tableName: "", capacity: "2",
                tableType: "STANDARD", status: "AVAILABLE",
                displayOrder: "0", imageUrl: ""
            };
            setFormData(initialData);
        }
    }, [type, isOpen, categories]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: inputType === "checkbox" ? checked : (value === undefined ? "" : value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (type === "menu" && !formData.categoryId) {
            toast.error("Please select a category first.");
            return;
        }
        
        onSave(formData);
        onClose();
    };

    const modalOverlayStyle = {
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(30, 22, 16, 0.6)", backdropFilter: "blur(4px)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 3000, padding: "20px", fontFamily: "'Inter', sans-serif"
    };

    const modalContentStyle = {
        background: "#fff",
        borderRadius: "16px",
        width: "90%",
        maxWidth: type === "menu" || type === "table" || type === "category" ? "480px" : "720px",
        maxHeight: "85vh",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
    };

    const headerStyle = {
        padding: "1.25rem 1.5rem",
        borderBottom: "1px solid #ece5dc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    };

    const bodyStyle = { 
        padding: "1.5rem",
        overflowY: "auto",
        flex: 1
    };

    const footerStyle = {
        padding: "1rem 1.5rem",
        borderTop: "1px solid #ece5dc",
        display: "flex",
        justifyContent: "flex-end",
        gap: "0.75rem",
        background: "#faf8f5"
    };

    const inputGroupStyle = { marginBottom: "1.25rem" };
    const labelStyle = { 
        display: "block", 
        fontSize: "0.68rem", 
        fontWeight: "700", 
        color: "#8b6f63", 
        marginBottom: "0.35rem",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    };
    const fieldStyle = {
        width: "100%", 
        padding: "0.65rem 0.85rem", 
        borderRadius: "8px", 
        border: "1px solid #d4c0a8",
        fontSize: "0.88rem", 
        outline: "none", 
        background: "#fff", 
        color: "#2e241f",
        fontFamily: "'Inter', sans-serif"
    };

    const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#2e241f" }}>
                        Add {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#8b6f63" }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <div style={bodyStyle} className="hide-scrollbar">
                        {/* Category Form */}
                        {type === "category" && (
                            <>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Category Name</label>
                                    <input name="name" value={formData.name || ""} onChange={handleChange} style={fieldStyle} required />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Display Order</label>
                                    <input type="number" name="displayOrder" value={formData.displayOrder || "0"} onChange={handleChange} style={fieldStyle} />
                                </div>
                            </>
                        )}

                        {/* Staff Form (Chef/Waiter) */}
                        {(type === "chef" || type === "waiter") && (
                            <>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>First Name</label>
                                        <input name="firstName" value={formData.firstName || ""} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Last Name</label>
                                        <input name="lastName" value={formData.lastName || ""} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                </div>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Email</label>
                                        <input type="email" name="email" value={formData.email || ""} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Phone</label>
                                        <input name="phone" value={formData.phone || ""} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                </div>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Date of Birth</label>
                                        <input type="date" name="dob" value={formData.dob || ""} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Gender</label>
                                        <select name="gender" value={formData.gender || "MALE"} onChange={handleChange} style={fieldStyle}>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Street Address</label>
                                    <input name="street" value={formData.street || ""} onChange={handleChange} style={fieldStyle} />
                                </div>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>City</label>
                                        <input name="city" value={formData.city || ""} onChange={handleChange} style={fieldStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Pincode</label>
                                        <input name="pincode" value={formData.pincode || ""} onChange={handleChange} style={fieldStyle} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Booking Form */}
                        {type === "booking" && (
                            <>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Customer First Name</label>
                                        <input name="firstName" value={formData.firstName || ""} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Customer Last Name</label>
                                        <input name="lastName" value={formData.lastName || ""} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                </div>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Email</label>
                                        <input type="email" name="email" value={formData.email || ""} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Phone</label>
                                        <input name="phone" value={formData.phone || ""} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                </div>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Booking Date</label>
                                        <input type="date" name="dob" value={formData.dob || ""} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Guests</label>
                                        <input type="number" name="capacity" value={formData.capacity || "2"} onChange={handleChange} style={fieldStyle} min="1" required />
                                    </div>
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Check-in Time (24h format)</label>
                                    <input type="number" name="displayOrder" value={formData.displayOrder || "12"} onChange={handleChange} style={fieldStyle} min="0" max="23" placeholder="e.g. 18 for 6 PM" required />
                                </div>
                            </>
                        )}

                        {/* Menu Item Form */}
                        {type === "menu" && (
                            <>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Item Name</label>
                                    <input name="name" value={formData.name || ""} onChange={handleChange} style={fieldStyle} required />
                                </div>
                                
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Category</label>
                                        <select name="categoryId" value={formData.categoryId || ""} onChange={handleChange} style={fieldStyle} required>
                                            <option value="" disabled>Select category</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Type</label>
                                        <select name="type" value={formData.type || "VEG"} onChange={handleChange} style={fieldStyle}>
                                            <option value="VEG">Veg</option>
                                            <option value="NON_VEG">Non-Veg</option>
                                            <option value="EGG">Contains Egg</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Price (INR)</label>
                                    <input type="number" name="price" value={formData.price || ""} onChange={handleChange} style={fieldStyle} required />
                                </div>

                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea name="description" value={formData.description || ""} onChange={handleChange} style={{...fieldStyle, height: "70px", resize: "none"}} />
                                </div>

                                <div style={{...inputGroupStyle, display: "flex", alignItems: "center", gap: "10px", marginTop: "10px"}}>
                                    <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} id="avail-check" style={{width: "16px", height: "16px"}} />
                                    <label htmlFor="avail-check" style={{...labelStyle, marginBottom: 0, cursor: "pointer", textTransform: 'none', fontSize: '0.85rem', color: '#4b5563', fontWeight: 500 }}>Available for order</label>
                                </div>
                            </>
                        )}

                        {/* Table Form */}
                        {type === "table" && (
                            <>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Table Number</label>
                                    <input type="number" name="tableName" value={formData.tableName || ""} onChange={handleChange} style={fieldStyle} required />
                                </div>

                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Capacity</label>
                                        <input type="number" name="capacity" value={formData.capacity || "2"} onChange={handleChange} style={fieldStyle} min="1" required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Table Type</label>
                                        <select name="tableType" value={formData.tableType || "STANDARD"} onChange={handleChange} style={fieldStyle}>
                                            <option value="STANDARD">Standard</option>
                                            <option value="PREMIUM">Premium</option>
                                            <option value="EXCLUSIVE">Exclusive</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{...inputGroupStyle, display: "flex", alignItems: "center", gap: "10px", marginTop: "10px"}}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.status === "AVAILABLE"} 
                                        onChange={(e) => setFormData({...formData, status: e.target.checked ? "AVAILABLE" : "OCCUPIED"})}
                                        id="table-avail"
                                        style={{width: "16px", height: "16px"}}
                                    />
                                    <label htmlFor="table-avail" style={{...labelStyle, marginBottom: 0, cursor: "pointer", textTransform: 'none', fontSize: '0.85rem', color: '#4b5563', fontWeight: 500 }}>Ready for guests</label>
                                </div>
                            </>
                        )}
                    </div>

                    <div style={footerStyle}>
                        <button type="button" className="brew-btn" onClick={onClose} style={{ padding: "0.55rem 1.25rem", borderRadius: "8px", fontSize: '0.85rem', fontWeight: 600, border: '1px solid #d4c0a8', background: '#f5f1ec' }}>Cancel</button>
                        <button type="submit" className="brew-btn brew-btn--primary" style={{ padding: "0.55rem 1.5rem", borderRadius: "8px", fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
            <style>
                {`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>
        </div>
    );
}

export default AddItemModal;