
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

// BACKEND URL
const BASE_URL = "https://dental-system-rzqb.onrender.com";
const API_URL = `${BASE_URL}/api`;

async function readResponse(response) {
    const text = await response.text();

    let data;

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!response.ok) {
        throw new Error(
            data.message || data.error || `Request failed: ${response.status}`
        );
    }

    return data;
}

function getServiceId(service) {
    return service.id ?? service.service_id ?? service.serviceId;
}

function getServiceName(service) {
    return (
        service.service_name ??
        service.serviceName ??
        service.name ??
        service.service ??
        ""
    );
}

function getServicePrice(service) {
    return Number(service.price ?? service.cost ?? 0);
}

function formatDate(date) {
    if (!date) return "";

    const value = String(date).slice(0, 10);
    const parts = value.split("-");

    if (parts.length !== 3) return value;

    return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

function formatTime(time) {
    if (!time) return "";

    const value = String(time);
    const match = value.match(/^(\d{2}):(\d{2})/);

    if (!match) return value;

    let hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
}

export default function PatientAppointment() {
    const [patient, setPatient] = useState(null);
    const [patientId, setPatientId] = useState("");
    const [services, setServices] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [serviceId, setServiceId] = useState("");
    const [dentist, setDentist] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const selectedService = useMemo(() => {
        return services.find(
            item => String(getServiceId(item)) === String(serviceId)
        );
    }, [services, serviceId]);

    const serviceName = selectedService
        ? getServiceName(selectedService)
        : "";

    const servicePrice = selectedService
        ? getServicePrice(selectedService)
        : 0;

    // GET THE EXISTING PATIENT ID FROM THE DATABASE
    async function loadPatient() {
        const email = localStorage.getItem("userEmail");

        if (!email) {
            throw new Error(
                "Your login email was not found. Please log in again."
            );
        }

        const response = await fetch(
            `${API_URL}/patients/by-email/${encodeURIComponent(email)}`
        );

        const data = await readResponse(response);
        const patientData = data.patient;

        if (!patientData) {
            throw new Error("Patient record was not returned by the server.");
        }

        // IMPORTANT: Use patients.patient_id, NOT patients.id.
        const existingPatientId =
            patientData.patient_id ??
            patientData.patientCode ??
            patientData.patientId;

        if (!existingPatientId) {
            throw new Error(
                "Your database patient_id is missing. Check your patients table."
            );
        }

        setPatient(patientData);
        setPatientId(String(existingPatientId));

        return String(existingPatientId);
    }

    // GET SERVICES
    async function loadServices() {
        const response = await fetch(`${API_URL}/services`);
        const data = await readResponse(response);

        const serviceList = Array.isArray(data)
            ? data
            : data.services || [];

        setServices(serviceList);
    }

    // GET APPOINTMENTS
    async function loadAppointments() {
        const response = await fetch(`${API_URL}/patient_appoint`);
        const data = await readResponse(response);

        const appointmentList = Array.isArray(data)
            ? data
            : data.appointments || [];

        setAppointments(appointmentList);
    }

    // LOAD DATA WHEN PAGE OPENS
    useEffect(() => {
        let active = true;

        async function loadPage() {
            setLoading(true);
            setError("");

            try {
                await Promise.all([
                    loadPatient(),
                    loadServices(),
                    loadAppointments()
                ]);
            } catch (err) {
                if (active) {
                    setError(err.message);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadPage();

        return () => {
            active = false;
        };
    }, []);

    // FILTER APPOINTMENTS USING THE DATABASE PATIENT ID
    const myAppointments = appointments.filter(item => {
        const appointmentPatientId =
            item.patient_id ??
            item.patientId ??
            item.patientCode;

        return (
            String(appointmentPatientId ?? "") ===
            String(patientId)
        );
    });

    // BOOK APPOINTMENT
    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!patientId) {
            setError("Patient ID is missing. Please reload the page.");
            return;
        }

        if (!selectedService) {
            setError("Please select a dental service.");
            return;
        }

        if (!dentist.trim()) {
            setError("Please enter or select a dentist.");
            return;
        }

        if (!date || !time) {
            setError("Please select your appointment date and time.");
            return;
        }

        const patientName = [
            patient?.first_name,
            patient?.last_name
        ].filter(Boolean).join(" ");

        // Use the existing patient_id from the database.
        const appointmentData = {
            patientId: patientId,
            patientName: patientName,
            service: serviceName,
            serviceId: getServiceId(selectedService),
            price: servicePrice,
            dentist: dentist.trim(),
            date: date,
            time: time,
            notes: notes.trim()
        };

        setSubmitting(true);

        try {
            const response = await fetch(
                `${API_URL}/patient_appoint`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(appointmentData)
                }
            );

            const data = await readResponse(response);

            setMessage(
                data.message || "Appointment booked successfully!"
            );

            setServiceId("");
            setDentist("");
            setDate("");
            setTime("");
            setNotes("");

            await loadAppointments();
        } catch (err) {
            console.error("Appointment booking error:", err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    // CANCEL APPOINTMENT
    async function handleCancel(appointment) {
        const appointmentId = appointment.id;

        if (!appointmentId) {
            setError("Appointment ID is missing.");
            return;
        }

        if (!window.confirm("Are you sure you want to cancel this appointment?")) {
            return;
        }

        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/patient_appoint/${appointmentId}/status`,
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

            setMessage(
                data.message || "Appointment cancelled successfully."
            );

            await loadAppointments();
        } catch (err) {
            console.error("Cancel appointment error:", err);
            setError(err.message);
        }
    }

    if (loading) {
        return (
            <div className="patient-appointment-page">
                <Sidebar />
                <main className="appointment-content">
                    <p>Loading your appointment information...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="patient-appointment-page">
            <Sidebar />

            <main className="appointment-content">
                <h1>Book an Appointment</h1>
                <p>Schedule your dental appointment below.</p>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="alert alert-success" role="alert">
                        {message}
                    </div>
                )}

                <section className="appointment-form-section">
                    <h2>Patient Information</h2>

                    <div className="patient-information">
                        <p>
                            <strong>Patient Name:</strong>{" "}
                            {patient
                                ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
                                : ""}
                        </p>

                        <p>
                            <strong>Patient ID:</strong> {patientId}
                        </p>

                        <p>
                            <strong>Email:</strong> {patient?.email || ""}
                        </p>
                    </div>

                    <h2>Appointment Details</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="service">Dental Service</label>

                            <select
                                id="service"
                                value={serviceId}
                                onChange={event => setServiceId(event.target.value)}
                                required
                            >
                                <option value="">Select a dental service</option>

                                {services.map(item => (
                                    <option
                                        key={getServiceId(item)}
                                        value={getServiceId(item)}
                                    >
                                        {getServiceName(item)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedService && (
                            <p>
                                <strong>Service Price:</strong>{" "}
                                ₱{servicePrice.toFixed(2)}
                            </p>
                        )}

                        <div className="form-group">
                            <label htmlFor="dentist">Dentist</label>

                            <input
                                id="dentist"
                                type="text"
                                value={dentist}
                                onChange={event => setDentist(event.target.value)}
                                placeholder="Enter dentist name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date">Appointment Date</label>

                            <input
                                id="date"
                                type="date"
                                value={date}
                                min={new Date().toLocaleDateString("en-CA")}
                                onChange={event => setDate(event.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="time">Appointment Time</label>

                            <input
                                id="time"
                                type="time"
                                value={time}
                                onChange={event => setTime(event.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Additional Notes</label>

                            <textarea
                                id="notes"
                                value={notes}
                                onChange={event => setNotes(event.target.value)}
                                placeholder="Enter additional notes (optional)"
                                rows="4"
                            />
                        </div>

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Booking..." : "Book Appointment"}
                        </button>
                    </form>
                </section>

                <section className="appointment-history-section">
                    <h2>My Appointments</h2>

                    {myAppointments.length === 0 ? (
                        <p>You don't have any appointments yet.</p>
                    ) : (
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Price</th>
                                        <th>Dentist</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Notes</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {myAppointments.map(item => {
                                        const status =
                                            item.status || "Pending";

                                        const isCancelled =
                                            status.toLowerCase() === "cancelled";

                                        const isCompleted =
                                            status.toLowerCase() === "completed";

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    {item.service || ""}
                                                </td>

                                                <td>
                                                    ₱{Number(item.price || 0).toFixed(2)}
                                                </td>

                                                <td>
                                                    {item.dentist || ""}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        item.appointment_date ??
                                                        item.date
                                                    )}
                                                </td>

                                                <td>
                                                    {formatTime(
                                                        item.appointment_time ??
                                                        item.time
                                                    )}
                                                </td>

                                                <td>{status}</td>

                                                <td>{item.notes || "—"}</td>

                                                <td>
                                                    {!isCancelled && !isCompleted && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancel(item)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
