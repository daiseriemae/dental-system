
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_URL = `${API_BASE_URL}/api/services`;

const DentistServices = () => {
    const [services, setServices] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [serviceName, setServiceName] = useState("");
    const [servicePrice, setServicePrice] = useState("");
    const [serviceDescription, setServiceDescription] = useState("");

    const [editingService, setEditingService] = useState(null);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const getServiceImage = (name) => {
        const service = (name || "").toLowerCase();

        if (service.includes("cleaning")) {
            return "/dentist-cleaning-teeth.jpeg";
        }
        if (service.includes("filling")) {
            return "/tooth-filling.webp";
        }
        if (service.includes("whitening")) {
            return "/teeth-whitening.webp";
        }
        if (service.includes("extraction")) {
            return "/extraction.jpg";
        }
        if (
            service.includes("check-up") ||
            service.includes("checkup") ||
            service.includes("check up")
        ) {
            return "/what-to-expect-dental-checkup-facts.jpg";
        }
        if (service.includes("braces")) {
            return "/brace.jfif";
        }

        return "/dentist-cleaning-teeth.jpeg";
    };

    const fetchServices = async () => {
        try {
            setLoading(true);

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to load services.");
            }

            const data = await response.json();

            console.log("SERVICES FROM BACKEND:", data);

            const cleanServices = Array.isArray(data)
                ? data
                    .filter(
                        (service) =>
                            service &&
                            service.id !== undefined &&
                            service.id !== null
                    )
                    .map((service) => ({
                        ...service,
                        id: String(service.id),
                    }))
                : [];

            setServices(cleanServices);
        } catch (error) {
            console.error("LOAD SERVICES ERROR:", error);
            showMessage(error.message || "Failed to load services.", "danger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
    };

    const resetForm = () => {
        setServiceName("");
        setServicePrice("");
        setServiceDescription("");
    };

    const openAddModal = () => {
        resetForm();
        setMessage("");
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    const handleAddService = async (event) => {
        event.preventDefault();

        if (!serviceName.trim()) {
            showMessage("Please enter a service name.", "danger");
            return;
        }

        if (servicePrice === "" || Number.isNaN(Number(servicePrice))) {
            showMessage("Please enter a valid price.", "danger");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: serviceName.trim(),
                    price: Number(servicePrice),
                    description: serviceDescription.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to add service.");
            }

            if (!data.service || data.service.id == null) {
                throw new Error("Backend did not return the new service with an ID.");
            }

            const newService = {
                ...data.service,
                id: String(data.service.id),
            };

            setServices((current) => [...current, newService]);
            closeAddModal();
            showMessage("Service added successfully.");
        } catch (error) {
            console.error("ADD SERVICE ERROR:", error);
            showMessage(error.message || "Failed to add service.", "danger");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (service) => {
        if (!service || service.id == null || service.id === "") {
            showMessage("Cannot edit service: Service ID is missing.", "danger");
            return;
        }

        setEditingService({ ...service, id: String(service.id) });
        setServiceName(service.name || "");
        setServicePrice(service.price ?? "");
        setServiceDescription(service.description || "");
        setMessage("");
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingService(null);
        resetForm();
    };

    const handleEditService = async (event) => {
        event.preventDefault();

        if (!editingService || !editingService.id) {
            showMessage("Service ID is missing.", "danger");
            return;
        }

        if (!serviceName.trim()) {
            showMessage("Please enter a service name.", "danger");
            return;
        }

        if (servicePrice === "" || Number.isNaN(Number(servicePrice))) {
            showMessage("Please enter a valid price.", "danger");
            return;
        }

        try {
            setLoading(true);

            const serviceId = String(editingService.id);
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(serviceId)}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: serviceName.trim(),
                        price: Number(servicePrice),
                        description: serviceDescription.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update service.");
            }

            if (!data.service || data.service.id == null) {
                throw new Error("Backend did not return the updated service with an ID.");
            }

            const updatedService = {
                ...data.service,
                id: String(data.service.id),
            };

            setServices((current) =>
                current.map((service) =>
                    String(service.id) === serviceId ? updatedService : service
                )
            );

            closeEditModal();
            showMessage("Service updated successfully.");
        } catch (error) {
            console.error("EDIT SERVICE ERROR:", error);
            showMessage(error.message || "Failed to update service.", "danger");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (service) => {
        if (!service || service.id == null || service.id === "") {
            showMessage("Cannot delete service: Service ID is missing.", "danger");
            return;
        }

        setServiceToDelete({ ...service, id: String(service.id) });
        setMessage("");
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setServiceToDelete(null);
    };

    const handleDeleteService = async () => {
        if (!serviceToDelete || serviceToDelete.id == null) {
            showMessage("Service ID is missing.", "danger");
            return;
        }

        const serviceId = String(serviceToDelete.id);

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/${encodeURIComponent(serviceId)}`,
                { method: "DELETE" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete service.");
            }

            setServices((current) =>
                current.filter((service) => String(service.id) !== serviceId)
            );

            closeDeleteModal();
            showMessage("Service deleted successfully.");
        } catch (error) {
            console.error("DELETE SERVICE ERROR:", error);
            showMessage(error.message || "Failed to delete service.", "danger");
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => `₱${Number(price || 0).toLocaleString()}`;

    const modalStyle = {
        backgroundColor: "rgba(0,0,0,0.5)",
    };

    const modalContentStyle = {
        borderRadius: "16px",
    };

    const primaryButtonStyle = {
        backgroundColor: "#9b7bb8",
        color: "#ffffff",
        border: "none",
        borderRadius: "10px",
    };

    const renderServiceForm = (submitHandler, closeHandler, submitLabel) => (
        <form onSubmit={submitHandler}>
            <div className="modal-header border-0">
                <h5 className="modal-title fw-bold" style={{ color: "#80609e" }}>
                    {submitLabel === "Add Service" ? (
                        <><i className="bi bi-plus-circle me-2"></i>Add Service</>
                    ) : (
                        <><i className="bi bi-pencil-square me-2"></i>Edit Service</>
                    )}
                </h5>
                <button
                    type="button"
                    className="btn-close"
                    onClick={closeHandler}
                    disabled={loading}
                    aria-label="Close"
                />
            </div>

            <div className="modal-body px-4">
                {editingService && showEditModal && (
                    <div
                        className="alert mb-3"
                        style={{ backgroundColor: "#f3efff", color: "#80609e", border: "none" }}
                    >
                        Editing Service ID: <strong>{editingService.id}</strong>
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label fw-semibold">Service Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={serviceName}
                        onChange={(event) => setServiceName(event.target.value)}
                        placeholder="Enter service name"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Price</label>
                    <input
                        type="number"
                        className="form-control"
                        value={servicePrice}
                        onChange={(event) => setServicePrice(event.target.value)}
                        placeholder="Enter price"
                        min="0"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                        className="form-control"
                        rows="4"
                        value={serviceDescription}
                        onChange={(event) => setServiceDescription(event.target.value)}
                        placeholder="Enter service description"
                    />
                </div>
            </div>

            <div className="modal-footer border-0 flex-wrap">
                <button
                    type="button"
                    className="btn btn-light"
                    onClick={closeHandler}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                    style={primaryButtonStyle}
                >
                    {loading ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );

    return (
        <div className="dentist-services-page">
            <Sidebar role="dentist" active="services" />

            <main className="container-fluid dentist-services-main">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: "#80609e" }}>
                            Dental Services
                        </h2>
                        <p className="mb-0" style={{ color: "#777" }}>
                            Manage the services offered by your clinic
                        </p>
                    </div>

                    <div className="text-start text-md-end">
                        <div className="fw-semibold" style={{ color: "#80609e" }}>
                            Dr. Maria Santos
                        </div>
                        <small style={{ color: "#777" }}>Dentist</small>
                    </div>
                </div>

                {message && (
                    <div
                        className={`alert alert-${messageType} d-flex justify-content-between align-items-center gap-2`}
                        role="alert"
                    >
                        <span>{message}</span>
                        <button
                            type="button"
                            className="btn-close flex-shrink-0"
                            onClick={() => setMessage("")}
                            aria-label="Close message"
                        />
                    </div>
                )}

                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
                    <div className="card-body p-3 p-md-4">
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3">
                            <div>
                                <h5 className="fw-bold mb-1" style={{ color: "#80609e" }}>
                                    Available Services
                                </h5>
                                <p className="mb-0" style={{ color: "#777" }}>
                                    Add, edit, or delete dental services.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn w-100 w-sm-auto"
                                onClick={openAddModal}
                                style={primaryButtonStyle}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Add Service
                            </button>
                        </div>
                    </div>
                </div>

                {loading && services.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" style={{ color: "#9b7bb8" }} />
                        <p className="mt-3 text-muted">Loading services...</p>
                    </div>
                ) : services.length === 0 ? (
                    <div className="card border-0 shadow-sm text-center" style={{ borderRadius: "16px" }}>
                        <div className="card-body py-5">
                            <i className="bi bi-tooth" style={{ fontSize: "50px", color: "#9b7bb8" }} />
                            <h5 className="mt-3 fw-bold" style={{ color: "#80609e" }}>
                                No services available
                            </h5>
                            <p className="text-muted">Add your first dental service.</p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-3 g-md-4">
                        {services.map((service) => (
                            <div className="col-12 col-sm-6 col-xl-4" key={`service-${service.id}`}>
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                                    <div className="card-body p-3 p-md-4">
                                        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                                style={{
                                                    width: "75px",
                                                    height: "75px",
                                                    backgroundColor: "#e9def5",
                                                    color: "#80609e",
                                                }}
                                            >
                                                <img
                                                    src={getServiceImage(service.name)}
                                                    alt={service.name || "Dental service"}
                                                    onError={(event) => {
                                                        event.currentTarget.onerror = null;
                                                        event.currentTarget.style.display = "none";
                                                        const fallback = document.createElement("i");
                                                        fallback.className = "bi bi-tooth";
                                                        fallback.style.fontSize = "30px";
                                                        event.currentTarget.parentElement.appendChild(fallback);
                                                    }}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>

                                            <span
                                                className="badge text-wrap"
                                                style={{ backgroundColor: "#f3efff", color: "#80609e" }}
                                            >
                                                ID: {service.id}
                                            </span>
                                        </div>

                                        <h5 className="fw-bold mb-2 text-break" style={{ color: "#80609e" }}>
                                            {service.name}
                                        </h5>
                                        <h6 className="fw-bold mb-3" style={{ color: "#9b7bb8" }}>
                                            {formatPrice(service.price)}
                                        </h6>
                                        <p className="text-muted mb-4 text-break">
                                            {service.description || "No description available."}
                                        </p>

                                        <div className="d-flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm flex-fill"
                                                onClick={() => openEditModal(service)}
                                                style={{
                                                    backgroundColor: "#e9def5",
                                                    color: "#80609e",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    minWidth: "90px",
                                                }}
                                            >
                                                <i className="bi bi-pencil me-1"></i>
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm flex-fill"
                                                onClick={() => openDeleteModal(service)}
                                                style={{
                                                    backgroundColor: "#f8d7da",
                                                    color: "#842029",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    minWidth: "90px",
                                                }}
                                            >
                                                <i className="bi bi-trash me-1"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showAddModal && (
                    <div className="modal fade show d-block" tabIndex="-1" style={modalStyle}>
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content border-0" style={modalContentStyle}>
                                {renderServiceForm(handleAddService, closeAddModal, "Add Service")}
                            </div>
                        </div>
                    </div>
                )}

                {showEditModal && (
                    <div className="modal fade show d-block" tabIndex="-1" style={modalStyle}>
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content border-0" style={modalContentStyle}>
                                {renderServiceForm(handleEditService, closeEditModal, "Save Changes")}
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && serviceToDelete && (
                    <div className="modal fade show d-block" tabIndex="-1" style={modalStyle}>
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content border-0" style={modalContentStyle}>
                                <div className="modal-header border-0">
                                    <h5 className="modal-title fw-bold" style={{ color: "#842029" }}>
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        Delete Service
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeDeleteModal}
                                        disabled={loading}
                                        aria-label="Close"
                                    />
                                </div>

                                <div className="modal-body px-4">
                                    <p>Are you sure you want to delete this service?</p>
                                    <div className="p-3 rounded" style={{ backgroundColor: "#f3efff" }}>
                                        <div className="fw-bold" style={{ color: "#80609e" }}>
                                            {serviceToDelete.name}
                                        </div>
                                        <div className="text-muted">
                                            Price: {formatPrice(serviceToDelete.price)}
                                        </div>
                                        <div className="text-muted text-break">
                                            Service ID: <strong>{serviceToDelete.id}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0 flex-wrap">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={closeDeleteModal}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={handleDeleteService}
                                        disabled={loading}
                                        style={{ backgroundColor: "#dc3545", color: "#ffffff" }}
                                    >
                                        {loading ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                .dentist-services-page {
                    min-height: 100vh;
                    background-color: #f3efff;
                }

                .dentist-services-main {
                    margin-left: 260px;
                    width: calc(100% - 260px);
                    padding: 35px;
                    box-sizing: border-box;
                }

                @media (max-width: 768px) {
                    .dentist-services-main {
                        margin-left: 0;
                        width: 100%;
                        padding: 20px 14px;
                    }
                }

                @media (max-width: 480px) {
                    .dentist-services-main {
                        padding: 16px 12px;
                    }
                }
            `}</style>
        </div>
    );
};

export default DentistServices;
