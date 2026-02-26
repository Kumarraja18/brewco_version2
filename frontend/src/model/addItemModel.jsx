import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars, FaMapMarkerAlt, FaUtensils, FaTag, FaRupeeSign, FaCheckCircle, FaChair, FaUsers } from "react-icons/fa";

function AddItemModal({ type, isOpen, onClose, onSave, menuItems, categories = [] }) {
    // Initialize with empty strings to prevent "uncontrolled input" warning
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", phone: "",
        dob: "", gender: "MALE", street: "", city: "",
        state: "", pincode: "", name: "", type: "VEG",
        categoryId: "", price: "", isAvailable: true, 
        description: "", tableName: "", capacity: "2",
        tableType: "STANDARD", status: "AVAILABLE",
        displayOrder: "0"
    });

    // Reset form when type changes or modal opens
    useEffect(() => {
        if (isOpen) {
            const initialData = {
                firstName: "", lastName: "", email: "", phone: "",
                dob: "", gender: "MALE", street: "", city: "",
                state: "", pincode: "", name: "", type: "VEG",
                categoryId: categories[0]?.id || "", price: "", isAvailable: true, 
                description: "", tableName: "", capacity: "2",
                tableType: "STANDARD", status: "AVAILABLE",
                displayOrder: "0"
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
        onSave(formData);
        onClose();
    };

    const modalOverlayStyle = {
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 2000, padding: "20px"
    };

    const modalContentStyle = {
        background: "#fff",
        borderRadius: "20px",
        width: "100%",
        maxWidth: type === "menu" || type === "table" || type === "category" ? "500px" : "800px",
        maxHeight: "90vh",
        overflow: "hidden", // Remove scroll bar from content
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        position: "relative",
        display: "flex",
        flexDirection: "column"
    };

    const headerStyle = {
        padding: "20px 30px",
        borderBottom: "1px solid #f0f0f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff"
    };

    const bodyStyle = { 
        padding: "30px",
        overflowY: "auto", // Allow scrolling only in the body if needed
        flex: 1
    };

    const footerStyle = {
        padding: "20px 30px",
        borderTop: "1px solid #f0f0f0",
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        background: "#fafafa"
    };

    const inputGroupStyle = { marginBottom: "20px" };
    const labelStyle = { display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: "600", color: "#4b5563", marginBottom: "8px" };
    const fieldStyle = {
        width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid #e5e7eb",
        fontSize: "1rem", outline: "none", transition: "border-color 0.2s",
        background: "#f9fafb"
    };

    const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "700", color: "#1f2937" }}>
                        Add {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#9ca3af" }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <div style={bodyStyle} className="hide-scrollbar">
                        {/* Category Form */}
                        {type === "category" && (
                            <>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Category Name</label>
                                    <input name="name" value={formData.name} onChange={handleChange} style={fieldStyle} required />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Display Order</label>
                                    <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} style={fieldStyle} />
                                </div>
                            </>
                        )}

                        {/* Staff Form (Chef/Waiter) */}
                        {(type === "chef" || type === "waiter") && (
                            <>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>First Name</label>
                                        <input name="firstName" value={formData.firstName} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Last Name</label>
                                        <input name="lastName" value={formData.lastName} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                </div>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Phone</label>
                                        <input name="phone" value={formData.phone} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                </div>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Date of Birth</label>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={fieldStyle} required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} style={fieldStyle}>
                                            <option value="MALE">Male</option>
                                            <option value="FEMALE">Female</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Street Address</label>
                                    <input name="street" value={formData.street} onChange={handleChange} style={fieldStyle} />
                                </div>
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>City</label>
                                        <input name="city" value={formData.city} onChange={handleChange} style={fieldStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Pincode</label>
                                        <input name="pincode" value={formData.pincode} onChange={handleChange} style={fieldStyle} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Menu Item Form */}
                        {type === "menu" && (
                            <>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Item Name</label>
                                    <input name="name" value={formData.name} onChange={handleChange} style={fieldStyle} required />
                                </div>
                                
                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Category</label>
                                        <select name="categoryId" value={formData.categoryId} onChange={handleChange} style={fieldStyle} required>
                                            {categories.length > 0 ? (
                                                categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                                            ) : (
                                                <option value="">No Categories Found</option>
                                            )}
                                        </select>
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Type</label>
                                        <select name="type" value={formData.type} onChange={handleChange} style={fieldStyle}>
                                            <option value="VEG">Veg</option>
                                            <option value="NON_VEG">Non-Veg</option>
                                            <option value="EGG">Contains Egg</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Price (INR)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} style={fieldStyle} required />
                                </div>

                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} style={{...fieldStyle, height: "80px", resize: "none"}} />
                                </div>

                                <div style={{...inputGroupStyle, display: "flex", alignItems: "center", gap: "10px", marginTop: "10px"}}>
                                    <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} id="avail-check" style={{width: "18px", height: "18px", cursor: "pointer"}} />
                                    <label htmlFor="avail-check" style={{...labelStyle, marginBottom: 0, cursor: "pointer"}}>Item is available</label>
                                </div>
                            </>
                        )}

                        {/* Table Form */}
                        {type === "table" && (
                            <>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Table Number</label>
                                    <input type="number" name="tableName" value={formData.tableName} onChange={handleChange} style={fieldStyle} required />
                                </div>

                                <div style={gridStyle}>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Capacity</label>
                                        <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} style={fieldStyle} min="1" required />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={labelStyle}>Table Type</label>
                                        <select name="tableType" value={formData.tableType} onChange={handleChange} style={fieldStyle}>
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
                                        style={{width: "18px", height: "18px", cursor: "pointer"}}
                                    />
                                    <label htmlFor="table-avail" style={{...labelStyle, marginBottom: 0, cursor: "pointer"}}>Table is ready</label>
                                </div>
                            </>
                        )}
                    </div>

                    <div style={footerStyle}>
                        <button type="button" className="brew-btn" onClick={onClose} style={{ padding: "10px 25px", borderRadius: "10px" }}>Cancel</button>
                        <button type="submit" className="brew-btn brew-btn--primary" style={{ padding: "10px 30px", borderRadius: "10px", fontWeight: "700" }}>
                            Save
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