
import { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar.jsx";

const BASE_URL = "https://dental-system-rzqb.onrender.com";
const API_URL = `${BASE_URL}/api/services`;

const getServiceName = (service) =>
    String(
        service?.name ??
        service?.service_name ??
        service?.serviceName ??
        service?.service ??
        service?.title ??
        ""
    ).trim();

const normalizeService = (service) => ({
    ...service,
    id: String(service.id ?? service._id ?? service.service_id),
    name: getServiceName(service),
    price: Number(service.price ?? service.cost ?? 0),
    description: service.description ?? ""
});

const getServiceImage = (name) => {
    const service = String(name || "").toLowerCase();

    if (service.includes("cleaning")) return "/dentist-cleaning-teeth.jpeg";

    if (
        service.includes("check up") ||
        service.includes("checkup") ||
        service.includes("examination")
    ) {
        return "/what-to-expect-dental-checkup-facts.jpg";
    }

    if (service.includes("filling")) return "/tooth-filling.webp";
    if (service.includes("whitening")) return "/teeth-whitening.webp";
    if (service.includes("extraction")) return "/extraction.jpg";

    if (
        service.includes("braces") ||
        service.includes("orthodontic")
    ) {
        return "/brace.jfif";
    }

    return "";
};

async function readResponse(response) {
    const text = await response.text();

    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch {
        throw new Error(
            "The server returned an invalid response. Check your backend."
        );
    }
}

function getErrorMessage(data, fallback) {
    return data?.message || data?.error || fallback;
}

export default function DentistServices() {
    const [services, setServices] = useState([]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [serviceName, setServiceName] = useState("");
    const [servicePrice, setServicePrice] = useState("");
    const [serviceDescription, setServiceDescription] = useState("");

    const [editingService, setEditingService] = useState(null);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    const [loadingServices, setLoadingServices] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
    };

    const clearMessage = () => setMessage("");

    // ==========================================
    // LOAD SERVICES FROM TiDB
    // ==========================================

    const fetchServices = useCallback(async () => {
        try {
            setLoadingServices(true);

            const response = await fetch(API_URL);
            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(data, "Failed to load services.")
                );
            }

            const list = Array.isArray(data)
                ? data
                : data.services || data.data || data.results || [];

            if (!Array.isArray(list)) {
                throw new Error("Invalid services response from backend.");
            }

            const normalized = list
                .filter((item) => item && (
                    item.id != null ||
                    item._id != null ||
                    item.service_id != null
                ))
                .map(normalizeService);

            setServices(normalized);

        } catch (error) {
            console.error("LOAD SERVICES ERROR:", error);
            showMessage(error.message, "danger");
        } finally {
            setLoadingServices(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // ==========================================
    // FORM HELPERS
    // ==========================================

    const resetForm = () => {
        setServiceName("");
        setServicePrice("");
        setServiceDescription("");
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

    const getFormData = () => ({
        name: serviceName.trim(),
        price: Number(servicePrice),
        description: serviceDescription.trim()
    });

    // ==========================================
    // OPEN AND CLOSE ADD MODAL
    // ==========================================

    const openAddModal = () => {
        resetForm();
        clearMessage();
        setShowEditModal(false);
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        if (saving) return;
        setShowAddModal(false);
        resetForm();
    };

    // ==========================================
    // ADD SERVICE TO TiDB
    // ==========================================

    const handleAddService = async (event) => {
        event.preventDefault();

        if (saving || !validateForm()) return;

        setSaving(true);
        clearMessage();

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(getFormData())
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(data, "Failed to add service.")
                );
            }

            setShowAddModal(false);
            resetForm();

            // Always reload from TiDB to get the actual database record.
            await fetchServices();

            showMessage(
                data.message || "Service added successfully.",
                "success"
            );

        } catch (error) {
            console.error("ADD SERVICE ERROR:", error);
            showMessage(error.message, "danger");
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // OPEN AND CLOSE EDIT MODAL
    // ==========================================

    const openEditModal = (service) => {
        if (!service || service.id == null || service.id === "") {
            showMessage("Cannot edit service: Service ID is missing.", "danger");
            return;
        }

        setEditingService(service);
        setServiceName(service.name);
        setServicePrice(String(service.price));
        setServiceDescription(service.description || "");

        clearMessage();
        setShowAddModal(false);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        if (saving) return;

        setShowEditModal(false);
        setEditingService(null);
        resetForm();
    };

    // ==========================================
    // UPDATE SERVICE IN TiDB
    // ==========================================

    const handleEditService = async (event) => {
        event.preventDefault();

        if (saving || !editingService || !validateForm()) return;

        const id = editingService.id;

        setSaving(true);
        clearMessage();

        try {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(id)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(getFormData())
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(data, "Failed to update service.")
                );
            }

            setShowEditModal(false);
            setEditingService(null);
            resetForm();

            // Reload the updated database record.
            await fetchServices();

            showMessage(
                data.message || "Service updated successfully.",
                "success"
            );

        } catch (error) {
            console.error("EDIT SERVICE ERROR:", error);
            showMessage(error.message, "danger");
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // OPEN AND CLOSE DELETE MODAL
    // ==========================================

    const openDeleteModal = (service) => {
        if (!service || service.id == null || service.id === "") {
            showMessage("Cannot delete service: Service ID is missing.", "danger");
            return;
        }

        setServiceToDelete(service);
        clearMessage();
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        if (saving) return;

        setShowDeleteModal(false);
        setServiceToDelete(null);
    };

    // ==========================================
    // DELETE SERVICE FROM TiDB
    // ==========================================

    const handleDeleteService = async () => {
        if (saving || !serviceToDelete) return;

        const id = serviceToDelete.id;

        setSaving(true);
        clearMessage();

        try {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(id)}`,
                {
                    method: "DELETE"
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(data, "Failed to delete service.")
                );
            }

            setShowDeleteModal(false);
            setServiceToDelete(null);

            await fetchServices();

            showMessage(
                data.message || "Service deleted successfully.",
                "success"
            );

        } catch (error) {
            console.error("DELETE SERVICE ERROR:", error);
            showMessage(error.message, "danger");
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // PRICE FORMAT
    // ==========================================

    const formatPrice = (price) =>
        `₱${Number(price || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    // ==========================================
    // SERVICE FORM
    // ==========================================

    const renderServiceForm = (onSubmit, isEditing) => (
        <form onSubmit={onSubmit}>
            <div className="modal-header border-0">
                <h5 className="modal-title fw-bold service-purple">
                    <i className={`bi ${isEditing
                        ? "bi-pencil-square"
                        : "bi-plus-circle"} me-2`} />
                    {isEditing ? "Edit Service" : "Add Service"}
                </h5>

                <button
                    type="button"
                    className="btn-close"
                    onClick={isEditing ? closeEditModal : closeAddModal}
                    disabled={saving}
                    aria-label="Close"
                />
            </div>

            <div className="modal-body px-4">
                {isEditing && editingService && (
                    <div className="alert service-id-alert">
                        Editing Service ID: <strong>{editingService.id}</strong>
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Service Name
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        value={serviceName}
                        onChange={(event) => setServiceName(event.target.value)}
                        placeholder="Enter service name"
                        maxLength={150}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Price (₱)
                    </label>

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
                    <label className="form-label fw-semibold">
                        Description
                    </label>

                    <textarea
                        className="form-control"
                        rows="4"
                        value={serviceDescription}
                        onChange={(event) =>
                            setServiceDescription(event.target.value)
                        }
                        placeholder="Enter service description"
                    />
                </div>
            </div>

            <div className="modal-footer border-0">
                <button
                    type="button"
                    className="btn btn-light"
                    onClick={isEditing ? closeEditModal : closeAddModal}
                    disabled={saving}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="btn service-primary-button"
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : isEditing
                            ? "Save Changes"
                            : "Add Service"}
                </button>
            </div>
        </form>
    );

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="dentist-services-page">
            <Sidebar role="dentist" active="services" />

            <main className="dentist-services-main">

                <div className="d-flex justify-content-between align-items-center gap-3 mb-4 services-page-header">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            type="button"
                            className="mobile-sidebar-toggle"
                            onClick={() => {
                                document
                                    .getElementById("sidebar")
                                    ?.classList.add("show");
                            }}
                            aria-label="Open navigation menu"
                        >
                            <i className="bi bi-list" />
                        </button>

                        <div>
                            <h2 className="fw-bold mb-1 service-purple">
                                Dental Services
                            </h2>
                            <p className="mb-0 text-muted">
                                Manage the services offered by your clinic
                            </p>
                        </div>
                    </div>

                    <div className="text-end dentist-profile-label">
                        <div className="fw-semibold service-purple">
                            Dr. Jhulance Fernandez
                        </div>
                        <small className="text-muted">Dentist</small>
                    </div>
                </div>

                {message && (
                    <div
                        className={`alert alert-${messageType} d-flex justify-content-between align-items-center`}
                        role="alert"
                    >
                        <span>{message}</span>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={clearMessage}
                            aria-label="Close message"
                        />
                    </div>
                )}

                <section className="card border-0 shadow-sm mb-4 services-toolbar">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center gap-3 services-toolbar-content">
                            <div>
                                <h5 className="fw-bold mb-1 service-purple">
                                    Available Services
                                </h5>
                                <p className="mb-0 text-muted">
                                    Add, edit, or delete dental services.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="btn add-service-button"
                                onClick={openAddModal}
                            >
                                <i className="bi bi-plus-lg me-2" />
                                Add Service
                            </button>
                        </div>
                    </div>
                </section>

                {loadingServices && services.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="spinner-border service-purple" />
                        <p className="mt-3 text-muted">
                            Loading services from TiDB...
                        </p>
                    </div>
                ) : services.length === 0 ? (
                    <div className="card border-0 shadow-sm text-center empty-services">
                        <div className="card-body py-5">
                            <i className="bi bi-tooth empty-services-icon" />
                            <h5 className="mt-3 fw-bold service-purple">
                                No services available
                            </h5>
                            <p className="text-muted">
                                Add your first dental service.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4 services-grid">
                        {services.map((service) => {
                            const image = getServiceImage(service.name);

                            return (
                                <div
                                    className="col-12 col-sm-6 col-xl-4"
                                    key={service.id}
                                >
                                    <article className="card border-0 shadow-sm h-100 service-card">
                                        <div className="card-body p-3 p-md-4">
                                            <div className="d-flex justify-content-end mb-2">
                                                <span className="badge service-id-badge">
                                                    Service ID: {service.id}
                                                </span>
                                            </div>

                                            <div className="service-image-wrapper">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={service.name}
                                                        loading="lazy"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display = "none";
                                                            event.currentTarget.parentElement.classList.add("image-unavailable");
                                                        }}
                                                    />
                                                ) : null}

                                                <i className="bi bi-tooth service-image-fallback" />
                                            </div>

                                            <h5 className="fw-bold mb-2 service-name">
                                                {service.name}
                                            </h5>

                                            <h6 className="fw-bold mb-3 service-price">
                                                {formatPrice(service.price)}
                                            </h6>

                                            <p className="text-muted mb-4 service-description">
                                                {service.description ||
                                                    "No description available."}
                                            </p>

                                            <div className="d-flex gap-2 service-actions">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm flex-fill edit-service-button"
                                                    onClick={() => openEditModal(service)}
                                                >
                                                    <i className="bi bi-pencil me-1" />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-sm flex-fill delete-service-button"
                                                    onClick={() => openDeleteModal(service)}
                                                >
                                                    <i className="bi bi-trash me-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            );
                        })}
                    </div>
                )}

                {loadingServices && services.length > 0 && (
                    <p className="text-muted small mt-3">
                        Refreshing services...
                    </p>
                )}
            </main>

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="services-modal-backdrop">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content services-modal">
                            {renderServiceForm(handleAddService, false)}
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="services-modal-backdrop">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content services-modal">
                            {renderServiceForm(handleEditService, true)}
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && serviceToDelete && (
                <div className="services-modal-backdrop">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content services-modal">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold text-danger">
                                    <i className="bi bi-exclamation-triangle me-2" />
                                    Delete Service
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeDeleteModal}
                                    disabled={saving}
                                    aria-label="Close"
                                />
                            </div>

                            <div className="modal-body px-4">
                                <p>
                                    Are you sure you want to delete this service?
                                </p>

                                <div className="p-3 rounded delete-service-summary">
                                    <strong className="service-purple">
                                        {serviceToDelete.name}
                                    </strong>

                                    <div className="text-muted">
                                        Price: {formatPrice(serviceToDelete.price)}
                                    </div>

                                    <div className="text-muted">
                                        Service ID: {serviceToDelete.id}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={closeDeleteModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeleteService}
                                    disabled={saving}
                                >
                                    {saving ? "Deleting..." : "Delete"}
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
                }

                .service-purple {
                    color: #80609e;
                }

                .services-toolbar,
                .service-card,
                .empty-services {
                    border-radius: 16px;
                }

                .add-service-button,
                .service-primary-button {
                    background: #9b7bb8;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    padding: 10px 18px;
                }

                .add-service-button:hover,
                .service-primary-button:hover {
                    background: #80609e;
                    color: white;
                }

                .service-id-badge {
                    background: #f3efff;
                    color: #80609e;
                    padding: 7px 10px;
                }

                .service-image-wrapper {
                    position: relative;
                    width: 100%;
                    height: 190px;
                    padding: 6px;
                    margin-bottom: 18px;
                    overflow: hidden;
                    border-radius: 13px;
                    background: #f3efff;
                }

                .service-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
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

                .service-image-wrapper.image-unavailable .service-image-fallback,
                .service-image-wrapper:not(:has(img)) .service-image-fallback {
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow-y: auto;
                    padding: 16px;
                    background: rgba(0, 0, 0, .5);
                }

                .services-modal-backdrop .modal-dialog {
                    width: 100%;
                    max-width: 500px;
                    margin: auto;
                }

                .services-modal {
                    border: none;
                    border-radius: 16px;
                    overflow: hidden;
                    background: white;
                }

                .services-modal .form-control {
                    width: 100%;
                    box-sizing: border-box;
                }

                .service-id-alert,
                .delete-service-summary {
                    background: #f3efff;
                    color: #80609e;
                    border: none;
                    overflow-wrap: anywhere;
                }

                .mobile-sidebar-toggle {
                    display: none;
                    width: 42px;
                    height: 42px;
                    align-items: center;
                    justify-content: center;
                    border: 0;
                    border-radius: 10px;
                    background: #9b7bb8;
                    color: white;
                    font-size: 25px;
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

                @media (max-width: 575px) {
                    .dentist-services-main {
                        padding: 14px;
                    }

                    .services-page-header {
                        align-items: flex-start !important;
                    }

                    .services-page-header h2 {
                        font-size: 21px;
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
                    }

                    .service-description {
                        min-height: 0;
                    }
                }
            `}</style>
        </div>
    );
}
