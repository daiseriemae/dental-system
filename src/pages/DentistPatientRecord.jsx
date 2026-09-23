import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";

const API_URL = "http://localhost:8080/api/patients";

export default function DentistPatientRecord() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [search, setSearch] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [offline, setOffline] = useState(!navigator.onLine);

    useEffect(() => {
        loadPatients();

        const handleOnline = () => setOffline(false);
        const handleOffline = () => setOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    async function loadPatients() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Unable to load patient records.");
            }

            const data = await response.json();

            setPatients(data);

            if (data.length > 0) {
                setSelectedPatient(data[0]);
                setNotes(data[0].notes || "");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function selectPatient(patient) {
        try {
            const response = await fetch(
                `${API_URL}/${patient.id}`
            );

            if (!response.ok) {
                throw new Error("Unable to load patient.");
            }

            const data = await response.json();

            setSelectedPatient(data);
            setNotes(data.notes || "");
            setEditing(false);
        } catch (error) {
            console.error(error);
            alert("Unable to load patient record.");
        }
    }

    async function saveNotes() {
        if (!selectedPatient) {
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/${selectedPatient.id}/notes`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        notes
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to save notes."
                );
            }

            const updatedPatient = data.patient || data;

            setSelectedPatient(updatedPatient);

            setPatients(current =>
                current.map(patient =>
                    patient.id === updatedPatient.id
                        ? updatedPatient
                        : patient
                )
            );

            setNotes(updatedPatient.notes || "");

            alert("Patient notes have been saved successfully.");
        } catch (error) {
            console.error(error);
            alert(
                "Cannot connect to the backend-api. Make sure server.js is running on port 8080."
            );
        } finally {
            setSaving(false);
        }
    }

    function editPatient() {
        if (!selectedPatient) {
            return;
        }

        setEditData({
            name: selectedPatient.name || "",
            email: selectedPatient.email || "",
            phone: selectedPatient.phone || "",
            birthdate: selectedPatient.birthdate || "",
            service: selectedPatient.service || "",
            status: selectedPatient.status || "",
            nextVisit: selectedPatient.nextVisit || ""
        });

        setEditing(true);
    }

    function handleEditChange(event) {
        const { name, value } = event.target;

        setEditData(current => ({
            ...current,
            [name]: value
        }));
    }

    async function savePatientChanges() {
        if (!selectedPatient) {
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/${selectedPatient.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(editData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update patient."
                );
            }

            const updatedPatient = data.patient || data;

            setSelectedPatient(updatedPatient);

            setPatients(current =>
                current.map(patient =>
                    patient.id === updatedPatient.id
                        ? updatedPatient
                        : patient
                )
            );

            setNotes(updatedPatient.notes || "");
            setEditing(false);

            alert("Patient record updated successfully.");
        } catch (error) {
            console.error(error);
            alert(
                "Cannot update patient record. Make sure server.js is running on port 8080."
            );
        } finally {
            setSaving(false);
        }
    }

    function getFilteredPatients() {
        const searchText = search.toLowerCase().trim();

        return patients.filter(patient =>
            patient.name.toLowerCase().includes(searchText) ||
            patient.id.toLowerCase().includes(searchText)
        );
    }

    return (
        <>
            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                }

                body {
                    background: #f7f3fc;
                    color: #333;
                }

                .main {
                    margin-left: 250px;
                    padding: 30px;
                }

                .topbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .topbar h1 {
                    color: #5f4778;
                    font-size: 27px;
                }

                .topbar p {
                    color: #777;
                    margin-top: 5px;
                    font-size: 14px;
                }

                .dentist-info {
                    background: white;
                    padding: 10px 16px;
                    border-radius: 12px;
                    box-shadow: 0 3px 12px rgba(0,0,0,0.05);
                    color: #5f4778;
                    font-weight: bold;
                }

                .offline-banner {
                    background: #fff3cd;
                    color: #856404;
                    padding: 12px 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    text-align: center;
                    font-size: 14px;
                }

                .search-box {
                    background: white;
                    padding: 20px;
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    margin-bottom: 20px;
                }

                .search-box h2 {
                    color: #5f4778;
                    font-size: 19px;
                    margin-bottom: 12px;
                }

                .search-area {
                    display: flex;
                    gap: 10px;
                }

                .search-area input {
                    flex: 1;
                    padding: 12px 14px;
                    border: 1px solid #ddd;
                    border-radius: 9px;
                    outline: none;
                    font-size: 14px;
                }

                .search-area input:focus {
                    border-color: #9b7bb8;
                }

                .search-btn {
                    border: none;
                    background: #80609e;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 9px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 20px;
                }

                .patient-list {
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }

                .patient-list h2 {
                    color: #5f4778;
                    font-size: 19px;
                    margin-bottom: 15px;
                }

                .patient-item {
                    padding: 14px;
                    border: 1px solid #eee;
                    border-radius: 11px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .patient-item:hover,
                .patient-item.selected {
                    background: #f1eafa;
                    border-color: #cdb9df;
                }

                .patient-name {
                    font-weight: bold;
                    color: #4f3d61;
                    font-size: 14px;
                }

                .patient-id {
                    color: #888;
                    font-size: 11px;
                    margin-top: 4px;
                }

                .patient-item small {
                    display: block;
                    color: #999;
                    margin-top: 5px;
                }

                .record-details {
                    background: white;
                    border-radius: 15px;
                    padding: 25px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }

                .record-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }

                .patient-profile {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .large-avatar {
                    width: 65px;
                    height: 65px;
                    border-radius: 50%;
                    background: #eee7f5;
                    color: #80609e;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 22px;
                    font-weight: bold;
                }

                .patient-profile h2 {
                    color: #4e3b60;
                    font-size: 21px;
                }

                .patient-profile p {
                    color: #888;
                    font-size: 12px;
                    margin-top: 5px;
                }

                .edit-btn {
                    border: none;
                    background: #eee7f5;
                    color: #604879;
                    padding: 10px 15px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .edit-btn:hover {
                    background: #e1d5ed;
                }

                .edit-form {
                    background: #faf8fd;
                    border: 1px solid #e5d9ef;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 25px;
                }

                .edit-form-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .edit-form-header h3 {
                    color: #5f4778;
                    font-size: 18px;
                    margin: 0;
                }

                .close-edit-btn {
                    border: none;
                    background: #eee7f5;
                    color: #604879;
                    width: 35px;
                    height: 35px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .edit-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }

                .edit-field {
                    display: flex;
                    flex-direction: column;
                }

                .edit-field label {
                    color: #666;
                    font-size: 12px;
                    font-weight: bold;
                    margin-bottom: 6px;
                }

                .edit-field input,
                .edit-field select {
                    width: 100%;
                    padding: 11px 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: white;
                    outline: none;
                    font-size: 13px;
                }

                .edit-field input:focus,
                .edit-field select:focus {
                    border-color: #9b7bb8;
                }

                .edit-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }

                .cancel-edit-btn,
                .save-edit-btn {
                    border: none;
                    padding: 10px 18px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .cancel-edit-btn {
                    background: #eee;
                    color: #555;
                }

                .save-edit-btn {
                    background: #80609e;
                    color: white;
                }

                .cancel-edit-btn:disabled,
                .save-edit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .info-section {
                    margin-top: 22px;
                }

                .info-section h3 {
                    color: #5f4778;
                    font-size: 17px;
                    margin-bottom: 14px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .info-card {
                    background: #faf8fd;
                    padding: 14px;
                    border-radius: 10px;
                }

                .info-card span {
                    display: block;
                    color: #999;
                    font-size: 11px;
                    margin-bottom: 5px;
                }

                .info-card strong {
                    color: #555;
                    font-size: 13px;
                }

                .history-item {
                    border-left: 3px solid #9b7bb8;
                    padding: 12px 15px;
                    margin-bottom: 12px;
                    background: #faf8fd;
                    border-radius: 0 10px 10px 0;
                }

                .history-item h4 {
                    color: #5f4778;
                    font-size: 14px;
                }

                .history-item p {
                    color: #777;
                    font-size: 12px;
                    margin-top: 5px;
                }

                .history-date {
                    color: #9b7bb8 !important;
                    font-size: 11px !important;
                }

                .notes textarea {
                    width: 100%;
                    min-height: 110px;
                    padding: 13px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    resize: vertical;
                    outline: none;
                    font-size: 13px;
                }

                .notes textarea:focus {
                    border-color: #9b7bb8;
                }

                .save-btn {
                    margin-top: 10px;
                    border: none;
                    background: #80609e;
                    color: white;
                    padding: 11px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .no-patient {
                    text-align: center;
                    padding: 80px 20px;
                    color: #888;
                }

                .loading {
                    text-align: center;
                    padding: 50px;
                    color: #80609e;
                }

                .menu-btn {
                    display: none;
                    border: none;
                    background: #80609e;
                    color: white;
                    width: 42px;
                    height: 42px;
                    border-radius: 9px;
                    cursor: pointer;
                    font-size: 20px;
                }

                @media (max-width: 950px) {
                    .content-grid {
                        grid-template-columns: 1fr;
                    }

                    .patient-list {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                    }

                    .patient-list h2 {
                        grid-column: 1 / -1;
                    }

                    .patient-item {
                        margin-bottom: 0;
                    }
                }

                @media (max-width: 768px) {
                    .sidebar {
                        left: -270px;
                    }

                    .sidebar.show {
                        left: 0;
                    }

                    .main {
                        margin-left: 0;
                        padding: 20px;
                    }

                    .menu-btn {
                        display: block;
                    }

                    .dentist-info {
                        display: none;
                    }

                    .topbar {
                        gap: 15px;
                    }

                    .topbar h1 {
                        font-size: 22px;
                    }
                }

                @media (max-width: 550px) {
                    .patient-list {
                        grid-template-columns: 1fr;
                    }

                    .search-area {
                        flex-direction: column;
                    }

                    .info-grid,
                    .edit-grid {
                        grid-template-columns: 1fr;
                    }

                    .record-header {
                        align-items: flex-start;
                        gap: 15px;
                    }

                    .patient-profile {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .edit-actions {
                        flex-direction: column;
                    }

                    .cancel-edit-btn,
                    .save-edit-btn {
                        width: 100%;
                    }
                }
            `}</style>

            <Sidebar role="dentist" active="records" />

            <main className="main">
                {offline && (
                    <div className="offline-banner">
                        ⚠️ You are currently offline. Changes require a backend connection.
                    </div>
                )}

                <div className="topbar">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px"
                        }}
                    >
                        <button
                            className="menu-btn"
                            onClick={() =>
                                document
                                    .querySelector(".sidebar")
                                    ?.classList.toggle("show")
                            }
                        >
                            ☰
                        </button>

                        <div>
                            <h1>Patient Records</h1>
                            <p>
                                View and manage your patients' dental records.
                            </p>
                        </div>
                    </div>

                    <div className="dentist-info">
                        👩‍⚕️ Dr. Maria Santos
                    </div>
                </div>

                <section className="search-box">
                    <h2>Search Patient</h2>

                    <div className="search-area">
                        <input
                            type="text"
                            placeholder="Enter patient name or patient ID..."
                            value={search}
                            onChange={event =>
                                setSearch(event.target.value)
                            }
                        />

                        <button className="search-btn">
                            🔎 Search
                        </button>
                    </div>
                </section>

                {loading ? (
                    <div className="loading">
                        Loading patient records...
                    </div>
                ) : (
                    <div className="content-grid">
                        <section className="patient-list">
                            <h2>Patients</h2>

                            {getFilteredPatients().length === 0 ? (
                                <p
                                    style={{
                                        color: "#888",
                                        fontSize: "13px"
                                    }}
                                >
                                    No patients found.
                                </p>
                            ) : (
                                getFilteredPatients().map(patient => (
                                    <div
                                        key={patient.id}
                                        className={`patient-item ${
                                            selectedPatient?.id === patient.id
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            selectPatient(patient)
                                        }
                                    >
                                        <div className="patient-name">
                                            {patient.name}
                                        </div>

                                        <div className="patient-id">
                                            Patient ID: {patient.id}
                                        </div>

                                        <small>
                                            Last visit: {patient.lastVisit}
                                        </small>
                                    </div>
                                ))
                            )}
                        </section>

                        <section className="record-details">
                            {!selectedPatient ? (
                                <div className="no-patient">
                                    <div style={{ fontSize: "50px" }}>
                                        🦷
                                    </div>

                                    <p>
                                        Select a patient to view their record.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {editing && (
                                        <div className="edit-form">
                                            <div className="edit-form-header">
                                                <h3>
                                                    Edit Patient Record
                                                </h3>

                                                <button
                                                    className="close-edit-btn"
                                                    onClick={() =>
                                                        setEditing(false)
                                                    }
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="edit-grid">
                                                <div className="edit-field">
                                                    <label>
                                                        Full Name
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={
                                                            editData.name || ""
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />
                                                </div>

                                                <div className="edit-field">
                                                    <label>
                                                        Email
                                                    </label>

                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={
                                                            editData.email || ""
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />
                                                </div>

                                                <div className="edit-field">
                                                    <label>
                                                        Phone
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        value={
                                                            editData.phone || ""
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />
                                                </div>

                                                <div className="edit-field">
                                                    <label>
                                                        Birthdate
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="birthdate"
                                                        value={
                                                            editData.birthdate ||
                                                            ""
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />
                                                </div>

                                                <div className="edit-field">
                                                    <label>
                                                        Last Service
                                                    </label>

                                                    <select
                                                        name="service"
                                                        value={
                                                            editData.service ||
                                                            ""
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    >
                                                        <option value="">
                                                            Select service
                                                        </option>

                                                        <option value="Dental Cleaning">
                                                            Dental Cleaning
                                                        </option>

                                                        <option value="Dental Check-up">
                                                            Dental Check-up
                                                        </option>

                                                        <option value="Dental Filling">
                                                            Dental Filling
                                                        </option>

                                                        <option value="Teeth Whitening">
                                                            Teeth Whitening
                                                        </option>

                                                        <option value="Tooth Extraction">
                                                            Tooth Extraction
                                                        </option>

                                                        <option value="Braces Consultation">
                                                            Braces Consultation
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="edit-field">
                                                    <label>
                                                        Dental Status
                                                    </label>

                                                    <select
                                                        name="status"
                                                        value={
                                                            editData.status ||
                                                            ""
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    >
                                                        <option value="">
                                                            Select status
                                                        </option>

                                                        <option value="Good">
                                                            Good
                                                        </option>

                                                        <option value="Needs Follow-up">
                                                            Needs Follow-up
                                                        </option>

                                                        <option value="Under Treatment">
                                                            Under Treatment
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="edit-field">
                                                    <label>
                                                        Next Visit
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="nextVisit"
                                                        value={
                                                            editData.nextVisit ||
                                                            ""
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="edit-actions">
                                                <button
                                                    className="cancel-edit-btn"
                                                    onClick={() =>
                                                        setEditing(false)
                                                    }
                                                    disabled={saving}
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    className="save-edit-btn"
                                                    onClick={
                                                        savePatientChanges
                                                    }
                                                    disabled={saving}
                                                >
                                                    {saving
                                                        ? "Saving..."
                                                        : "Save Changes"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="record-header">
                                        <div className="patient-profile">
                                            <div className="large-avatar">
                                                {selectedPatient.avatar}
                                            </div>

                                            <div>
                                                <h2>
                                                    {selectedPatient.name}
                                                </h2>

                                                <p>
                                                    Patient ID:{" "}
                                                    {selectedPatient.id}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            className="edit-btn"
                                            onClick={editPatient}
                                        >
                                            ✏️ Edit
                                        </button>
                                    </div>

                                    <div className="info-section">
                                        <h3>Personal Information</h3>

                                        <div className="info-grid">
                                            <div className="info-card">
                                                <span>
                                                    FULL NAME
                                                </span>

                                                <strong>
                                                    {selectedPatient.name}
                                                </strong>
                                            </div>

                                            <div className="info-card">
                                                <span>
                                                    EMAIL
                                                </span>

                                                <strong>
                                                    {selectedPatient.email}
                                                </strong>
                                            </div>

                                            <div className="info-card">
                                                <span>
                                                    PHONE
                                                </span>

                                                <strong>
                                                    {selectedPatient.phone}
                                                </strong>
                                            </div>

                                            <div className="info-card">
                                                <span>
                                                    BIRTHDATE
                                                </span>

                                                <strong>
                                                    {selectedPatient.birthdate}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <h3>Dental Information</h3>

                                        <div className="info-grid">
                                            <div className="info-card">
                                                <span>
                                                    LAST VISIT
                                                </span>

                                                <strong>
                                                    {selectedPatient.lastVisit}
                                                </strong>
                                            </div>

                                            <div className="info-card">
                                                <span>
                                                    LAST SERVICE
                                                </span>

                                                <strong>
                                                    {selectedPatient.service}
                                                </strong>
                                            </div>

                                            <div className="info-card">
                                                <span>
                                                    DENTAL STATUS
                                                </span>

                                                <strong>
                                                    {selectedPatient.status}
                                                </strong>
                                            </div>

                                            <div className="info-card">
                                                <span>
                                                    NEXT VISIT
                                                </span>

                                                <strong>
                                                    {selectedPatient.nextVisit}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <h3>Dental History</h3>

                                        {selectedPatient.history?.length > 0 ? (
                                            selectedPatient.history.map(
                                                (item, index) => (
                                                    <div
                                                        className="history-item"
                                                        key={index}
                                                    >
                                                        <h4>
                                                            {item.service}
                                                        </h4>

                                                        <p className="history-date">
                                                            {item.date}
                                                        </p>

                                                        <p>
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <p
                                                style={{
                                                    color: "#888",
                                                    fontSize: "13px"
                                                }}
                                            >
                                                No dental history available.
                                            </p>
                                        )}
                                    </div>

                                    <div className="info-section notes">
                                        <h3>Dentist Notes</h3>

                                        <textarea
                                            placeholder="Write notes about the patient's dental condition..."
                                            value={notes}
                                            onChange={event =>
                                                setNotes(
                                                    event.target.value
                                                )
                                            }
                                        />

                                        <br />

                                        <button
                                            className="save-btn"
                                            onClick={saveNotes}
                                            disabled={saving}
                                        >
                                            {saving
                                                ? "Saving..."
                                                : "💾 Save Notes"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                )}
            </main>
        </>
    );
}