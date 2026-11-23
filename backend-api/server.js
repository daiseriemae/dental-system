require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 8080;

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "dentalcare",
    ssl: { minVersion: "TLSv1.2" },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ==================================================
// MIDDLEWARE AND DATABASE
// ==================================================

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

function logBlock(title, data) {
    console.log("\n========================================");
    console.log(title);
    console.log(JSON.stringify(data, null, 2));
    console.log("========================================\n");
}

async function connectDatabase() {
    try {
        const connection = await db.getConnection();
        console.log("TiDB Cloud Connected Successfully");
        connection.release();
    } catch (error) {
        console.error("TiDB Cloud Connection Failed:", error.message);
    }
}

connectDatabase();

// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {
    res.send("DentalCare API is running.");
});

// ==================================================
// SERVICES
// ==================================================

// GET ALL SERVICES
app.get("/api/services", async (req, res) => {
    try {
        const [services] = await db.query("SELECT * FROM services");
        res.json(services);
    } catch (error) {
        console.error("Get services error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve services.",
            error: error.message
        });
    }
});

// ADD SERVICE
app.post("/api/services", async (req, res) => {
    try {
        const { name, price, description = "" } = req.body;
        const numericPrice = Number(price);

        if (
            !String(name || "").trim() ||
            price === undefined ||
            price === "" ||
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "A service name and valid price are required."
            });
        }

        const [result] = await db.execute(
            `INSERT INTO services (name, price, description)
             VALUES (?, ?, ?)`,
            [String(name).trim(), numericPrice, String(description || "")]
        );

        const [rows] = await db.execute(
            "SELECT * FROM services WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Service added successfully.",
            service: rows[0]
        });
    } catch (error) {
        console.error("Add service error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add service.",
            error: error.message
        });
    }
});

// UPDATE SERVICE
app.put("/api/services/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;

        const [existing] = await db.execute(
            "SELECT * FROM services WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found."
            });
        }

        const updates = [];
        const values = [];

        if (name !== undefined) {
            if (!String(name).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Service name cannot be empty."
                });
            }
            updates.push("name = ?");
            values.push(String(name).trim());
        }

        if (price !== undefined) {
            const numericPrice = Number(price);
            if (
                price === "" ||
                !Number.isFinite(numericPrice) ||
                numericPrice < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Enter a valid non-negative price."
                });
            }
            updates.push("price = ?");
            values.push(numericPrice);
        }

        if (description !== undefined) {
            updates.push("description = ?");
            values.push(String(description || ""));
        }

        if (updates.length > 0) {
            values.push(id);
            await db.execute(
                `UPDATE services SET ${updates.join(", ")} WHERE id = ?`,
                values
            );
        }

        const [updated] = await db.execute(
            "SELECT * FROM services WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Service updated successfully.",
            service: updated[0]
        });
    } catch (error) {
        console.error("Update service error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update service.",
            error: error.message
        });
    }
});

// DELETE SERVICE
app.delete("/api/services/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.execute(
            "SELECT * FROM services WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found."
            });
        }

        await db.execute("DELETE FROM services WHERE id = ?", [id]);

        res.json({
            success: true,
            message: "Service deleted successfully.",
            service: existing[0]
        });
    } catch (error) {
        console.error("Delete service error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete service. It may be linked to an appointment.",
            error: error.message
        });
    }
});

// ==================================================
// APPOINTMENTS
// ==================================================

function convertTime(value) {
    const input = String(value || "").trim();

    const match = input.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (match) {
        let hours = Number(match[1]);
        const minutes = Number(match[2]);
        const period = match[3].toUpperCase();

        if (hours < 1 || hours > 12 || minutes > 59) {
            return null;
        }

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
    }

    if (/^\d{2}:\d{2}$/.test(input)) {
        const [hours, minutes] = input.split(":").map(Number);
        if (hours > 23 || minutes > 59) return null;
        return `${input}:00`;
    }

    if (/^\d{2}:\d{2}:\d{2}$/.test(input)) {
        const [hours, minutes, seconds] = input.split(":").map(Number);
        if (hours > 23 || minutes > 59 || seconds > 59) return null;
        return input;
    }

    return null;
}

// CREATE APPOINTMENT
async function createAppointment(req, res) {
    try {
        console.log("APPOINTMENT REQUEST:", req.body);

        // These names match your React PatientAppointment.jsx form.
        const {
            patientId,
            patientName,
            service,
            serviceId,
            price,
            dentist,
            date,
            time,
            notes
        } = req.body;

        if (!patientId || !service || !dentist || !date || !time) {
            return res.status(400).json({
                success: false,
                message: "Please complete all required appointment fields."
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date. Use YYYY-MM-DD."
            });
        }

        const appointmentTime = convertTime(time);

        if (!appointmentTime) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment time."
            });
        }

        let selectedServiceId = null;
        let serviceName = String(service).trim();
        let servicePrice = Number(price);

        // Get the actual service name and price from the database.
        if (serviceId !== undefined && serviceId !== null && serviceId !== "") {
            const [services] = await db.execute(
                "SELECT * FROM services WHERE id = ? LIMIT 1",
                [serviceId]
            );

            if (services.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "The selected service was not found."
                });
            }

            const selectedService = services[0];

            selectedServiceId = selectedService.id;
            serviceName =
                selectedService.service_name ||
                selectedService.name ||
                selectedService.service ||
                serviceName;
            servicePrice = Number(selectedService.price);
        }

        if (!Number.isFinite(servicePrice) || servicePrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid service price."
            });
        }

        const [result] = await db.execute(
            `INSERT INTO appointments (
                patient_id,
                service_id,
                patient_name,
                service,
                price,
                dentist,
                appointment_date,
                appointment_time,
                status,
                notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                String(patientId),
                selectedServiceId,
                String(patientName || ""),
                serviceName,
                servicePrice,
                String(dentist).trim(),
                String(date),
                appointmentTime,
                "Pending",
                String(notes || "").trim()
            ]
        );

        const [saved] = await db.execute(
            "SELECT * FROM appointments WHERE id = ? LIMIT 1",
            [result.insertId]
        );

        logBlock("APPOINTMENT CREATED", saved[0] || {
            insertId: result.insertId
        });

        return res.status(201).json({
            success: true,
            message: "Appointment submitted successfully!",
            appointment: saved[0] || null
        });
    } catch (error) {
        console.error("CREATE APPOINTMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit appointment.",
            error: error.message
        });
    }
}

// GET ALL APPOINTMENTS
app.get("/api/patient_appoint", async (req, res) => {
    try {
        const [appointments] = await db.execute(
            `SELECT * FROM appointments
             ORDER BY appointment_date DESC, appointment_time DESC`
        );

        res.json(appointments);
    } catch (error) {
        console.error("GET APPOINTMENTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve appointments.",
            error: error.message
        });
    }
});

// SUBMIT APPOINTMENT
app.post("/api/patient_appoint", createAppointment);

// UPDATE APPOINTMENT STATUS
app.put("/api/patient_appoint/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment status."
            });
        }

        const [result] = await db.execute(
            "UPDATE appointments SET status = ? WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        res.json({
            success: true,
            message: "Appointment status updated successfully."
        });
    } catch (error) {
        console.error("UPDATE APPOINTMENT STATUS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update appointment status.",
            error: error.message
        });
    }
});

// ==================================================
// PATIENTS
// ==================================================

let patientColumnsCache = null;

async function getPatientColumns() {
    if (patientColumnsCache) return patientColumnsCache;

    const [columns] = await db.query("SHOW COLUMNS FROM patients");
    patientColumnsCache = columns.map(column => column.Field);

    return patientColumnsCache;
}

function findPatientColumn(columns, possibleNames) {
    return possibleNames.find(name => columns.includes(name)) || null;
}

function formatPatientDate(value) {
    if (!value) return "";
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
}

function formatPatient(patient, columns) {
    const firstNameColumn = findPatientColumn(columns, ["first_name", "firstName"]);
    const lastNameColumn = findPatientColumn(columns, ["last_name", "lastName"]);
    const nameColumn = findPatientColumn(columns, ["name", "full_name", "patient_name"]);

    const firstName = firstNameColumn ? patient[firstNameColumn] || "" : "";
    const lastName = lastNameColumn ? patient[lastNameColumn] || "" : "";

    const fullName =
        (nameColumn && patient[nameColumn]) ||
        `${firstName} ${lastName}`.trim();

    const patientCodeColumn = findPatientColumn(columns, ["patient_id", "patient_code"]);
    const phoneColumn = findPatientColumn(columns, ["phone", "contact", "phone_number"]);
    const birthdateColumn = findPatientColumn(columns, ["birthdate", "birth_date", "date_of_birth"]);
    const serviceColumn = findPatientColumn(columns, ["service", "last_service", "service_name"]);
    const statusColumn = findPatientColumn(columns, ["status", "dental_status"]);
    const nextVisitColumn = findPatientColumn(columns, ["next_visit", "nextVisit"]);
    const lastVisitColumn = findPatientColumn(columns, ["last_visit", "lastVisit"]);
    const historyColumn = findPatientColumn(columns, ["history", "dental_history"]);
    const notesColumn = findPatientColumn(columns, ["notes", "dentist_notes"]);

    let history = [];

    if (historyColumn && patient[historyColumn]) {
        try {
            history = typeof patient[historyColumn] === "string"
                ? JSON.parse(patient[historyColumn])
                : patient[historyColumn];

            if (!Array.isArray(history)) history = [];
        } catch {
            history = [];
        }
    }

    return {
        id: patient.id,
        patientCode: patientCodeColumn
            ? patient[patientCodeColumn]
            : patient.id,
        name: fullName || "Unnamed Patient",
        email: patient.email || "",
        phone: phoneColumn ? patient[phoneColumn] || "" : "",
        birthdate: birthdateColumn
            ? formatPatientDate(patient[birthdateColumn])
            : "",
        service: serviceColumn ? patient[serviceColumn] || "" : "",
        status: statusColumn ? patient[statusColumn] || "" : "",
        nextVisit: nextVisitColumn
            ? formatPatientDate(patient[nextVisitColumn])
            : "",
        lastVisit: lastVisitColumn
            ? formatPatientDate(patient[lastVisitColumn])
            : "",
        history,
        notes: notesColumn ? patient[notesColumn] || "" : "",
        avatar: fullName ? fullName.charAt(0).toUpperCase() : "P"
    };
}

// REGISTER PATIENT
app.post("/api/patients", async (req, res) => {
    try {
        const firstName = String(req.body.firstName || "").trim();
        const lastName = String(req.body.lastName || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const phone = String(req.body.phone || "").trim();

        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                message: "First name, last name, and email are required."
            });
        }

        const [existing] = await db.execute(
            "SELECT * FROM patients WHERE LOWER(email) = ? LIMIT 1",
            [email]
        );

        const columns = await getPatientColumns();

        if (existing.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Patient already registered.",
                patient: formatPatient(existing[0], columns)
            });
        }

        const patientCode = `P-${Date.now()}`;

        const [result] = await db.execute(
            `INSERT INTO patients
                (patient_id, first_name, last_name, email, phone, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [patientCode, firstName, lastName, email, phone, "Active"]
        );

        const [rows] = await db.execute(
            "SELECT * FROM patients WHERE id = ?",
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Patient registered successfully.",
            patient: formatPatient(rows[0], columns)
        });
    } catch (error) {
        console.error("REGISTER PATIENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to register patient.",
            error: error.message
        });
    }
});

// GET PATIENT BY EMAIL
app.get("/api/patients/by-email/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email)
            .trim()
            .toLowerCase();

        const [rows] = await db.execute(
            `SELECT * FROM patients
             WHERE LOWER(email) = ?
             LIMIT 1`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient record not found."
            });
        }

        res.json({
            success: true,
            patient: rows[0]
        });
    } catch (error) {
        console.error("PATIENT LOOKUP ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve patient.",
            error: error.message
        });
    }
});

// GET ALL PATIENTS
app.get("/api/patients", async (req, res) => {
    try {
        const columns = await getPatientColumns();

        if (!columns.includes("id")) {
            return res.status(500).json({
                success: false,
                message: "The patients table must have an id column."
            });
        }

        const [patients] = await db.execute(
            "SELECT * FROM patients ORDER BY id DESC"
        );

        res.json(patients.map(patient => formatPatient(patient, columns)));
    } catch (error) {
        console.error("GET PATIENTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve patients.",
            error: error.message
        });
    }
});

// GET ONE PATIENT
app.get("/api/patients/:id", async (req, res) => {
    try {
        const columns = await getPatientColumns();

        const [patients] = await db.execute(
            "SELECT * FROM patients WHERE id = ?",
            [req.params.id]
        );

        if (patients.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        res.json(formatPatient(patients[0], columns));
    } catch (error) {
        console.error("GET ONE PATIENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve patient.",
            error: error.message
        });
    }
});

// UPDATE PATIENT
app.put("/api/patients/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const columns = await getPatientColumns();

        const [existing] = await db.execute(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        const patient = existing[0];
        const updates = [];
        const values = [];

        function addUpdate(column, value) {
            if (!column || !columns.includes(column)) return;

            if (String(patient[column] ?? "") !== String(value ?? "")) {
                updates.push(`\`${column}\` = ?`);
                values.push(value === "" ? null : value);
            }
        }

        if (req.body.name !== undefined) {
            const fullName = String(req.body.name).trim();

            const nameColumn = findPatientColumn(
                columns,
                ["name", "full_name", "patient_name"]
            );

            if (nameColumn) addUpdate(nameColumn, fullName);

            const firstNameColumn = findPatientColumn(columns, ["first_name", "firstName"]);
            const lastNameColumn = findPatientColumn(columns, ["last_name", "lastName"]);

            if (firstNameColumn || lastNameColumn) {
                const parts = fullName.split(/\s+/);
                const firstName = parts.shift() || "";
                const lastName = parts.join(" ");

                addUpdate(firstNameColumn, firstName);
                addUpdate(lastNameColumn, lastName);
            }
        }

        const fieldMappings = {
            email: ["email"],
            phone: ["phone", "contact", "phone_number"],
            birthdate: ["birthdate", "birth_date", "date_of_birth"],
            service: ["service", "last_service", "service_name"],
            status: ["status", "dental_status"],
            nextVisit: ["next_visit", "nextVisit"]
        };

        for (const [requestField, possibleColumns] of Object.entries(fieldMappings)) {
            if (req.body[requestField] === undefined) continue;

            const column = findPatientColumn(columns, possibleColumns);
            if (column) addUpdate(column, req.body[requestField]);
        }

        if (updates.length === 0) {
            return res.json({
                success: true,
                message: "No supported patient changes were detected.",
                patient: formatPatient(patient, columns)
            });
        }

        values.push(id);

        await db.execute(
            `UPDATE patients SET ${updates.join(", ")} WHERE id = ?`,
            values
        );

        const [updated] = await db.execute(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        const formattedPatient = formatPatient(updated[0], columns);
        logBlock("PATIENT UPDATED", formattedPatient);

        res.json({
            success: true,
            message: "Patient updated successfully.",
            patient: formattedPatient
        });
    } catch (error) {
        console.error("UPDATE PATIENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update patient.",
            error: error.message
        });
    }
});

// UPDATE PATIENT NOTES
app.put("/api/patients/:id/notes", async (req, res) => {
    try {
        const id = req.params.id;
        const columns = await getPatientColumns();

        const notesColumn = findPatientColumn(columns, ["notes", "dentist_notes"]);

        if (!notesColumn) {
            return res.status(400).json({
                success: false,
                message: "Your patients table does not have a notes column."
            });
        }

        const [existing] = await db.execute(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        await db.execute(
            `UPDATE patients SET \`${notesColumn}\` = ? WHERE id = ?`,
            [String(req.body.notes ?? ""), id]
        );

        const [updated] = await db.execute(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        const formattedPatient = formatPatient(updated[0], columns);
        logBlock("PATIENT NOTES UPDATED", { id, notes: req.body.notes });

        res.json({
            success: true,
            message: "Patient notes updated successfully.",
            patient: formattedPatient
        });
    } catch (error) {
        console.error("UPDATE PATIENT NOTES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update patient notes.",
            error: error.message
        });
    }
});

// DELETE PATIENT
app.delete("/api/patients/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const columns = await getPatientColumns();

        const [existing] = await db.execute(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        await db.execute("DELETE FROM patients WHERE id = ?", [id]);

        const deletedPatient = formatPatient(existing[0], columns);
        logBlock("PATIENT DELETED", deletedPatient);

        res.json({
            success: true,
            message: "Patient deleted successfully.",
            patient: deletedPatient
        });
    } catch (error) {
        console.error("DELETE PATIENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete patient. It may be linked to an appointment.",
            error: error.message
        });
    }
});

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, "0.0.0.0", () => {
    console.log("========================================");
    console.log("DentalCare API is running.");
    console.log("https://dental-system-rzqb.onrender.com");
    console.log("Services:     /api/services");
    console.log("Appointments: /api/patient_appoint");
    console.log("Patients:     /api/patients");
    console.log("========================================");
});