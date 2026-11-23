
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================
// DATABASE CONNECTION - TiDB CLOUD
// ==========================================

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "dentalcare",

    ssl: {
        minVersion: "TLSv1.2"
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Validate positive integer IDs
function isValidId(id) {
    return Number.isInteger(id) && id > 0;
}

// Get today's date in Philippine time.
// Format: YYYY-MM-DD
function getPhilippineDate() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

// Validate an actual YYYY-MM-DD calendar date
function isValidDate(date) {
    if (typeof date !== "string") return false;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const [year, month, day] = date.split("-").map(Number);

    const parsed = new Date(Date.UTC(year, month - 1, day));

    return (
        parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month - 1 &&
        parsed.getUTCDate() === day
    );
}

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "DentalCare API is running!"
    });
});

// ==========================================
// DATABASE CONNECTION TEST
// ==========================================

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS connected");

        res.json({
            success: true,
            message: "TiDB database connected successfully!",
            database: rows[0]
        });

    } catch (error) {
        console.error("DATABASE CONNECTION ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed.",
            error: error.message
        });
    }
});

// ==========================================
// DENTAL SERVICES API
// Automatically detects actual TiDB column names
// ==========================================

// GET ALL SERVICES
app.get("/api/services", async (req, res) => {
    try {
        const columns = await getServiceColumns();

        const descriptionSelect = columns.description
            ? `${quoteColumn(columns.description)} AS description`
            : "NULL AS description";

        const [services] = await db.execute(`
            SELECT
                ${quoteColumn(columns.id)} AS id,
                ${quoteColumn(columns.name)} AS name,
                ${quoteColumn(columns.price)} AS price,
                ${descriptionSelect}
            FROM services
            ORDER BY ${quoteColumn(columns.id)} DESC
        `);

        res.status(200).json({
            success: true,
            services
        });

    } catch (error) {
        console.error("GET SERVICES ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve dental services.",
            error: error.message
        });
    }
});


// ADD NEW SERVICE
app.post("/api/services", async (req, res) => {
    try {
        const columns = await getServiceColumns();

        const {
            name,
            service_name,
            price,
            service_price,
            description,
            service_description
        } = req.body || {};

        const finalName = String(
            name || service_name || ""
        ).trim();

        const finalPrice = Number(
            price ?? service_price
        );

        const finalDescription = String(
            description ?? service_description ?? ""
        ).trim();

        if (!finalName) {
            return res.status(400).json({
                success: false,
                message: "Service name is required."
            });
        }

        if (
            !Number.isFinite(finalPrice) ||
            finalPrice < 0 ||
            price === "" ||
            service_price === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid service price."
            });
        }

        const insertColumns = [
            quoteColumn(columns.name),
            quoteColumn(columns.price)
        ];

        const insertValues = [finalName, finalPrice];

        if (columns.description) {
            insertColumns.push(
                quoteColumn(columns.description)
            );

            insertValues.push(finalDescription || null);
        }

        const placeholders = insertValues.map(() => "?").join(", ");

        const [result] = await db.execute(
            `INSERT INTO services (
                ${insertColumns.join(", ")}
            ) VALUES (${placeholders})`,
            insertValues
        );

        const descriptionSelect = columns.description
            ? `${quoteColumn(columns.description)} AS description`
            : "NULL AS description";

        const [savedRows] = await db.execute(
            `SELECT
                ${quoteColumn(columns.id)} AS id,
                ${quoteColumn(columns.name)} AS name,
                ${quoteColumn(columns.price)} AS price,
                ${descriptionSelect}
             FROM services
             WHERE ${quoteColumn(columns.id)} = ?
             LIMIT 1`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Dental service added successfully.",
            service: savedRows[0] || null
        });

    } catch (error) {
        console.error("ADD SERVICE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add dental service.",
            error: error.message
        });
    }
});


// UPDATE EXISTING SERVICE
app.put("/api/services/:id", async (req, res) => {
    try {
        const columns = await getServiceColumns();
        const id = Number(req.params.id);

        const {
            name,
            service_name,
            price,
            service_price,
            description,
            service_description
        } = req.body || {};

        const finalName = String(
            name || service_name || ""
        ).trim();

        const finalPrice = Number(
            price ?? service_price
        );

        const finalDescription = String(
            description ?? service_description ?? ""
        ).trim();

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID."
            });
        }

        if (!finalName) {
            return res.status(400).json({
                success: false,
                message: "Service name is required."
            });
        }

        if (
            !Number.isFinite(finalPrice) ||
            finalPrice < 0 ||
            price === "" ||
            service_price === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid service price."
            });
        }

        const [existingRows] = await db.execute(
            `SELECT ${quoteColumn(columns.id)} AS id
             FROM services
             WHERE ${quoteColumn(columns.id)} = ?
             LIMIT 1`,
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found."
            });
        }

        const updateParts = [
            `${quoteColumn(columns.name)} = ?`,
            `${quoteColumn(columns.price)} = ?`
        ];

        const updateValues = [finalName, finalPrice];

        if (columns.description) {
            updateParts.push(
                `${quoteColumn(columns.description)} = ?`
            );

            updateValues.push(finalDescription || null);
        }

        updateValues.push(id);

        await db.execute(
            `UPDATE services
             SET ${updateParts.join(", ")}
             WHERE ${quoteColumn(columns.id)} = ?`,
            updateValues
        );

        const descriptionSelect = columns.description
            ? `${quoteColumn(columns.description)} AS description`
            : "NULL AS description";

        const [updatedRows] = await db.execute(
            `SELECT
                ${quoteColumn(columns.id)} AS id,
                ${quoteColumn(columns.name)} AS name,
                ${quoteColumn(columns.price)} AS price,
                ${descriptionSelect}
             FROM services
             WHERE ${quoteColumn(columns.id)} = ?
             LIMIT 1`,
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Dental service updated successfully.",
            service: updatedRows[0]
        });

    } catch (error) {
        console.error("UPDATE SERVICE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update dental service.",
            error: error.message
        });
    }
});


// DELETE SERVICE
app.delete("/api/services/:id", async (req, res) => {
    try {
        const columns = await getServiceColumns();
        const id = Number(req.params.id);

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID."
            });
        }

        const [existingRows] = await db.execute(
            `SELECT ${quoteColumn(columns.id)} AS id
             FROM services
             WHERE ${quoteColumn(columns.id)} = ?
             LIMIT 1`,
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found."
            });
        }

        await db.execute(
            `DELETE FROM services
             WHERE ${quoteColumn(columns.id)} = ?`,
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Dental service deleted successfully."
        });

    } catch (error) {
        console.error("DELETE SERVICE ERROR:", error);

        if (
            error.code === "ER_ROW_IS_REFERENCED_2" ||
            error.code === "ER_ROW_IS_REFERENCED"
        ) {
            return res.status(409).json({
                success: false,
                message: "This service is already used in appointments and cannot be deleted."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete dental service.",
            error: error.message
        });
    }
});

// ==========================================
// PATIENTS API
// Table: patients
// ==========================================

// GET ALL PATIENTS
app.get("/api/patients", async (req, res) => {
    try {
        const [patients] = await db.execute(`
            SELECT *
            FROM patients
            ORDER BY id DESC
        `);

        res.json({
            success: true,
            patients
        });

    } catch (error) {
        console.error("GET PATIENTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve patients.",
            error: error.message
        });
    }
});

// GET PATIENT BY EMAIL
app.get("/api/patients/by-email/:email", async (req, res) => {
    try {
        const email = req.params.email;

        const [rows] = await db.execute(
            `SELECT *
             FROM patients
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        res.json({
            success: true,
            patient: rows[0]
        });

    } catch (error) {
        console.error("GET PATIENT BY EMAIL ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve patient.",
            error: error.message
        });
    }
});

// ADD PATIENT
app.post("/api/patients", async (req, res) => {
    try {
        const {
            patient_id,
            first_name,
            last_name,
            email,
            phone,
            birthdate,
            service,
            status,
            next_visit,
            last_visit,
            history,
            notes
        } = req.body || {};

        if (
            !patient_id ||
            !first_name ||
            !last_name ||
            !email
        ) {
            return res.status(400).json({
                success: false,
                message: "Patient ID, first name, last name, and email are required."
            });
        }

        const [result] = await db.execute(
            `INSERT INTO patients (
                patient_id,
                first_name,
                last_name,
                email,
                phone,
                birthdate,
                service,
                status,
                next_visit,
                last_visit,
                history,
                notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patient_id,
                first_name,
                last_name,
                email,
                phone || null,
                birthdate || null,
                service || null,
                status || "Active",
                next_visit || null,
                last_visit || null,
                history || null,
                notes || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Patient added successfully.",
            id: result.insertId,
            patient_id
        });

    } catch (error) {
        console.error("ADD PATIENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add patient.",
            error: error.message
        });
    }
});

// UPDATE PATIENT
app.put("/api/patients/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID."
            });
        }

        const {
            first_name,
            last_name,
            email,
            phone,
            birthdate,
            service,
            status,
            next_visit,
            last_visit,
            history,
            notes
        } = req.body || {};

        const [result] = await db.execute(
            `UPDATE patients SET
                first_name = ?,
                last_name = ?,
                email = ?,
                phone = ?,
                birthdate = ?,
                service = ?,
                status = ?,
                next_visit = ?,
                last_visit = ?,
                history = ?,
                notes = ?
             WHERE id = ?`,
            [
                first_name,
                last_name,
                email,
                phone || null,
                birthdate || null,
                service || null,
                status || "Active",
                next_visit || null,
                last_visit || null,
                history || null,
                notes || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            const [checkRows] = await db.execute(
                "SELECT id FROM patients WHERE id = ? LIMIT 1",
                [id]
            );

            if (checkRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Patient not found."
                });
            }
        }

        res.json({
            success: true,
            message: "Patient updated successfully."
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

// DELETE PATIENT
app.delete("/api/patients/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID."
            });
        }

        const [result] = await db.execute(
            "DELETE FROM patients WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        res.json({
            success: true,
            message: "Patient deleted successfully."
        });

    } catch (error) {
        console.error("DELETE PATIENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete patient.",
            error: error.message
        });
    }
});

// ==========================================
// PATIENT APPOINTMENTS API
// Table: appointments
// Appointment ID: AUTO_INCREMENT
// ==========================================

// GET ALL PATIENT APPOINTMENTS
app.get("/api/patient_appoint", async (req, res) => {
    try {
        const [appointments] = await db.execute(`
            SELECT
                id,
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
            FROM appointments
            ORDER BY id DESC
        `);

        res.json({
            success: true,
            appointments
        });

    } catch (error) {
        console.error("GET PATIENT APPOINTMENTS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve patient appointments.",
            error: error.message
        });
    }
});

// ADD PATIENT APPOINTMENT
app.post("/api/patient_appoint", async (req, res) => {
    try {
        const {
            patientId,
            patientName,
            serviceId,
            dentist,
            date,
            time,
            notes
        } = req.body || {};

        // Validate required fields
        if (
            !patientId ||
            !patientName ||
            !serviceId ||
            !dentist ||
            !date ||
            !time
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete all required appointment fields."
            });
        }

        const numericServiceId = Number(serviceId);

        if (!isValidId(numericServiceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID."
            });
        }

        // Validate date without timezone conversion
        if (!isValidDate(String(date))) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date."
            });
        }

        // Prevent booking in the past using Philippine date
        if (String(date) < getPhilippineDate()) {
            return res.status(400).json({
                success: false,
                message: "You cannot book an appointment in the past."
            });
        }

        // Validate appointment time
        const allowedTimes = [
            "9:00 AM",
            "10:00 AM",
            "11:00 AM",
            "1:00 PM",
            "2:00 PM",
            "3:00 PM",
            "4:00 PM"
        ];

        if (!allowedTimes.includes(time)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment time."
            });
        }

        // Verify patient using patient code
        const [patientRows] = await db.execute(
            `SELECT patient_id, first_name, last_name
             FROM patients
             WHERE patient_id = ?
             LIMIT 1`,
            [patientId]
        );

        if (patientRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found. Please log in again."
            });
        }

        const patient = patientRows[0];

        const actualPatientName =
            `${patient.first_name} ${patient.last_name}`.trim();

        if (
            actualPatientName.toLowerCase() !==
            String(patientName).trim().toLowerCase()
        ) {
            return res.status(400).json({
                success: false,
                message: "Patient information does not match."
            });
        }

        // Verify selected service
        const [serviceRows] = await db.execute(
            `SELECT id, name, price
             FROM services
             WHERE id = ?
             LIMIT 1`,
            [numericServiceId]
        );

        if (serviceRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Selected dental service was not found."
            });
        }

        const selectedService = serviceRows[0];

        // Check if dentist already has an active appointment
        const [existingAppointments] = await db.execute(
            `SELECT id
             FROM appointments
             WHERE dentist = ?
               AND appointment_date = ?
               AND appointment_time = ?
               AND LOWER(status) NOT IN ('cancelled', 'completed')
             LIMIT 1`,
            [
                dentist,
                date,
                time
            ]
        );

        if (existingAppointments.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This dentist already has an appointment at that date and time. Please choose another slot."
            });
        }

        // Insert appointment.
        // TiDB generates the appointment ID automatically.
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
                patient.patient_id,
                selectedService.id,
                actualPatientName,
                selectedService.name,
                selectedService.price,
                dentist,
                date,
                time,
                "Pending",
                notes || null
            ]
        );

        // Retrieve the new appointment
        const [newAppointmentRows] = await db.execute(
            `SELECT
                id,
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
             FROM appointments
             WHERE id = ?
             LIMIT 1`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            appointment: newAppointmentRows[0]
        });

    } catch (error) {
        console.error("ADD PATIENT APPOINTMENT ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to book appointment.",
            error: error.message
        });
    }
});

// ==========================================
// UPDATE APPOINTMENT STATUS
// ==========================================

app.put("/api/patient_appoint/:id/status", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { status } = req.body || {};

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment ID."
            });
        }

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Cancelled",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment status."
            });
        }

        const [appointmentRows] = await db.execute(
            `SELECT id, status
             FROM appointments
             WHERE id = ?
             LIMIT 1`,
            [id]
        );

        if (appointmentRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        const currentStatus = String(
            appointmentRows[0].status
        ).toLowerCase();

        if (
            ["cancelled", "completed"].includes(currentStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "This appointment can no longer be updated."
            });
        }

        await db.execute(
            `UPDATE appointments
             SET status = ?
             WHERE id = ?`,
            [status, id]
        );

        const [updatedRows] = await db.execute(
            `SELECT
                id,
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
             FROM appointments
             WHERE id = ?
             LIMIT 1`,
            [id]
        );

        res.json({
            success: true,
            message: "Appointment status updated successfully.",
            appointment: updatedRows[0]
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

// ==========================================
// INVALID ROUTE HANDLER
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
    try {
        await db.query("SELECT 1");

        console.log("==================================");
        console.log("DentalCare Backend");
        console.log("TiDB Database: Connected");
        console.log("Patients API: /api/patients");
        console.log("Services API: /api/services");
        console.log("Appointments API: /api/patient_appoint");
        console.log("==================================");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Unable to connect to TiDB:", error);
        process.exit(1);
    }
}

startServer();
