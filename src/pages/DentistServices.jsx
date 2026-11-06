import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";

const BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080";

const API_URL = `${BASE_URL.replace(/\/+$/, "")}/api/services`;

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

        if (service.includes("cleaning")) return "/dentist-cleaning-teeth.jpeg";
        if (service.includes("filling")) return "/tooth-filling.webp";
        if (service.includes("whitening")) return "/teeth-whitening.webp";
        if (service.includes("extraction")) return "/extraction.jpg";

        if (
            service.includes("check-up") ||
            service.includes("checkup") ||
            service.includes("check up")
        ) {
            return "/what-to-expect-dental-checkup-facts.jpg";
        }

        if (service.includes("braces")) return "/brace.jfif";
        return "/dentist-cleaning-teeth.jpeg";
    };

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
        window.clearTimeout(showMessage.timeoutId);
        showMessage.timeoutId = window.setTimeout(() => setMessage(""), 3000);
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

    const validateForm = () => {
        if (!serviceName.trim()) {
            showMessage("Please enter a service name.", "danger");
            return false;
        }

        if (
            servicePrice === "" ||
            !Number.isFinite(Number(servicePrice)) ||
            Number(servicePrice) < 0
        ) {
            showMessage("Please enter a valid price.", "danger");
            return false;
        }

        return true;
    };

    const handleAddService = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

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
            console.log("ADD SERVICE RESPONSE:", data);

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

        const selectedService = { ...service, id: String(service.id) };
        setEditingService(selectedService);
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

        if (!editingService || editingService.id == null) {
            showMessage("Service ID is missing.", "danger");
            return;
        }

        if (!validateForm()) return;

        const serviceId = String(editingService.id);

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/${encodeURIComponent(serviceId)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: serviceName.trim(),
                    price: Number(servicePrice),
                    description: serviceDescription.trim(),
                }),
            });

            const data = await response.json();
            console.log("EDIT SERVICE RESPONSE:", data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to update service.");
            }

            if (!data.service) {
                throw new Error("Backend did not return the updated service.");
            }

            const updatedService = {
                ...data.service,
                id: String(data.service.id ?? serviceId),
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
            console.log("DELETE SERVICE RESPONSE:", data);

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

    const formatPrice = (price) =>
        `₱${Number(price || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const renderServiceForm = (onSubmit, submitLabel) => (
        <form onSubmit={onSubmit}>
            <div className="modal-header border-0">
                <h5 className="modal-title fw-bold" style={{ color: "#80609e" }}>
                    {showAddModal ? (
                        <><i className="bi bi-plus-circle me-2"></i>Add Service</>
                    ) : (
                        <><i className="bi bi-pencil-square me-2"></i>Edit Service</>
                    )}
                </h5>
                <button
                    type="button"
                    className="btn-close"
                    onClick={showAddModal ? closeAddModal : closeEditModal}
                    disabled={loading}
                    aria-label="Close"
                />
            </div>

            <div className="modal-body px-4">
                {showEditModal && editingService && (
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
                        step="0.01"
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

            <div className="modal-footer border-0">
                <button
                    type="button"
                    className="btn btn-light"
                    onClick={showAddModal ? closeAddModal : closeEditModal}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                    style={{ backgroundColor: "#9b7bb8", color: "#fff" }}
                >
                    {loading ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );

    return (
        <div className="dentist-services-page">
            <Sidebar role="dentist" active="services" />

            <main className="dentist-services-main">
                <div className="d-flex justify-content-between align-items-center gap-3 mb-4 services-page-header">
                    <div className="d-flex align-items-center gap-3 services-heading-group">
                        <button
                            type="button"
                            className="mobile-sidebar-toggle"
                            onClick={() => {
                                document.getElementById("sidebar")?.classList.add("show");
                            }}
                            aria-label="Open navigation menu"
                        >
                            <i className="bi bi-list"></i>
                        </button>

                        <div>
                            <h2 className="fw-bold mb-1" style={{ color: "#80609e" }}>
                                Dental Services
                            </h2>
                            <p className="mb-0" style={{ color: "#777" }}>
                                Manage the services offered by your clinic
                            </p>
                        </div>
                    </div>

                    <div className="text-end dentist-profile-label">
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
                            className="btn-close"
                            onClick={() => setMessage("")}
                            aria-label="Close message"
                        />
                    </div>
                )}

                <section className="card border-0 shadow-sm mb-4 services-toolbar">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center gap-3 services-toolbar-content">
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
                                className="btn add-service-button"
                                onClick={openAddModal}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Add Service
                            </button>
                        </div>
                    </div>
                </section>

                {loading && services.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" style={{ color: "#9b7bb8" }} />
                        <p className="mt-3 text-muted">Loading services...</p>
                    </div>
                ) : services.length === 0 ? (
                    <div className="card border-0 shadow-sm text-center empty-services">
                        <div className="card-body py-5">
                            <i className="bi bi-tooth empty-services-icon" />
                            <h5 className="mt-3 fw-bold" style={{ color: "#80609e" }}>
                                No services available
                            </h5>
                            <p className="text-muted">Add your first dental service.</p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4 services-grid">
                        {services.map((service) => (
                            <div
                                className="col-12 col-sm-6 col-xl-4"
                                key={`service-${service.id}`}
                            >
                                <article className="card border-0 shadow-sm h-100 service-card">
                                    <div className="card-body p-3 p-md-4">
                                        <div className="d-flex justify-content-end mb-2">
                                            <span className="badge service-id-badge">
                                                Service ID: {service.id}
                                            </span>
                                        </div>

                                        <div className="service-image-wrapper">
                                            <img
                                                src={getServiceImage(service.name)}
                                                alt={service.name || "Dental service"}
                                                loading="lazy"
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.style.display = "none";
                                                    event.currentTarget.parentElement.classList.add("image-unavailable");
                                                }}
                                            />
                                            <i className="bi bi-tooth service-image-fallback" aria-hidden="true" />
                                        </div>

                                        <h5 className="fw-bold mb-2 service-name">
                                            {service.name}
                                        </h5>

                                        <h6 className="fw-bold mb-3 service-price">
                                            {formatPrice(service.price)}
                                        </h6>

                                        <p className="text-muted mb-4 service-description">
                                            {service.description || "No description available."}
                                        </p>

                                        <div className="d-flex gap-2 service-actions">
                                            <button
                                                type="button"
                                                className="btn btn-sm flex-fill edit-service-button"
                                                onClick={() => openEditModal(service)}
                                            >
                                                <i className="bi bi-pencil me-1"></i>
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-sm flex-fill delete-service-button"
                                                onClick={() => openDeleteModal(service)}
                                            >
                                                <i className="bi bi-trash me-1"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {(showAddModal || showEditModal) && (
                <div className="modal fade show d-block services-modal-backdrop" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 services-modal">
                            {showAddModal
                                ? renderServiceForm(handleAddService, "Add Service")
                                : renderServiceForm(handleEditService, "Save Changes")}
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && serviceToDelete && (
                <div className="modal fade show d-block services-modal-backdrop" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 services-modal">
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
                                <p className="mb-3">
                                    Are you sure you want to delete this service?
                                </p>

                                <div className="p-3 rounded delete-service-summary">
                                    <div className="fw-bold" style={{ color: "#80609e" }}>
                                        {serviceToDelete.name}
                                    </div>
                                    <div className="text-muted">
                                        Price: {formatPrice(serviceToDelete.price)}
                                    </div>
                                    <div className="text-muted">
                                        Service ID: <strong>{serviceToDelete.id}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer border-0">
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
                                    style={{ backgroundColor: "#dc3545", color: "#fff" }}
                                >
                                    {loading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .dentist-services-page {
                    min-height: 100vh;
                    width: 100%;
                    background: #f3efff;
                    overflow-x: hidden;
                }

                .dentist-services-main {
                    margin-left: 250px;
                    width: calc(100% - 250px);
                    min-height: 100vh;
                    padding: 30px;
                    box-sizing: border-box;
                    overflow-x: hidden;
                }

                .services-page-header,
                .services-toolbar-content {
                    min-width: 0;
                }

                .services-toolbar,
                .service-card,
                .empty-services {
                    border-radius: 16px;
                }

                .add-service-button {
                    flex-shrink: 0;
                    background: #9b7bb8;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    padding: 10px 18px;
                    white-space: nowrap;
                }

                .add-service-button:hover {
                    background: #80609e;
                    color: #fff;
                }

                .services-grid > div {
                    min-width: 0;
                }

                .service-card {
                    overflow: hidden;
                }

                .service-id-badge {
                    background: #f3efff;
                    color: #80609e;
                    font-weight: 600;
                    padding: 7px 10px;
                }

                .service-image-wrapper {
                    position: relative;
                    width: 100%;
                    height: 190px;
                    padding: 6px;
                    margin-bottom: 18px;
                    box-sizing: border-box;
                    overflow: hidden;
                    border-radius: 13px;
                    background: #f3efff;
                }

                .service-image-wrapper img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    border-radius: 9px;
                }

                .service-image-fallback {
                    display: none;
                    position: absolute;
                    inset: 6px;
                    align-items: center;
                    justify-content: center;
                    color: #9b7bb8;
                    font-size: 42px;
                    background: #e9def5;
                    border-radius: 9px;
                }

                .service-image-wrapper.image-unavailable .service-image-fallback {
                    display: flex;
                }

                .service-name {
                    color: #80609e;
                    overflow-wrap: anywhere;
                }

                .service-price {
                    color: #9b7bb8;
                }

                .service-description {
                    min-height: 48px;
                    overflow-wrap: anywhere;
                }

                .service-actions button {
                    min-height: 40px;
                    border: none;
                    border-radius: 8px;
                }

                .edit-service-button {
                    background: #e9def5;
                    color: #80609e;
                }

                .edit-service-button:hover {
                    background: #d8ccec;
                    color: #80609e;
                }

                .delete-service-button {
                    background: #f8d7da;
                    color: #842029;
                }

                .delete-service-button:hover {
                    background: #f1bfc4;
                    color: #842029;
                }

                .empty-services-icon {
                    font-size: 50px;
                    color: #9b7bb8;
                }

                .services-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 20000;
                    overflow-y: auto;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.5);
                }

                .services-modal {
                    border-radius: 16px;
                    overflow: hidden;
                }

                .services-modal .form-control {
                    width: 100%;
                    min-width: 0;
                    box-sizing: border-box;
                }

                .delete-service-summary {
                    background: #f3efff;
                    overflow-wrap: anywhere;
                }

                .mobile-sidebar-toggle {
                    display: none;
                    flex: 0 0 42px;
                    width: 42px;
                    height: 42px;
                    align-items: center;
                    justify-content: center;
                    border: 0;
                    border-radius: 10px;
                    background: #9b7bb8;
                    color: #fff;
                    font-size: 25px;
                    line-height: 1;
                }

                @media (max-width: 768px) {
                    .dentist-services-main {
                        margin-left: 0;
                        width: 100%;
                        padding: 22px;
                    }

                    .mobile-sidebar-toggle {
                        display: inline-flex;
                    }
                }

                @media (max-width: 575.98px) {
                    .dentist-services-main {
                        padding: 14px;
                    }

                    .services-page-header {
                        align-items: flex-start !important;
                    }

                    .services-heading-group {
                        min-width: 0;
                    }

                    .services-page-header h2 {
                        font-size: 21px;
                    }

                    .services-page-header p {
                        font-size: 13px;
                    }

                    .dentist-profile-label {
                        display: none;
                    }

                    .services-toolbar-content {
                        align-items: flex-start !important;
                        flex-direction: column;
                    }

                    .add-service-button {
                        width: 100%;
                    }

                    .service-image-wrapper {
                        height: 175px;
                        margin-bottom: 14px;
                    }

                    .service-description {
                        min-height: 0;
                    }

                    .service-actions button {
                        min-height: 42px;
                    }

                    .services-modal-backdrop {
                        padding: 8px;
                    }

                    .services-modal-backdrop .modal-dialog {
                        margin: 8px auto;
                    }

                    .services-modal .modal-body {
                        padding-left: 16px !important;
                        padding-right: 16px !important;
                    }

                    .services-modal .modal-footer {
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .services-modal .modal-footer button {
                        flex: 1;
                        min-width: 100px;
                    }
                }

                @media (max-width: 360px) {
                    .dentist-services-main {
                        padding: 10px;
                    }

                    .service-actions {
                        gap: 6px !important;
                    }

                    .service-actions button {
                        padding: 7px 5px;
                        font-size: 12px;
                    }
                }
            `}</style>
        </div>
    );
};

export default DentistServices;
