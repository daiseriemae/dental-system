
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";

const API_URL = `${import.meta.env.VITE_API_URL}/api/services`;

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

    /* =====================================================
       SERVICE IMAGE
    ===================================================== */

    const getServiceImage = (name) => {
        const service = (name || "").toLowerCase();

        if (service.includes("cleaning")) {
            return "public/dentist-cleaning-teeth.jpeg";
        }

        if (service.includes("filling")) {
            return "public/tooth-filling.webp";
        }

        if (service.includes("whitening")) {
            return "public/teeth-whitening.webp";
        }

        if (service.includes("extraction")) {
            return "public/extraction.jpg";
        }

        if (
            service.includes("check-up") ||
            service.includes("checkup") ||
            service.includes("check up")
        ) {
            return "public/what-to-expect-dental-checkup-facts.jpg";
        }

        if (service.includes("braces")) {
            return "public/brace.jfif";
        }

        return "public/dentist-cleaning-teeth.jpeg";
    };

    /* =====================================================
       LOAD SERVICES
    ===================================================== */

    const fetchServices = async () => {
        try {
            setLoading(true);

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to load services.");
            }

            const data = await response.json();

            console.log("================================");
            console.log("SERVICES FROM BACKEND:");
            console.log(data);
            console.log("================================");

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

            console.log("CLEAN SERVICES:", cleanServices);

            setServices(cleanServices);
        } catch (error) {
            console.error("LOAD SERVICES ERROR:", error);

            setMessage(error.message || "Failed to load services.");
            setMessageType("danger");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    /* =====================================================
       MESSAGE
    ===================================================== */

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage("");
        }, 3000);
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const resetForm = () => {
        setServiceName("");
        setServicePrice("");
        setServiceDescription("");
    };

    /* =====================================================
       ADD MODAL
    ===================================================== */

    const openAddModal = () => {
        resetForm();
        setMessage("");
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    /* =====================================================
       ADD SERVICE
    ===================================================== */

    const handleAddService = async (event) => {
        event.preventDefault();

        if (!serviceName.trim()) {
            showMessage("Please enter a service name.", "danger");
            return;
        }

        if (
            servicePrice === "" ||
            Number.isNaN(Number(servicePrice))
        ) {
            showMessage("Please enter a valid price.", "danger");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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

            if (!data.service) {
                throw new Error("Backend did not return the new service.");
            }

            const newService = {
                ...data.service,
                id: String(data.service.id),
            };

            setServices((currentServices) => [
                ...currentServices,
                newService,
            ]);

            closeAddModal();
            showMessage("Service added successfully.");
        } catch (error) {
            console.error("ADD SERVICE ERROR:", error);

            showMessage(
                error.message || "Failed to add service.",
                "danger"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       EDIT MODAL
    ===================================================== */

    const openEditModal = (service) => {
        console.log("================================");
        console.log("EDIT BUTTON CLICKED");
        console.log("FULL SERVICE:", service);
        console.log("SERVICE ID:", service?.id);
        console.log("================================");

        if (
            !service ||
            service.id === undefined ||
            service.id === null ||
            service.id === ""
        ) {
            showMessage(
                "Cannot edit service: Service ID is missing.",
                "danger"
            );
            return;
        }

        const selectedService = {
            ...service,
            id: String(service.id),
        };

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

    /* =====================================================
       UPDATE SERVICE
    ===================================================== */

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

        if (
            servicePrice === "" ||
            Number.isNaN(Number(servicePrice))
        ) {
            showMessage("Please enter a valid price.", "danger");
            return;
        }

        try {
            setLoading(true);

            const serviceId = String(editingService.id);
            const editURL = `${API_URL}/${serviceId}`;

            console.log("================================");
            console.log("EDIT SERVICE");
            console.log("SERVICE ID:", serviceId);
            console.log("EDIT URL:", editURL);
            console.log("================================");

            const response = await fetch(editURL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: serviceName.trim(),
                    price: Number(servicePrice),
                    description: serviceDescription.trim(),
                }),
            });

            const data = await response.json();

            console.log("EDIT SERVICE RESPONSE:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update service."
                );
            }

            if (!data.service) {
                throw new Error(
                    "Backend did not return the updated service."
                );
            }

            const updatedService = {
                ...data.service,
                id: String(data.service.id),
            };

            setServices((currentServices) =>
                currentServices.map((service) =>
                    String(service.id) === serviceId
                        ? updatedService
                        : service
                )
            );

            closeEditModal();
            showMessage("Service updated successfully.");
        } catch (error) {
            console.error("EDIT SERVICE ERROR:", error);

            showMessage(
                error.message || "Failed to update service.",
                "danger"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       DELETE MODAL
    ===================================================== */

    const openDeleteModal = (service) => {
        console.log("================================");
        console.log("DELETE BUTTON CLICKED");
        console.log("FULL SERVICE:", service);
        console.log("SERVICE ID:", service?.id);
        console.log("================================");

        if (
            !service ||
            service.id === undefined ||
            service.id === null ||
            service.id === ""
        ) {
            console.error("ERROR: SERVICE HAS NO ID", service);

            showMessage(
                "Cannot delete service: Service ID is missing.",
                "danger"
            );
            return;
        }

        const selectedService = {
            ...service,
            id: String(service.id),
        };

        setServiceToDelete(selectedService);
        setMessage("");
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setServiceToDelete(null);
    };

    /* =====================================================
       DELETE SERVICE
    ===================================================== */

    const handleDeleteService = async () => {
        console.log("================================");
        console.log("DELETE CONFIRMATION CLICKED");
        console.log("SERVICE TO DELETE:", serviceToDelete);
        console.log("SERVICE ID:", serviceToDelete?.id);
        console.log("================================");

        if (
            !serviceToDelete ||
            serviceToDelete.id === undefined ||
            serviceToDelete.id === null ||
            serviceToDelete.id === ""
        ) {
            console.error("DELETE FAILED: SERVICE ID IS MISSING");

            showMessage("Service ID is missing.", "danger");
            return;
        }

        const serviceId = String(serviceToDelete.id);

        try {
            setLoading(true);

            const deleteURL = `${API_URL}/${serviceId}`;

            console.log("================================");
            console.log("DELETE SERVICE REQUEST");
            console.log("SERVICE NAME:", serviceToDelete.name);
            console.log("SERVICE ID:", serviceId);
            console.log("DELETE URL:", deleteURL);
            console.log("================================");

            const response = await fetch(deleteURL, {
                method: "DELETE",
            });

            const data = await response.json();

            console.log("DELETE RESPONSE:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete service."
                );
            }

            setServices((currentServices) =>
                currentServices.filter(
                    (service) => String(service.id) !== serviceId
                )
            );

            closeDeleteModal();
            showMessage("Service deleted successfully.");
        } catch (error) {
            console.error("DELETE SERVICE ERROR:", error);

            showMessage(
                error.message || "Failed to delete service.",
                "danger"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    const formatPrice = (price) => {
        return `₱${Number(price || 0).toLocaleString()}`;
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f3efff",
            }}
        >
            <Sidebar role="dentist" active="services" />

            <div
                className="container-fluid"
                style={{
                    marginLeft: "260px",
                    width: "calc(100% - 260px)",
                    padding: "35px",
                }}
            >
                {/* HEADER */}

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2
                            className="fw-bold mb-1"
                            style={{ color: "#80609e" }}
                        >
                            Dental Services
                        </h2>

                        <p className="mb-0" style={{ color: "#777" }}>
                            Manage the services offered by your clinic
                        </p>
                    </div>

                    <div className="text-end">
                        <div
                            className="fw-semibold"
                            style={{ color: "#80609e" }}
                        >
                            Dr. Maria Santos
                        </div>

                        <small style={{ color: "#777" }}>
                            Dentist
                        </small>
                    </div>
                </div>

                {/* MESSAGE */}

                {message && (
                    <div
                        className={`alert alert-${messageType} d-flex justify-content-between align-items-center`}
                        role="alert"
                    >
                        <span>{message}</span>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setMessage("")}
                        ></button>
                    </div>
                )}

                {/* SERVICE HEADER */}

                <div
                    className="card border-0 shadow-sm mb-4"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5
                                    className="fw-bold mb-1"
                                    style={{ color: "#80609e" }}
                                >
                                    Available Services
                                </h5>

                                <p className="mb-0" style={{ color: "#777" }}>
                                    Add, edit, or delete dental services.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="btn"
                                onClick={openAddModal}
                                style={{
                                    backgroundColor: "#9b7bb8",
                                    color: "#ffffff",
                                    borderRadius: "10px",
                                    padding: "10px 18px",
                                    border: "none",
                                }}
                            >
                                <i className="bi bi-plus-lg me-2"></i>
                                Add Service
                            </button>
                        </div>
                    </div>
                </div>

                {/* SERVICES */}

                {loading && services.length === 0 ? (
                    <div className="text-center py-5">
                        <div
                            className="spinner-border"
                            style={{ color: "#9b7bb8" }}
                        ></div>

                        <p className="mt-3 text-muted">
                            Loading services...
                        </p>
                    </div>
                ) : services.length === 0 ? (
                    <div
                        className="card border-0 shadow-sm text-center"
                        style={{ borderRadius: "16px" }}
                    >
                        <div className="card-body py-5">
                            <i
                                className="bi bi-tooth"
                                style={{
                                    fontSize: "50px",
                                    color: "#9b7bb8",
                                }}
                            ></i>

                            <h5
                                className="mt-3 fw-bold"
                                style={{ color: "#80609e" }}
                            >
                                No services available
                            </h5>

                            <p className="text-muted">
                                Add your first dental service.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {services.map((service) => (
                            <div
                                className="col-md-6 col-xl-4"
                                key={`service-${service.id}`}
                            >
                                <div
                                    className="card border-0 shadow-sm h-100"
                                    style={{ borderRadius: "16px" }}
                                >
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            {/* FIXED SERVICE IMAGE */}

                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
                                                style={{
                                                    width: "75px",
                                                    height: "75px",
                                                    backgroundColor: "#e9def5",
                                                    color: "#80609e",
                                                    flexShrink: 0,
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
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            </div>

                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor: "#f3efff",
                                                    color: "#80609e",
                                                }}
                                            >
                                                ID: {service.id}
                                            </span>
                                        </div>

                                        <h5
                                            className="fw-bold mb-2"
                                            style={{ color: "#80609e" }}
                                        >
                                            {service.name}
                                        </h5>

                                        <h6
                                            className="fw-bold mb-3"
                                            style={{ color: "#9b7bb8" }}
                                        >
                                            {formatPrice(service.price)}
                                        </h6>

                                        <p
                                            className="text-muted mb-4"
                                            style={{ minHeight: "48px" }}
                                        >
                                            {service.description ||
                                                "No description available."}
                                        </p>

                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm flex-fill"
                                                onClick={() => openEditModal(service)}
                                                style={{
                                                    backgroundColor: "#e9def5",
                                                    color: "#80609e",
                                                    border: "none",
                                                    borderRadius: "8px",
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

                {/* ADD SERVICE MODAL */}

                {showAddModal && (
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div
                                className="modal-content border-0"
                                style={{ borderRadius: "16px" }}
                            >
                                <form onSubmit={handleAddService}>
                                    <div className="modal-header border-0">
                                        <h5
                                            className="modal-title fw-bold"
                                            style={{ color: "#80609e" }}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Add Service
                                        </h5>

                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={closeAddModal}
                                        ></button>
                                    </div>

                                    <div className="modal-body px-4">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Service Name
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                value={serviceName}
                                                onChange={(e) =>
                                                    setServiceName(e.target.value)
                                                }
                                                placeholder="Enter service name"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Price
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control"
                                                value={servicePrice}
                                                onChange={(e) =>
                                                    setServicePrice(e.target.value)
                                                }
                                                placeholder="Enter price"
                                                min="0"
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
                                                onChange={(e) =>
                                                    setServiceDescription(e.target.value)
                                                }
                                                placeholder="Enter service description"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="modal-footer border-0">
                                        <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={closeAddModal}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn"
                                            disabled={loading}
                                            style={{
                                                backgroundColor: "#9b7bb8",
                                                color: "#ffffff",
                                            }}
                                        >
                                            {loading ? "Saving..." : "Add Service"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT SERVICE MODAL */}

                {showEditModal && (
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div
                                className="modal-content border-0"
                                style={{ borderRadius: "16px" }}
                            >
                                <form onSubmit={handleEditService}>
                                    <div className="modal-header border-0">
                                        <h5
                                            className="modal-title fw-bold"
                                            style={{ color: "#80609e" }}
                                        >
                                            <i className="bi bi-pencil-square me-2"></i>
                                            Edit Service
                                        </h5>

                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={closeEditModal}
                                        ></button>
                                    </div>

                                    <div className="modal-body px-4">
                                        {editingService && (
                                            <div
                                                className="alert mb-3"
                                                style={{
                                                    backgroundColor: "#f3efff",
                                                    color: "#80609e",
                                                    border: "none",
                                                }}
                                            >
                                                Editing Service ID:{" "}
                                                <strong>{editingService.id}</strong>
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
                                                onChange={(e) =>
                                                    setServiceName(e.target.value)
                                                }
                                                placeholder="Enter service name"
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Price
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control"
                                                value={servicePrice}
                                                onChange={(e) =>
                                                    setServicePrice(e.target.value)
                                                }
                                                placeholder="Enter price"
                                                min="0"
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
                                                onChange={(e) =>
                                                    setServiceDescription(e.target.value)
                                                }
                                                placeholder="Enter service description"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="modal-footer border-0">
                                        <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={closeEditModal}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn"
                                            disabled={loading}
                                            style={{
                                                backgroundColor: "#9b7bb8",
                                                color: "#ffffff",
                                            }}
                                        >
                                            {loading ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* DELETE CONFIRMATION MODAL */}

                {showDeleteModal && serviceToDelete && (
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div
                                className="modal-content border-0"
                                style={{ borderRadius: "16px" }}
                            >
                                <div className="modal-header border-0">
                                    <h5
                                        className="modal-title fw-bold"
                                        style={{ color: "#842029" }}
                                    >
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        Delete Service
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeDeleteModal}
                                        disabled={loading}
                                    ></button>
                                </div>

                                <div className="modal-body px-4">
                                    <p className="mb-3">
                                        Are you sure you want to delete this service?
                                    </p>

                                    <div
                                        className="p-3 rounded"
                                        style={{ backgroundColor: "#f3efff" }}
                                    >
                                        <div
                                            className="fw-bold"
                                            style={{ color: "#80609e" }}
                                        >
                                            {serviceToDelete.name}
                                        </div>

                                        <div className="text-muted">
                                            Price: {formatPrice(serviceToDelete.price)}
                                        </div>

                                        <div className="text-muted">
                                            Service ID:{" "}
                                            <strong>{serviceToDelete.id}</strong>
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
                                        style={{
                                            backgroundColor: "#dc3545",
                                            color: "#ffffff",
                                        }}
                                    >
                                        {loading ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DentistServices;
