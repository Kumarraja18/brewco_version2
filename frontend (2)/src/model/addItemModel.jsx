import React, { useState } from "react";
import toast from "react-hot-toast";

function AddItemModal({ type, isOpen, onClose, onSave, menuItems }) {
    const [formData, setFormData] = useState(() => {
        if (type === "chef" || type === "waiter") {
            return {
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                dob: "",
                gender: "",
                maritalStatus: "",
                street: "",
                city: "",
                state: "",
                pincode: "",
                companyName: "",
                designation: "",
                startDate: "",
                endDate: "",
                ctc: "",
                currentlyWorking: false,
                reasonForLeaving: "",
                idType: "",
                idNumber: "",
                idDocument: null,
            };
        } else if (type === "menu") {
            return {
                name: "",
                type: "Beverage",
                category: "VEG",
                price: "",
                isAvailable: true,
            };
        } else if (type === "combo") {
            return {
                name: "",
                items: [],
                price: "",
                isAvailable: true,
            };
        }
        else if (type === "table") {
            return {
                tableName: "",
                capacity: "",
                tableType: "STANDARD",
                status: "AVAILABLE",
            };
        }
        return {};
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type: inputType, checked, files } = e.target;
        if (inputType === "checkbox") setFormData({ ...formData, [name]: checked });
        else if (inputType === "file") setFormData({ ...formData, [name]: files[0] });
        else setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        onSave(formData);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
        onClose();
    };
    const inputStyle = {
        width: "100%",
        padding: "10px",
        marginBottom: "12px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px",
        boxSizing: "border-box"
    };

    const labelStyle = {
        fontSize: "14px",
        marginBottom: "5px",
        display: "block",
        fontWeight: "500"
    };

    const sectionTitle = {
        marginTop: "15px",
        marginBottom: "10px",
        fontSize: "16px",
        fontWeight: "600"
    };
    const gridThree = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "15px",
        marginBottom: "15px"
    };

    const gridTwo = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "15px",
        marginBottom: "15px"
    };
    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 1000
        }}>
            <div style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
                width: "850px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
            }}>
                <h3 style={{ marginBottom: 20 }}>Add {type.charAt(0).toUpperCase() + type.slice(1)}</h3>

                {/* Chef / Waiter Form */}
                {(type === "chef" || type === "waiter") && (
                    <>
                        <h4 style={sectionTitle}>Personal Info</h4>

                        {/* Row 1 */}
                        <div style={gridThree}>
                            <div>
                                <label style={labelStyle}>First Name</label>
                                <input name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>Last Name</label>
                                <input name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>Email</label>
                                <input name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div style={gridThree}>
                            <div>
                                <label style={labelStyle}>Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>Gender</label>
                                <input name="gender" value={formData.gender} onChange={handleChange} style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>Marital Status</label>
                                <input name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>

                        <h4 style={sectionTitle}>Address</h4>

                        {/* Street + City */}
                        <div style={gridTwo}>
                            <div>
                                <label style={labelStyle}>Street</label>
                                <input name="street" value={formData.street} onChange={handleChange} style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>City</label>
                                <input name="city" value={formData.city} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>

                        {/* State + Pincode */}
                        <div style={gridTwo}>
                            <div>
                                <label style={labelStyle}>State</label>
                                <input name="state" value={formData.state} onChange={handleChange} style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>Pincode</label>
                                <input name="pincode" value={formData.pincode} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                        {/* <h4>Employment</h4>
                        <input name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} />
                        <input name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} />
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                        <input name="ctc" placeholder="CTC" value={formData.ctc} onChange={handleChange} />
                        <label>
                            <input type="checkbox" name="currentlyWorking" checked={formData.currentlyWorking} onChange={handleChange} /> Currently Working
                        </label>
                        <input name="reasonForLeaving" placeholder="Reason for Leaving" value={formData.reasonForLeaving} onChange={handleChange} />

                        <h4>ID Proof</h4>
                        <input name="idType" placeholder="ID Type" value={formData.idType} onChange={handleChange} />
                        <input name="idNumber" placeholder="ID Number" value={formData.idNumber} onChange={handleChange} />
                        <input type="file" name="idDocument" onChange={handleChange} /> */}

                    </>
                )}



                {/* Menu Form */}
                {type === "menu" && (
                    <>
                        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="Beverage">Beverage</option>
                            <option value="Snack">Snack</option>
                        </select>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="VEG">VEG</option>
                            <option value="NON_VEG">NON-VEG</option>
                        </select>
                        <input name="price" placeholder="Price" value={formData.price} onChange={handleChange} />
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px"
                        }}>
                            <input
                                type="checkbox"
                                name="isAvailable"
                                checked={formData.isAvailable}
                                onChange={handleChange}
                            />
                            <span>Available</span>
                        </div>
                    </>
                )}

                {/* Combo Form */}
                {type === "combo" && (
                    <>
                        <input name="name" placeholder="Combo Name" value={formData.name} onChange={handleChange} />
                        <select multiple name="items" value={formData.items} onChange={(e) => {
                            const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                            setFormData({ ...formData, items: options });
                        }}>
                            {menuItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                        <input name="price" placeholder="Combo Price" value={formData.price} onChange={handleChange} />
                        <label>
                            <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} /> Available
                        </label>
                    </>
                )}
                {/* Table Form */}
                {type === "table" && (
                    <>
                        <input
                            name="tableName"
                            placeholder="Table Name"
                            value={formData.tableName}
                            onChange={handleChange}
                            style={{ width: "100%", marginBottom: 10, padding: 8 }}
                        />

                        <input
                            type="number"
                            name="capacity"
                            placeholder="Seating Capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            style={{ width: "100%", marginBottom: 10, padding: 8 }}
                        />

                        <select
                            name="tableType"
                            value={formData.tableType}
                            onChange={handleChange}
                            style={{ width: "100%", marginBottom: 10, padding: 8 }}
                        >
                            <option value="STANDARD">Standard</option>
                            <option value="PREMIUM">Premium</option>
                        </select>

                        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                                type="checkbox"
                                checked={formData.status === "AVAILABLE"}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.checked ? "AVAILABLE" : "OCCUPIED",
                                    })
                                }
                            />
                            Available
                        </label>
                    </>
                )}

                <div style={{
                    marginTop: 25,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px"
                }}>
                    <button className="brew-btn" onClick={onClose}>Cancel</button>
                    <button className="brew-btn brew-btn--primary" onClick={handleSubmit}>Save</button>
                </div>
            </div>
        </div >
    );
}
export default AddItemModal;