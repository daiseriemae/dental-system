
import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar.jsx";

const BASE_URL = "https://dental-system-rzqb.onrender.com";
const API_URL = `${BASE_URL}/api/patient_appoint`;
const PATIENT_API = `${BASE_URL}/api/patients`;
const SERVICES_API = `${BASE_URL}/api/services`;

// SERVICE HELPERS
const getServiceId = (item) =>
    item?.id ??
    item?._id ??
    item?.serviceId ??
    item?.service_id;

const getServiceName = (item) =>
    item?.service_name ??
    item?.serviceName ??
    item?.service ??
    item?.name ??
    item?.title ??
    item?.details ??
    "";

const getServicePrice = (item) =>
    item?.price ??
    item?.cost ??
    item?.servicePrice ??
    0;

const getServiceValue = (item) =>
    String(getServiceId(item) ?? getServiceName(item));

const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

export default function PatientAppointment() {
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);

    // PATIENT INFORMATION
    const [patientId, setPatientId] = useState("");
    const [patientName, setPatientName] = useState("");
    const [loadingPatient, setLoadingPatient] = useState(true);

    // APPOINTMENT FORM
    const [serviceId, setServiceId] = useState("");
    const [dentist, setDentist] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");

    // LOADING AND MESSAGES
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [loadingServices, setLoadingServices] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);

    const selectedService =
        services.find(
            item => getServiceValue(item) === String(serviceId)
        ) || null;

    // READ SERVER RESPONSE
    async function readResponse(response) {
        const text = await response.text();

        if (!text) return {};

        try {
            return JSON.parse(text);
        } catch {
            return {
                message: text
            };
        }
    }

    // SHOW MESSAGE
    function showMessage(text, type = "success") {
        setMessage(text);
        setMessageType(type);
    }

    // LOAD PATIENT
    const loadPatient = useCallback(async () => {
        setLoadingPatient(true);

        try {
            const email = localStorage.getItem("userEmail");

            if (!email) {
                throw new Error(
                    "Login email not found. Please log in again."
                );
            }

            const response = await fetch(
                `${PATIENT_API}/by-email/${encodeURIComponent(email)}`
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Patient record not found. Please register first."
                );
            }

            const patient =
                data.patient ||
                data.data ||
                data;

            const actualPatientId =
                patient.patient_id ??
                patient.patientCode ??
                patient.patientId;

            const fullName =
                patient.name ||
                `${patient.first_name || patient.firstName || ""} ${
                    patient.last_name || patient.lastName || ""
                }`.trim();

            if (!actualPatientId) {
                throw new Error(
                    "Patient ID is missing from your patient record."
                );
            }

            if (!fullName) {
                throw new Error(
                    "Patient name is missing from your patient record."
                );
            }

            setPatientId(String(actualPatientId));
            setPatientName(fullName);

            console.log("Patient loaded:", patient);

        } catch (error) {
            console.error("Patient loading error:", error);

            setPatientId("");
            setPatientName("");

            showMessage(
                error.message || "Unable to load patient information.",
                "error"
            );

        } finally {
            setLoadingPatient(false);
        }
    }, []);

    // LOAD SERVICES
    const loadServices = useCallback(async () => {
        setLoadingServices(true);

        try {
            const response = await fetch(SERVICES_API);
            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load dental services."
                );
            }

            let loadedServices = [];

            if (Array.isArray(data)) {
                loadedServices = data;
            } else if (Array.isArray(data.services)) {
                loadedServices = data.services;
            } else if (Array.isArray(data.data)) {
                loadedServices = data.data;
            } else if (Array.isArray(data.results)) {
                loadedServices = data.results;
            }

            loadedServices = loadedServices.filter(item =>
                String(getServiceName(item)).trim() !== ""
            );

            setServices(loadedServices);

            console.log("Services loaded:", loadedServices);

            // PRESELECT SERVICE FROM URL
            const params = new URLSearchParams(
                window.location.search
            );

            const requestedId = params.get("serviceId");

            const requestedName =
                params.get("service") ||
                params.get("serviceName") ||
                params.get("selectedService");

            if (requestedId || requestedName) {
                const matched = loadedServices.find(item => {
                    const idMatches =
                        requestedId &&
                        String(getServiceId(item)) === String(requestedId);

                    const nameMatches =
                        requestedName &&
                        getServiceName(item).toLowerCase().trim() ===
                        requestedName.toLowerCase().trim();

                    return Boolean(idMatches || nameMatches);
                });

                if (matched) {
                    setServiceId(getServiceValue(matched));
                } else {
                    showMessage(
                        "The requested dental service was not found. Please select a service.",
                        "error"
                    );
                }
            }

        } catch (error) {
            console.error("Services loading error:", error);

            setServices([]);

            showMessage(
                error.message || "Unable to load dental services.",
                "error"
            );

        } finally {
            setLoadingServices(false);
        }
    }, []);

    // LOAD APPOINTMENTS
    const loadAppointments = useCallback(async (currentPatientId) => {
        if (!currentPatientId) {
            setAppointments([]);
            return;
        }

        setLoadingAppointments(true);

        try {
            const response = await fetch(API_URL);
            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load appointments."
                );
            }

            const loadedAppointments = Array.isArray(data)
                ? data
                : data.appointments ||
                  data.data ||
                  data.results ||
                  [];

            if (!Array.isArray(loadedAppointments)) {
                throw new Error(
                    "Invalid appointment data received from server."
                );
            }

            const filteredAppointments = loadedAppointments.filter(item => {
                const id =
                    item.patientId ??
                    item.patient_id ??
                    item.patientCode;

                return String(id ?? "") === String(currentPatientId);
            });

            setAppointments(filteredAppointments);

            console.log(
                "Patient appointments:",
                filteredAppointments
            );

        } catch (error) {
            console.error("Appointments loading error:", error);

            showMessage(
                error.message || "Unable to load appointments.",
                "error"
            );

        } finally {
            setLoadingAppointments(false);
        }
    }, []);

    // INITIAL LOADING
    useEffect(() => {
        loadPatient();
        loadServices();
    }, [loadPatient, loadServices]);

    // LOAD PATIENT APPOINTMENTS AFTER PATIENT IS FOUND
    useEffect(() => {
        if (patientId) {
            loadAppointments(patientId);
        } else {
            setAppointments([]);
        }
    }, [patientId, loadAppointments]);

    // SELECT DENTAL SERVICE
    function handleServiceChange(event) {
        const newId = event.target.value;

        setServiceId(newId);

        if (!newId) {
            setMessage("");
            return;
        }

        const chosen = services.find(
            item => getServiceValue(item) === String(newId)
        );

        if (!chosen) {
            showMessage(
                "Selected dental service could not be found.",
                "error"
            );
            return;
        }

        console.log("Selected service:", {
            id: getServiceId(chosen),
            name: getServiceName(chosen),
            price: getServicePrice(chosen)
        });

        setMessage("");
    }

    // SUBMIT APPOINTMENT
    async function formSubmit(event) {
        event.preventDefault();

        if (submitting) return;

        setMessage("");

        if (!patientId || !patientName) {
            showMessage(
                "Patient information is not loaded. Please log in again.",
                "error"
            );
            return;
        }

        if (!selectedService) {
            showMessage(
                "Please select a dental service.",
                "error"
            );
            return;
        }

        const serviceName = getServiceName(selectedService);
        const selectedServiceId = getServiceId(selectedService);

        if (!serviceName) {
            showMessage(
                "The selected dental service has no valid name.",
                "error"
            );
            return;
        }

        if (!dentist || !date || !time) {
            showMessage(
                "Please complete all required appointment details.",
                "error"
            );
            return;
        }

        const today = new Date();
        const localToday = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0")
        ].join("-");

        if (date < localToday) {
            showMessage(
                "Please select today or a future appointment date.",
                "error"
            );
            return;
        }

        const appointmentData = {
            patientId: patientId,
            patientName: patientName,
            service: serviceName,
            serviceId: selectedServiceId ?? null,
            price: Number(getServicePrice(selectedService)) || 0,
            dentist: dentist,
            date: date,
            time: time,
            notes: notes.trim()
        };

        setSubmitting(true);

        try {
            console.log(
                "Submitting appointment:",
                appointmentData
            );

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(appointmentData)
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    `Appointment submission failed (${response.status}).`
                );
            }

            showMessage(
                data.message ||
                "Appointment request submitted successfully!",
                "success"
            );

            setServiceId("");
            setDentist("");
            setDate("");
            setTime("");
            setNotes("");

            await loadAppointments(patientId);

        } catch (error) {
            console.error("Appointment submission error:", error);

            showMessage(
                error.message ||
                "Unable to submit appointment. Please check your server.",
                "error"
            );

        } finally {
            setSubmitting(false);
        }
    }

    // CANCEL APPOINTMENT
    async function cancelAppointment(appointment) {
        const id = appointment.id ?? appointment._id;

        const status = String(
            appointment.status || "Pending"
        ).toLowerCase();

        if (!id) {
            showMessage(
                "Appointment ID not found.",
                "error"
            );
            return;
        }

        if (status === "cancelled" || status === "completed") {
            showMessage(
                "This appointment can no longer be cancelled.",
                "error"
            );
            return;
        }

        if (!window.confirm(
            "Are you sure you want to cancel this appointment?"
        )) {
            return;
        }

        setCancellingId(String(id));
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/${encodeURIComponent(id)}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        status: "Cancelled"
                    })
                }
            );

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to cancel appointment."
                );
            }

            await loadAppointments(patientId);

            showMessage(
                data.message || "Appointment cancelled successfully!",
                "success"
            );

        } catch (error) {
            console.error("Cancellation error:", error);

            showMessage(
                error.message || "Unable to cancel appointment.",
                "error"
            );

        } finally {
            setCancellingId(null);
        }
    }

    // MINIMUM APPOINTMENT DATE
    const today = new Date();

    const minDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    return (
        <>
            <style>{`
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    background: #f7f4fb;
                    color: #4f3d63;
                    margin: 0;
                }

                .appointment-main {
                    margin-left: 250px;
                    min-height: 100vh;
                    color: #4f3d63;
                }

                .appointment-topbar {
                    height: 75px;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    padding: 0 35px;
                    border-bottom: 1px solid #e6dff0;
                }

                .appointment-topbar h1 {
                    color: #4f3d63;
                    font-size: 24px;
                    margin: 0;
                }

                .appointment-content {
                    padding: 30px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .appointment-intro {
                    margin-bottom: 25px;
                }

                .appointment-intro h2 {
                    color: #4f3d63;
                    font-size: 28px;
                    margin: 0 0 7px;
                }

                .appointment-intro p {
                    color: #6b5b7d;
                }

                .appointment-form-card,
                .appointment-table-card {
                    background: #fff;
                    padding: 30px;
                    border-radius: 18px;
                    box-shadow: 0 5px 20px rgba(79,61,99,.08);
                    margin-bottom: 30px;
                }

                .appointment-form-group {
                    margin-bottom: 20px;
                }

                .appointment-form-group label {
                    display: block;
                    color: #4f3d63;
                    margin-bottom: 8px;
                    font-weight: bold;
                }

                .appointment-form-group input,
                .appointment-form-group select,
                .appointment-form-group textarea {
                    display: block;
                    width: 100%;
                    padding: 13px 14px;
                    border: 1px solid #d8ccec;
                    border-radius: 10px;
                    font-size: 15px;
                    color: #352344;
                    background: #fff;
                    outline: none;
                }

                .appointment-form-group input:focus,
                .appointment-form-group select:focus,
                .appointment-form-group textarea:focus {
                    border-color: #9b7bb8;
                    box-shadow: 0 0 0 3px #eee7f5;
                }

                .appointment-form-group input[readonly] {
                    background: #f8f5fc;
                    color: #4f3d63;
                }

                .appointment-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .appointment-form-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .appointment-submit-btn {
                    width: 100%;
                    border: none;
                    background: #9b7bb8;
                    color: #fff;
                    padding: 14px 22px;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                }

                .appointment-submit-btn:hover {
                    background: #80609e;
                }

                .appointment-submit-btn:disabled {
                    opacity: .65;
                    cursor: not-allowed;
                }

                .appointment-message {
                    margin-bottom: 20px;
                    padding: 15px;
                    border-radius: 10px;
                    font-weight: 500;
                    overflow-wrap: anywhere;
                }

                .appointment-message.success {
                    background: #e7f6ec;
                    color: #205c35;
                }

                .appointment-message.error {
                    background: #fde8e8;
                    color: #a61b1b;
                }

                .appointment-info-box {
                    margin-top: 20px;
                    background: #f3efff;
                    border-left: 5px solid #9b7bb8;
                    padding: 15px;
                    border-radius: 8px;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #4f3d63;
                }

                .appointment-table-card {
                    overflow-x: auto;
                }

                .appointment-table-card h2 {
                    color: #4f3d63;
                    margin: 0 0 20px;
                    font-size: 22px;
                }

                .appointment-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #fff;
                    color: #4f3d63;
                }

                .appointment-table th,
                .appointment-table td {
                    padding: 13px;
                    text-align: left;
                    border-bottom: 1px solid #e4dced;
                    color: #4f3d63 !important;
                    font-size: 14px;
                    background: #fff;
                    vertical-align: middle;
                }

                .appointment-table th {
                    background: #f0e8fc !important;
                    color: #39254f !important;
                    font-weight: bold;
                    white-space: nowrap;
                }

                .appointment-table tbody tr:hover td {
                    background: #faf7ff;
                }

                .appointment-status {
                    display: inline-block;
                    background: #fff0c2;
                    color: #654d00 !important;
                    padding: 6px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    white-space: nowrap;
                }

                .appointment-status.status-cancelled {
                    background: #fde2e2;
                    color: #a61b1b !important;
                }

                .appointment-status.status-completed {
                    background: #d9f4e2;
                    color: #176638 !important;
                }

                .appointment-cancel-btn {
                    background: #dc3545;
                    color: #fff;
                    border: none;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: bold;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .appointment-cancel-btn:hover {
                    background: #b02a37;
                }

                .appointment-cancel-btn:disabled {
                    opacity: .6;
                    cursor: not-allowed;
                }

                .appointment-empty {
                    text-align: center !important;
                    padding: 25px !important;
                    color: #6b5b7d !important;
                }

                .appointment-mobile-header {
                    display: none;
                }

                @media (max-width: 768px) {
                    .appointment-main {
                        margin-left: 0;
                    }

                    .appointment-mobile-header {
                        display: flex;
                        height: 65px;
                        background: #9b7bb8;
                        color: #fff;
                        align-items: center;
                        padding: 0 18px;
                        gap: 15px;
                    }

                    .appointment-menu-btn {
                        border: none;
                        background: transparent;
                        color: #fff;
                        font-size: 25px;
                        cursor: pointer;
                    }

                    .appointment-topbar {
                        display: none;
                    }

                    .appointment-content {
                        padding: 20px 14px;
                    }

                    .appointment-row {
                        grid-template-columns: 1fr;
                        gap: 0;
                    }

                    .appointment-form-card,
                    .appointment-table-card {
                        padding: 20px;
                    }

                    .appointment-table {
                        min-width: 900px;
                    }
                }
            `}</style>

            <Sidebar role="patient" active="appointments" />

            <div className="appointment-main">

                <div className="appointment-mobile-header">
                    <button
                        className="appointment-menu-btn"
                        type="button"
                        aria-label="Toggle navigation"
                        onClick={() => {
                            const sidebar =
                                document.querySelector(".sidebar");

                            if (sidebar) {
                                sidebar.classList.toggle("open");
                                sidebar.classList.toggle("show");
                            }
                        }}
                    >
                        ☰
                    </button>

                    <strong>DentalCare</strong>
                </div>

                <header className="appointment-topbar">
                    <h1>Book an Appointment</h1>
                </header>

                <main className="appointment-content">

                    <div className="appointment-intro">
                        <h2>Book Your Appointment</h2>
                        <p>
                            Choose your preferred dental service,
                            dentist, date, and time.
                        </p>
                    </div>

                    {message && (
                        <div
                            className={`appointment-message ${messageType}`}
                            role="alert"
                        >
                            {message}
                        </div>
                    )}

                    <section className="appointment-form-card">

                        <form onSubmit={formSubmit}>

                            <div className="appointment-form-group">
                                <label htmlFor="patientId">
                                    Patient ID
                                </label>

                                <input
                                    type="text"
                                    id="patientId"
                                    value={
                                        loadingPatient
                                            ? "Loading patient..."
                                            : patientId
                                    }
                                    readOnly
                                />
                            </div>

                            <div className="appointment-form-group">
                                <label htmlFor="service">
                                    Dental Service
                                </label>

                                <select
                                    id="service"
                                    value={serviceId}
                                    onChange={handleServiceChange}
                                    required
                                    disabled={
                                        loadingServices ||
                                        services.length === 0
                                    }
                                >
                                    <option value="">
                                        {loadingServices
                                            ? "Loading services..."
                                            : services.length
                                                ? "Select a service"
                                                : "No services available"}
                                    </option>

                                    {services.map((item, index) => (
                                        <option
                                            key={getServiceId(item) ?? index}
                                            value={getServiceValue(item)}
                                        >
                                            {getServiceName(item)}
                                            {" — ₱"}
                                            {formatPrice(
                                                getServicePrice(item)
                                            )}
                                        </option>
                                    ))}
                                </select>

                                {selectedService && (
                                    <div className="appointment-info-box">
                                        <strong>Selected Service:</strong>{" "}
                                        {getServiceName(selectedService)}
                                        <br />

                                        <strong>Price:</strong>{" "}
                                        ₱{formatPrice(
                                            getServicePrice(selectedService)
                                        )}

                                        {(selectedService.description ||
                                            selectedService.details) && (
                                            <>
                                                <br />
                                                <strong>Description:</strong>{" "}
                                                {selectedService.description ||
                                                    selectedService.details}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="appointment-form-group">
                                <label htmlFor="dentist">
                                    Preferred Dentist
                                </label>

                                <select
                                    id="dentist"
                                    value={dentist}
                                    onChange={e =>
                                        setDentist(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">
                                        Select a dentist
                                    </option>

                                    <option value="Dr. Jhulance Fernandez">
                                        Dr. Jhulance Fernandez
                                    </option>

                                    <option value="Dr. John Cruz">
                                        Dr. John Cruz
                                    </option>

                                    <option value="Dr. Angela Reyes">
                                        Dr. Angela Reyes
                                    </option>
                                </select>
                            </div>

                            <div className="appointment-row">

                                <div className="appointment-form-group">
                                    <label htmlFor="date">
                                        Preferred Date
                                    </label>

                                    <input
                                        type="date"
                                        id="date"
                                        value={date}
                                        min={minDate}
                                        onChange={e =>
                                            setDate(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="appointment-form-group">
                                    <label htmlFor="time">
                                        Preferred Time
                                    </label>

                                    <select
                                        id="time"
                                        value={time}
                                        onChange={e =>
                                            setTime(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select time
                                        </option>

                                        <option value="9:00 AM">9:00 AM</option>
                                        <option value="10:00 AM">10:00 AM</option>
                                        <option value="11:00 AM">11:00 AM</option>
                                        <option value="1:00 PM">1:00 PM</option>
                                        <option value="2:00 PM">2:00 PM</option>
                                        <option value="3:00 PM">3:00 PM</option>
                                        <option value="4:00 PM">4:00 PM</option>
                                    </select>
                                </div>

                            </div>

                            <div className="appointment-form-group">
                                <label htmlFor="notes">
                                    Additional Notes
                                </label>

                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={e =>
                                        setNotes(e.target.value)
                                    }
                                    placeholder="Tell us if you have any concerns or additional information..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="appointment-submit-btn"
                                disabled={
                                    submitting ||
                                    loadingServices ||
                                    loadingPatient ||
                                    !patientId ||
                                    !selectedService
                                }
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "📅 Request Appointment"}
                            </button>

                        </form>

                        <div className="appointment-info-box">
                            <strong>Appointment Reminder</strong>
                            <br />
                            Please arrive at least 10 minutes before
                            your scheduled appointment.
                            <br />
                            Bring your patient ID when visiting
                            the clinic.
                        </div>

                    </section>

                    {/* MY APPOINTMENTS */}

                    <section className="appointment-table-card">

                        <h2>My Appointments</h2>

                        <table className="appointment-table">

                            <thead>
                                <tr>
                                    <th>Patient ID</th>
                                    <th>Service</th>
                                    <th>Price</th>
                                    <th>Dentist</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Notes</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {loadingAppointments ? (
                                    <tr>
                                        <td colSpan="9" className="appointment-empty">
                                            Loading appointments...
                                        </td>
                                    </tr>
                                ) : myAppointmentsPlaceholder(appointments).length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="appointment-empty">
                                            {loadingPatient
                                                ? "Loading patient information..."
                                                : "No appointments found."}
                                        </td>
                                    </tr>
                                ) : (
                                    myAppointmentsPlaceholder(appointments).map(
                                        (appointment, index) => {
                                            const id =
                                                appointment.id ??
                                                appointment._id;

                                            const status =
                                                appointment.status ||
                                                "Pending";

                                            const normalizedStatus =
                                                status.toLowerCase();

                                            return (
                                                <tr key={id ?? index}>
                                                    <td>
                                                        {appointment.patientId ||
                                                            appointment.patient_id ||
                                                            "—"}
                                                    </td>

                                                    <td>
                                                        {appointment.service || "—"}
                                                    </td>

                                                    <td>
                                                        {appointment.price == null
                                                            ? "—"
                                                            : `₱${formatPrice(
                                                                appointment.price
                                                            )}`}
                                                    </td>

                                                    <td>
                                                        {appointment.dentist || "—"}
                                                    </td>

                                                    <td>
                                                        {appointment.date ||
                                                            appointment.appointment_date ||
                                                            "—"}
                                                    </td>

                                                    <td>
                                                        {appointment.time ||
                                                            appointment.appointment_time ||
                                                            "—"}
                                                    </td>

                                                    <td>
                                                        {appointment.notes || "—"}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`appointment-status ${
                                                                normalizedStatus === "cancelled"
                                                                    ? "status-cancelled"
                                                                    : normalizedStatus === "completed"
                                                                        ? "status-completed"
                                                                        : ""
                                                            }`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {normalizedStatus !== "cancelled" &&
                                                        normalizedStatus !== "completed" ? (
                                                            <button
                                                                type="button"
                                                                className="appointment-cancel-btn"
                                                                disabled={
                                                                    cancellingId === String(id)
                                                                }
                                                                onClick={() =>
                                                                    cancelAppointment(appointment)
                                                                }
                                                            >
                                                                {cancellingId === String(id)
                                                                    ? "Cancelling..."
                                                                    : "Cancel"}
                                                            </button>
                                                        ) : "—"}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                )}

                            </tbody>

                        </table>

                    </section>

                </main>
            </div>
        </>
    );
}

// FILTER APPOINTMENTS FOR CURRENT PATIENT
function myAppointmentsPlaceholder(appointments) {
    const currentPatientId = localStorage.getItem("patientId");

    // The component's patient ID is loaded from the API.
    // This fallback is replaced by the filtering inside the component.
    if (!currentPatientId) {
        return appointments;
    }

    return appointments.filter(item =>
        String(item.patientId ?? item.patient_id ?? "") ===
        String(currentPatientId)
    );
}
