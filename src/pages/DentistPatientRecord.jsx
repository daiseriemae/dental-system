import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";

const API_URL = `${import.meta.env.VITE_API_URL}/api/patients`;

export default function DentistPatientRecord() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [search, setSearch] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editing, setEditing] = useState(false);
    const [editID, setEditID] = useState("");
    const [editData, setEditData] = useState({});
    const [originalEditData, setOriginalEditData] = useState({});

    const [offline, setOffline] = useState(!navigator.onLine);

    // DELETE CONFIRMATION FORM
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [deletePatientData, setDeletePatientData] = useState(null);

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

    // ==========================================
    // LOAD PATIENTS
    // ==========================================

    async function loadPatients() {
        try {
            setLoading(true);

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Unable to load patient records.");
            }

            const data = await response.json();

            setPatients(data);

            if (data.length > 0) {
                setSelectedPatient(data[0]);
                setNotes(data[0].notes || "");
            } else {
                setSelectedPatient(null);
                setNotes("");
            }
        } catch (error) {
            console.error("Load patients error:", error);

            alert(
                "Cannot connect to the backend. Make sure server.js is running on port 8080."
            );
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // SELECT PATIENT
    // ==========================================

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
            setEditID("");
            setEditData({});
            setOriginalEditData({});
        } catch (error) {
            console.error("Select patient error:", error);

            alert("Unable to load patient record.");
        }
    }

    // ==========================================
    // SAVE NOTES
    // ==========================================

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
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        notes,
                    }),
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

            setPatients((current) =>
                current.map((patient) =>
                    patient.id === updatedPatient.id
                        ? updatedPatient
                        : patient
                )
            );

            setNotes(updatedPatient.notes || "");

            alert("Patient notes have been saved successfully.");
        } catch (error) {
            console.error("Save notes error:", error);

            alert(
                "Cannot connect to the backend-api. Make sure server.js is running on port 8080."
            );
        } finally {
            setSaving(false);
        }
    }

    // ==========================================
    // EDIT PATIENT
    // ==========================================

    function editPatient() {
        if (!selectedPatient) {
            return;
        }

        const patientData = {
            name: selectedPatient.name || "",
            email: selectedPatient.email || "",
            phone: selectedPatient.phone || "",
            birthdate: selectedPatient.birthdate || "",
            service: selectedPatient.service || "",
            status: selectedPatient.status || "",
            nextVisit: selectedPatient.nextVisit || "",
        };

        setEditID(selectedPatient.id);
        setEditData(patientData);
        setOriginalEditData(patientData);
        setEditing(true);
    }

    function handleEditChange(event) {
        const { name, value } = event.target;

        setEditData((current) => ({
            ...current,
            [name]: value,
        }));
    }

    // ==========================================
    // SAVE EDITED PATIENT
    // ==========================================

    async function savePatientChanges() {
        if (!editID) {
            return;
        }

        setSaving(true);

        try {
            const changedData = {};

            Object.keys(editData).forEach((key) => {
                const oldValue = originalEditData[key] ?? "";
                const newValue = editData[key] ?? "";

                if (oldValue !== newValue) {
                    changedData[key] = newValue;
                }
            });

            if (Object.keys(changedData).length === 0) {
                alert("No changes detected.");

                setEditing(false);
                setSaving(false);

                return;
            }

            const response = await fetch(
                `${API_URL}/${editID}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(changedData),
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

            setPatients((current) =>
                current.map((patient) =>
                    patient.id === updatedPatient.id
                        ? updatedPatient
                        : patient
                )
            );

            setNotes(updatedPatient.notes || "");

            setEditID("");
            setEditData({});
            setOriginalEditData({});
            setEditing(false);

            alert("Patient record updated successfully.");
        } catch (error) {
            console.error("Update patient error:", error);

            alert(
                "Cannot update patient record. Make sure server.js is running on port 8080."
            );
        } finally {
            setSaving(false);
        }
    }

    // ==========================================
    // OPEN DELETE CONFIRMATION FORM
    // ==========================================

    function openDeleteConfirmation(patient = selectedPatient) {
        if (!patient) {
            return;
        }

        setDeletePatientData(patient);
        setShowDeleteForm(true);
    }

    // ==========================================
    // CLOSE DELETE CONFIRMATION FORM
    // ==========================================

    function closeDeleteConfirmation() {
        if (saving) {
            return;
        }

        setShowDeleteForm(false);
        setDeletePatientData(null);
    }

    // ==========================================
    // DELETE PATIENT FROM BACKEND
    // ==========================================

    async function confirmDeletePatient() {
        if (!deletePatientData) {
            return;
        }

        const patientToDelete = deletePatientData;
        const deletedID = patientToDelete.id;

        setSaving(true);

        try {
            console.log(
                `Deleting patient: ${patientToDelete.name} (${deletedID})`
            );

            const response = await fetch(
                `${API_URL}/${deletedID}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        `Delete failed with status ${response.status}`
                );
            }

            console.log(
                "Patient deleted successfully:",
                deletedID
            );

            // Remove deleted patient from frontend
            const remainingPatients = patients.filter(
                (patient) => patient.id !== deletedID
            );

            setPatients(remainingPatients);

            // Close delete form
            setShowDeleteForm(false);
            setDeletePatientData(null);

            // Reset editing
            setEditing(false);
            setEditID("");
            setEditData({});
            setOriginalEditData({});

            // Select another patient if available
            if (remainingPatients.length > 0) {
                const nextPatient = remainingPatients[0];

                try {
                    const nextResponse = await fetch(
                        `${API_URL}/${nextPatient.id}`
                    );

                    if (nextResponse.ok) {
                        const nextData =
                            await nextResponse.json();

                        setSelectedPatient(nextData);
                        setNotes(nextData.notes || "");
                    } else {
                        setSelectedPatient(nextPatient);
                        setNotes(nextPatient.notes || "");
                    }
                } catch (error) {
                    console.error(
                        "Unable to load next patient:",
                        error
                    );

                    setSelectedPatient(nextPatient);
                    setNotes(nextPatient.notes || "");
                }
            } else {
                setSelectedPatient(null);
                setNotes("");
            }

            alert(
                `${patientToDelete.name || "Patient"}'s record has been deleted successfully.`
            );
        } catch (error) {
            console.error("Delete patient error:", error);

            alert(
                `Unable to delete patient record.\n\n${error.message}\n\nMake sure your backend server is running on port 8080 and has a DELETE /api/patients/:id route.`
            );
        } finally {
            setSaving(false);
        }
    }

    // ==========================================
    // CANCEL EDIT
    // ==========================================

    function cancelEdit() {
        setEditing(false);
        setEditID("");
        setEditData({});
        setOriginalEditData({});
    }

    // ==========================================
    // SEARCH
    // ==========================================

    function getFilteredPatients() {
        const searchText = search
            .toLowerCase()
            .trim();

        return patients.filter(
            (patient) =>
                (patient.name || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (patient.id || "")
                    .toLowerCase()
                    .includes(searchText)
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
                    min-width: 0;
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
                    flex-shrink: 0;
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

                /* ==========================
                   EDIT + DELETE BUTTONS
                   ========================== */

                .record-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                }

                .edit-btn,
                .delete-btn {
                    border: none;
                    padding: 11px 16px;
                    min-height: 42px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                    white-space: nowrap;
                }

                .edit-btn {
                    background: #eee7f5;
                    color: #604879;
                }

                .edit-btn:hover {
                    background: #e1d5ed;
                }

                .delete-btn {
                    background: #dc3545 !important;
                    color: white !important;
                }

                .delete-btn:hover {
                    background: #c82333 !important;
                }

                .edit-btn:disabled,
                .delete-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ==========================
                   EDIT FORM
                   ========================== */

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
                    align-items: center;
                    gap: 10px;
                    margin-top: 20px;
                }

                .cancel-edit-btn,
                .save-edit-btn,
                .delete-edit-btn {
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

                .delete-edit-btn {
                    background: #dc3545 !important;
                    color: white !important;
                    margin-right: auto;
                }

                .cancel-edit-btn:disabled,
                .save-edit-btn:disabled,
                .delete-edit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ==========================
                   DELETE CONFIRMATION MODAL
                   ========================== */

                .delete-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(43, 31, 52, 0.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    z-index: 9999;
                }

                .delete-modal {
                    width: 100%;
                    max-width: 480px;
                    background: white;
                    border-radius: 18px;
                    padding: 28px;
                    box-shadow: 0 15px 45px rgba(0,0,0,0.25);
                    animation: deleteModalShow 0.2s ease;
                }

                @keyframes deleteModalShow {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.98);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .delete-icon {
                    width: 65px;
                    height: 65px;
                    margin: 0 auto 18px;
                    border-radius: 50%;
                    background: #fde7e9;
                    color: #dc3545;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                }

                .delete-modal h2 {
                    text-align: center;
                    color: #4e3b60;
                    font-size: 21px;
                    margin-bottom: 10px;
                }

                .delete-modal-description {
                    text-align: center;
                    color: #777;
                    font-size: 14px;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }

                .delete-patient-info {
                    background: #faf8fd;
                    border: 1px solid #e5d9ef;
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 20px;
                }

                .delete-patient-info-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 6px 0;
                }

                .delete-patient-info-row span {
                    color: #999;
                    font-size: 12px;
                }

                .delete-patient-info-row strong {
                    color: #4e3b60;
                    font-size: 13px;
                    text-align: right;
                }

                .delete-warning {
                    background: #fff3cd;
                    border: 1px solid #ffe69c;
                    color: #856404;
                    padding: 12px;
                    border-radius: 9px;
                    font-size: 12px;
                    line-height: 1.5;
                    margin-bottom: 22px;
                }

                .delete-modal-actions {
                    display: flex;
                    gap: 10px;
                }

                .delete-cancel-btn,
                .delete-confirm-btn {
                    flex: 1;
                    border: none;
                    padding: 12px 15px;
                    border-radius: 9px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                }

                .delete-cancel-btn {
                    background: #eee7f5;
                    color: #604879;
                }

                .delete-cancel-btn:hover {
                    background: #e1d5ed;
                }

                .delete-confirm-btn {
                    background: #dc3545;
                    color: white;
                }

                .delete-confirm-btn:hover {
                    background: #c82333;
                }

                .delete-cancel-btn:disabled,
                .delete-confirm-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ==========================
                   INFORMATION
                   ========================== */

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

                /* ==========================
                   RESPONSIVE
                   ========================== */

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

                    .record-header {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 15px;
                    }

                    .record-actions {
                        width: 100%;
                    }

                    .record-actions button {
                        flex: 1;
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

                    .patient-profile {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .record-actions {
                        flex-direction: column;
                        width: 100%;
                    }

                    .record-actions button {
                        width: 100%;
                    }

                    .edit-actions {
                        flex-direction: column;
                    }

                    .cancel-edit-btn,
                    .save-edit-btn,
                    .delete-edit-btn {
                        width: 100%;
                    }

                    .delete-edit-btn {
                        margin-right: 0;
                        order: 3;
                    }

                    .delete-modal {
                        padding: 22px;
                    }

                    .delete-modal-actions {
                        flex-direction: column;
                    }

                    .delete-patient-info-row {
                        flex-direction: column;
                        gap: 3px;
                    }

                    .delete-patient-info-row strong {
                        text-align: left;
                    }
                }

            `}</style>

            <Sidebar
                role="dentist"
                active="records"
            />

            <main className="main">

                {/* OFFLINE MESSAGE */}

                {offline && (
                    <div className="offline-banner">
                        ⚠️ You are currently offline. Changes require a backend connection.
                    </div>
                )}

                {/* HEADER */}

                <div className="topbar">

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                        }}
                    >

                        <button
                            type="button"
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

                {/* SEARCH */}

                <section className="search-box">

                    <h2>Search Patient</h2>

                    <div className="search-area">

                        <input
                            type="text"
                            placeholder="Enter patient name or patient ID..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        <button
                            type="button"
                            className="search-btn"
                        >
                            🔎 Search
                        </button>

                    </div>

                </section>

                {/* PATIENT CONTENT */}

                {loading ? (

                    <div className="loading">
                        Loading patient records...
                    </div>

                ) : (

                    <div className="content-grid">

                        {/* PATIENT LIST */}

                        <section className="patient-list">

                            <h2>Patients</h2>

                            {getFilteredPatients().length === 0 ? (

                                <p
                                    style={{
                                        color: "#888",
                                        fontSize: "13px",
                                    }}
                                >
                                    No patients found.
                                </p>

                            ) : (

                                getFilteredPatients().map(
                                    (patient) => (

                                        <div
                                            key={patient.id}
                                            className={`patient-item ${
                                                selectedPatient?.id ===
                                                patient.id
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
                                                Last visit:{" "}
                                                {patient.lastVisit}
                                            </small>

                                        </div>
                                    )
                                )
                            )}

                        </section>

                        {/* RECORD DETAILS */}

                        <section className="record-details">

                            {!selectedPatient ? (

                                <div className="no-patient">

                                    <div
                                        style={{
                                            fontSize: "50px",
                                        }}
                                    >
                                        🦷
                                    </div>

                                    <p>
                                        Select a patient to view their record.
                                    </p>

                                </div>

                            ) : (

                                <>

                                    {/* EDIT FORM */}

                                    {editing && (

                                        <div className="edit-form">

                                            <div className="edit-form-header">

                                                <h3>
                                                    Edit Patient Record
                                                </h3>

                                                <button
                                                    type="button"
                                                    className="close-edit-btn"
                                                    onClick={cancelEdit}
                                                    disabled={saving}
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
                                                            editData.name ||
                                                            ""
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
                                                            editData.email ||
                                                            ""
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
                                                            editData.phone ||
                                                            ""
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
                                                    type="button"
                                                    className="delete-edit-btn"
                                                    onClick={() =>
                                                        openDeleteConfirmation(
                                                            selectedPatient
                                                        )
                                                    }
                                                    disabled={saving}
                                                >
                                                    🗑️ Delete Patient
                                                </button>

                                                <button
                                                    type="button"
                                                    className="cancel-edit-btn"
                                                    onClick={cancelEdit}
                                                    disabled={saving}
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
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

                                    {/* PATIENT HEADER */}

                                    <div className="record-header">

                                        <div className="patient-profile">

                                            <div className="large-avatar">
                                                {selectedPatient.avatar ||
                                                    selectedPatient.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
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

                                        {/* EDIT + DELETE */}

                                        <div className="record-actions">

                                            <button
                                                type="button"
                                                className="edit-btn"
                                                onClick={editPatient}
                                                disabled={saving}
                                            >
                                                ✏️ Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-btn"
                                                onClick={() =>
                                                    openDeleteConfirmation(
                                                        selectedPatient
                                                    )
                                                }
                                                disabled={saving}
                                            >
                                                🗑️ Delete
                                            </button>

                                        </div>

                                    </div>

                                    {/* PERSONAL INFORMATION */}

                                    <div className="info-section">

                                        <h3>
                                            Personal Information
                                        </h3>

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

                                    {/* DENTAL INFORMATION */}

                                    <div className="info-section">

                                        <h3>
                                            Dental Information
                                        </h3>

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

                                    {/* DENTAL HISTORY */}

                                    <div className="info-section">

                                        <h3>
                                            Dental History
                                        </h3>

                                        {selectedPatient.history?.length >
                                        0 ? (

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
                                                            {
                                                                item.description
                                                            }
                                                        </p>

                                                    </div>

                                                )
                                            )

                                        ) : (

                                            <p
                                                style={{
                                                    color: "#888",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                No dental history available.
                                            </p>

                                        )}

                                    </div>

                                    {/* DENTIST NOTES */}

                                    <div className="info-section notes">

                                        <h3>
                                            Dentist Notes
                                        </h3>

                                        <textarea
                                            placeholder="Write notes about the patient's dental condition..."
                                            value={notes}
                                            onChange={(event) =>
                                                setNotes(
                                                    event.target.value
                                                )
                                            }
                                        />

                                        <br />

                                        <button
                                            type="button"
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

            {/* ==========================================
                DELETE CONFIRMATION FORM
                ========================================== */}

            {showDeleteForm && deletePatientData && (

                <div
                    className="delete-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !saving
                        ) {
                            closeDeleteConfirmation();
                        }
                    }}
                >

                    <div className="delete-modal">

                        <div className="delete-icon">
                            🗑️
                        </div>

                        <h2>
                            Delete Patient Record?
                        </h2>

                        <p className="delete-modal-description">
                            Are you sure you want to permanently
                            delete this patient's record?
                        </p>

                        {/* PATIENT INFORMATION */}

                        <div className="delete-patient-info">

                            <div className="delete-patient-info-row">

                                <span>
                                    Patient Name
                                </span>

                                <strong>
                                    {deletePatientData.name ||
                                        "Unknown Patient"}
                                </strong>

                            </div>

                            <div className="delete-patient-info-row">

                                <span>
                                    Patient ID
                                </span>

                                <strong>
                                    {deletePatientData.id}
                                </strong>

                            </div>

                            <div className="delete-patient-info-row">

                                <span>
                                    Last Service
                                </span>

                                <strong>
                                    {deletePatientData.service ||
                                        "No service"}
                                </strong>

                            </div>

                        </div>

                        {/* WARNING */}

                        <div className="delete-warning">
                            ⚠️ <strong>Warning:</strong> This action
                            will permanently remove the patient
                            record from the backend. This action
                            cannot be undone.
                        </div>

                        {/* BUTTONS */}

                        <div className="delete-modal-actions">

                            <button
                                type="button"
                                className="delete-cancel-btn"
                                onClick={closeDeleteConfirmation}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="delete-confirm-btn"
                                onClick={confirmDeletePatient}
                                disabled={saving}
                            >
                                {saving
                                    ? "Deleting..."
                                    : "Yes, Delete Patient"}
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </>
    );
}