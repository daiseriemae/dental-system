import { useState, useEffect } from "react";
import Sidebar from "./Sidebar.jsx";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");
const API_URL = `${BASE_URL}/api/appointments`;

const getServiceId = (item) => item?.id ?? item?._id ?? item?.serviceId ?? item?.service_id;
const getServiceName = (item) => item?.name ?? item?.serviceName ?? item?.title ?? "";
const getServicePrice = (item) => item?.price ?? item?.cost ?? item?.servicePrice ?? 0;
const normalizeServiceName = (name) => String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const serviceNameGroups = [
    ["dentalcheckup", "checkup", "dentalexamination", "check-up"],
    ["teethcleaning", "dentalcleaning", "cleaning"],
    ["dentalfilling", "filling"],
    ["teethwhitening", "whitening"],
    ["toothextraction", "extraction"],
    ["bracesconsultation", "orthodonticconsultation"]
];
function sameServiceName(a, b) {
    const first = normalizeServiceName(a);
    const second = normalizeServiceName(b);
    if (first === second) return true;
    return serviceNameGroups.some(group => group.some(name => normalizeServiceName(name) === first) && group.some(name => normalizeServiceName(name) === second));
}

export default function PatientAppointment() {
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [patientId] = useState("P-00125");
    const [serviceId, setServiceId] = useState("");
    const [dentist, setDentist] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [cancellingId, setCancellingId] = useState(null);
    const [loadingServices, setLoadingServices] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const selectedService = services.find(item => String(getServiceId(item)) === String(serviceId)) || null;

    useEffect(() => {
        loadServices();
        loadAppointments();
    }, []);

    function showMessage(text, type = "success") {
        setMessage(text);
        setMessageType(type);
    }

    async function readResponse(response) {
        const text = await response.text();
        try { return text ? JSON.parse(text) : {}; }
        catch { return { message: text || "Unexpected server response." }; }
    }

    async function loadServices() {
        setLoadingServices(true);
        try {
            const response = await fetch(`${BASE_URL}/api/services`);
            const data = await readResponse(response);
            if (!response.ok) throw new Error(data.message || "Failed to load services.");
            const loadedServices = Array.isArray(data)
                ? data
                : Array.isArray(data.services)
                    ? data.services
                    : Array.isArray(data.data)
                        ? data.data
                        : [];
            setServices(loadedServices);

            // Preselect the service passed by PatientServices through the URL.
            const params = new URLSearchParams(window.location.search);
            const requestedService = params.get("service") || params.get("serviceName") || params.get("selectedService");
            const requestedServiceId = params.get("serviceId");
            if (requestedService || requestedServiceId) {
                const matchedService = loadedServices.find((item) => {
                    const idMatches = requestedServiceId && String(getServiceId(item)) === String(requestedServiceId);
                    const nameMatches = requestedService && sameServiceName(getServiceName(item), requestedService);
                    return Boolean(idMatches || nameMatches);
                });

                if (matchedService && getServiceId(matchedService) != null) {
                    setServiceId(String(getServiceId(matchedService)));
                    console.log("Service passed from Patient Services:", getServiceName(matchedService), "Price:", getServicePrice(matchedService));
                    fetch(`${BASE_URL}/api/logs/service-selection`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            serviceId: getServiceId(matchedService),
                            serviceName: getServiceName(matchedService),
                            price: getServicePrice(matchedService)
                        })
                    }).catch((error) => console.error("Service selection logging failed:", error));
                } else {
                    console.error("Selected service was not found. URL service:", requestedService, "Available backend services:", loadedServices.map(getServiceName));
                    showMessage(`You clicked "${requestedService || requestedServiceId}", but it does not match a service in Dentist Services. Check the backend service names.`, "error");
                }
            }
        } catch (error) {
            console.error("Load services failed:", error);
            showMessage("Unable to load dental services. Check that the backend is running.", "error");
        } finally {
            setLoadingServices(false);
        }
    }

    async function loadAppointments() {
        try {
            const response = await fetch(API_URL);
            const data = await readResponse(response);
            if (!response.ok) throw new Error(data.message || "Failed to load appointments.");
            setAppointments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Load appointments failed:", error);
            showMessage("Unable to load appointments. Please check your backend server.", "error");
        }
    }

    async function handleServiceChange(event) {
        const newId = event.target.value;
        setServiceId(newId);
        const chosen = services.find(item => String(getServiceId(item)) === String(newId));
        if (!chosen) return;
        // This is an actual API request, so the backend can log the selection.
        try {
            const response = await fetch(`${BASE_URL}/api/logs/service-selection`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ serviceId: getServiceId(chosen), serviceName: getServiceName(chosen), price: getServicePrice(chosen) })
            });
            if (!response.ok) console.warn("Backend could not log service selection.");
        } catch (error) {
            console.error("Service selection logging failed:", error);
        }
    }

    async function formSubmit(event) {
        event.preventDefault();
        setMessage("");
        if (!selectedService) {
            showMessage("Please select a dental service.", "error");
            return;
        }
        setSubmitting(true);
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId,
                    patientName: "Daiserie Mae",
                    service: getServiceName(selectedService),
                    serviceId: getServiceId(selectedService),
                    price: getServicePrice(selectedService),
                    dentist,
                    date,
                    time,
                    notes
                })
            });
            const data = await readResponse(response);
            if (!response.ok) throw new Error(data.message || "Failed to submit appointment.");
            const newAppointment = data.appointment || data;
            setAppointments(current => [...current, newAppointment]);
            showMessage("Appointment request submitted successfully!");
            setServiceId("");
            setDentist("");
            setDate("");
            setTime("");
            setNotes("");
        } catch (error) {
            console.error("Create appointment failed:", error);
            showMessage(error.message || "Something went wrong. Check your backend server.", "error");
        } finally {
            setSubmitting(false);
        }
    }

    async function cancelAppointment(appointment) {
        const id = appointment.id ?? appointment._id;
        const status = appointment.status || "Pending";
        if (!id) return showMessage("Unable to cancel: appointment ID not found.", "error");
        if (status === "Cancelled" || status === "Completed") return showMessage("This appointment can no longer be cancelled.", "error");
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        setCancellingId(String(id));
        setMessage("");
        try {
            const response = await fetch(`${API_URL}/${encodeURIComponent(id)}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Cancelled" })
            });
            const data = await readResponse(response);
            if (!response.ok) throw new Error(data.message || "Failed to cancel appointment.");
            const updated = data.appointment || { ...appointment, status: "Cancelled" };
            setAppointments(current => current.map(item => String(item.id ?? item._id) === String(id) ? { ...item, ...updated, status: "Cancelled" } : item));
            showMessage("Appointment cancelled successfully!");
        } catch (error) {
            console.error("Cancel appointment failed:", error);
            showMessage(error.message || "Unable to cancel appointment.", "error");
        } finally {
            setCancellingId(null);
        }
    }

    const myAppointments = appointments.filter(item => String(item.patientId) === patientId);
    const today = new Date();
    const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return (
        <>
            <style>{`
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; background: #f7f4fb; color: #4f3d63; margin: 0; }
                .appointment-main { margin-left: 250px; min-height: 100vh; color: #4f3d63; }
                .appointment-topbar { height: 75px; background: #fff; display: flex; align-items: center; padding: 0 35px; border-bottom: 1px solid #e6dff0; }
                .appointment-topbar h1 { color: #4f3d63; font-size: 24px; margin: 0; }
                .appointment-content { padding: 30px; max-width: 1400px; margin: 0 auto; }
                .appointment-intro { margin-bottom: 25px; }
                .appointment-intro h2 { color: #4f3d63; font-size: 28px; margin: 0 0 7px; }
                .appointment-intro p { color: #6b5b7d; }
                .appointment-form-card, .appointment-table-card { background: #fff; padding: 30px; border-radius: 18px; box-shadow: 0 5px 20px rgba(79,61,99,.08); margin-bottom: 30px; }
                .appointment-form-group { margin-bottom: 20px; }
                .appointment-form-group label { display: block; color: #4f3d63; margin-bottom: 8px; font-weight: bold; }
                .appointment-form-group input, .appointment-form-group select, .appointment-form-group textarea { display: block; width: 100%; padding: 13px 14px; border: 1px solid #d8ccec; border-radius: 10px; font-size: 15px; color: #352344; background: #fff; outline: none; }
                .appointment-form-group input:focus, .appointment-form-group select:focus, .appointment-form-group textarea:focus { border-color: #9b7bb8; box-shadow: 0 0 0 3px #eee7f5; }
                .appointment-form-group input[readonly] { background: #f8f5fc; color: #4f3d63; }
                .appointment-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .appointment-form-group textarea { resize: vertical; min-height: 100px; }
                .appointment-submit-btn { width: 100%; border: none; background: #9b7bb8; color: #fff; padding: 14px 22px; border-radius: 10px; font-size: 15px; font-weight: bold; cursor: pointer; }
                .appointment-submit-btn:hover { background: #80609e; }
                .appointment-submit-btn:disabled { opacity: .65; cursor: not-allowed; }
                .appointment-message { margin-bottom: 20px; padding: 15px; border-radius: 10px; font-weight: 500; overflow-wrap: anywhere; }
                .appointment-message.success { background: #e7f6ec; color: #205c35; }
                .appointment-message.error { background: #fde8e8; color: #a61b1b; }
                .appointment-info-box { margin-top: 20px; background: #f3efff; border-left: 5px solid #9b7bb8; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.7; color: #4f3d63; }
                .appointment-table-card { overflow-x: auto; }
                .appointment-table-card h2 { color: #4f3d63; margin: 0 0 20px; font-size: 22px; }
                .appointment-table { width: 100%; border-collapse: collapse; background: #fff; color: #4f3d63; }
                .appointment-table th, .appointment-table td { padding: 13px; text-align: left; border-bottom: 1px solid #e4dced; color: #4f3d63 !important; font-size: 14px; background: #fff; vertical-align: middle; }
                .appointment-table th { background: #f0e8fc !important; color: #39254f !important; font-weight: bold; white-space: nowrap; }
                .appointment-table tbody tr:hover td { background: #faf7ff; }
                .appointment-status { display: inline-block; background: #fff0c2; color: #654d00 !important; padding: 6px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; white-space: nowrap; }
                .appointment-status.status-cancelled { background: #fde2e2; color: #a61b1b !important; }
                .appointment-status.status-completed { background: #d9f4e2; color: #176638 !important; }
                .appointment-cancel-btn { background: #dc3545; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: bold; cursor: pointer; white-space: nowrap; }
                .appointment-cancel-btn:hover { background: #b02a37; }
                .appointment-cancel-btn:disabled { opacity: .6; cursor: not-allowed; }
                .appointment-empty { text-align: center !important; padding: 25px !important; color: #6b5b7d !important; }
                .appointment-mobile-header { display: none; }
                @media (max-width: 768px) {
                    .appointment-main { margin-left: 0; }
                    .appointment-mobile-header { display: flex; height: 65px; background: #9b7bb8; color: #fff; align-items: center; padding: 0 18px; gap: 15px; }
                    .appointment-menu-btn { border: none; background: transparent; color: #fff; font-size: 25px; cursor: pointer; }
                    .appointment-topbar { display: none; }
                    .appointment-content { padding: 20px 14px; }
                    .appointment-row { grid-template-columns: 1fr; gap: 0; }
                    .appointment-form-card, .appointment-table-card { padding: 20px; }
                    .appointment-table { min-width: 900px; }
                }
            `}</style>

            <Sidebar role="patient" active="appointments" />
            <div className="appointment-main">
                <div className="appointment-mobile-header">
                    <button className="appointment-menu-btn" type="button" aria-label="Toggle navigation" onClick={() => {
                        const sidebar = document.querySelector(".sidebar");
                        if (sidebar) { sidebar.classList.toggle("open"); sidebar.classList.toggle("show"); }
                    }}>☰</button>
                    <strong>DentalCare</strong>
                </div>
                <header className="appointment-topbar"><h1>Book an Appointment</h1></header>
                <main className="appointment-content">
                    <div className="appointment-intro">
                        <h2>Book Your Appointment</h2>
                        <p>Choose your preferred dental service, dentist, date, and time.</p>
                    </div>

                    {message && <div className={`appointment-message ${messageType}`} role="status">{message}</div>}

                    <section className="appointment-form-card">
                        <form onSubmit={formSubmit}>
                            <div className="appointment-form-group">
                                <label htmlFor="patientId">Patient ID</label>
                                <input type="text" id="patientId" value={patientId} readOnly />
                            </div>

                            <div className="appointment-form-group">
                                <label htmlFor="service">Dental Service</label>
                                <select id="service" value={serviceId} onChange={handleServiceChange} required disabled={loadingServices || services.length === 0}>
                                    <option value="">{loadingServices ? "Loading services..." : services.length ? "Select a service" : "No services available"}</option>
                                    {services.map(item => <option key={getServiceId(item) ?? getServiceName(item)} value={String(getServiceId(item))}>{getServiceName(item)} — ₱{Number(getServicePrice(item)).toLocaleString("en-PH")}</option>)}
                                </select>
                                {selectedService && <div className="appointment-info-box">
                                    <strong>Selected Service:</strong> {getServiceName(selectedService)}<br />
                                    <strong>Price:</strong> ₱{Number(getServicePrice(selectedService)).toLocaleString("en-PH")}
                                    {(selectedService.description || selectedService.details) && <><br /><strong>Description:</strong> {selectedService.description || selectedService.details}</>}
                                </div>}
                            </div>

                            <div className="appointment-form-group">
                                <label htmlFor="dentist">Preferred Dentist</label>
                                <select id="dentist" value={dentist} onChange={e => setDentist(e.target.value)} required>
                                    <option value="">Select a dentist</option>
                                    <option value="Dr. Jhulance Fernandez">Dr. Jhulance Fernandez</option>
                                    <option value="Dr. John Cruz">Dr. John Cruz</option>
                                    <option value="Dr. Angela Reyes">Dr. Angela Reyes</option>
                                </select>
                            </div>

                            <div className="appointment-row">
                                <div className="appointment-form-group">
                                    <label htmlFor="date">Preferred Date</label>
                                    <input type="date" id="date" value={date} min={minDate} onChange={e => setDate(e.target.value)} required />
                                </div>
                                <div className="appointment-form-group">
                                    <label htmlFor="time">Preferred Time</label>
                                    <select id="time" value={time} onChange={e => setTime(e.target.value)} required>
                                        <option value="">Select time</option>
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
                                <label htmlFor="notes">Additional Notes</label>
                                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tell us if you have any concerns or additional information..." />
                            </div>

                            <button type="submit" className="appointment-submit-btn" disabled={submitting || loadingServices || !services.length}>
                                {submitting ? "Submitting..." : "📅 Request Appointment"}
                            </button>
                        </form>
                        <div className="appointment-info-box">
                            <strong>Appointment Reminder</strong><br />
                            Please arrive at least 10 minutes before your scheduled appointment.<br />
                            Bring your patient ID when visiting the clinic.
                        </div>
                    </section>

                    <section className="appointment-table-card">
                        <h2>My Appointments</h2>
                        <table className="appointment-table">
                            <thead><tr><th>Patient ID</th><th>Service</th><th>Price</th><th>Dentist</th><th>Date</th><th>Time</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {myAppointments.length === 0 ? <tr><td colSpan="9" className="appointment-empty">No appointments found.</td></tr> : myAppointments.map((appointment, index) => {
                                    const id = appointment.id ?? appointment._id;
                                    const status = appointment.status || "Pending";
                                    return <tr key={id ?? index}>
                                        <td>{appointment.patientId || "—"}</td>
                                        <td>{appointment.service || "—"}</td>
                                        <td>{appointment.price === null || appointment.price === undefined ? "—" : `₱${Number(appointment.price).toLocaleString("en-PH")}`}</td>
                                        <td>{appointment.dentist || "—"}</td>
                                        <td>{appointment.date || "—"}</td>
                                        <td>{appointment.time || "—"}</td>
                                        <td>{appointment.notes || "—"}</td>
                                        <td><span className={`appointment-status ${status === "Cancelled" ? "status-cancelled" : status === "Completed" ? "status-completed" : ""}`}>{status}</span></td>
                                        <td>{status !== "Cancelled" && status !== "Completed" ? <button type="button" className="appointment-cancel-btn" disabled={cancellingId === String(id)} onClick={() => cancelAppointment(appointment)}>{cancellingId === String(id) ? "Cancelling..." : "Cancel"}</button> : "—"}</td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </>
    );
}
