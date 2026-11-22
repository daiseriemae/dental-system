
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 8080;

// DATABASE CONNECTION
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

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// TEST DATABASE CONNECTION
async function connectDatabase() {
    try {
        const connection = await db.getConnection();
        console.log("Connected to TiDB Cloud database!");
        connection.release();
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

connectDatabase();

// HOME ROUTE
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "DentalCare API is running"
    });
});

// TEST ROUTE
app.get("/api/test", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({
            success: true,
            message: "Backend and database are connected"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// SERVICES
// ========================================

// GET ALL SERVICES
app.get("/api/services", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, service_name, price, description FROM services ORDER BY id ASC"
        );

        res.json(rows);
    } catch (error) {
        console.error("Get services error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load services",
            error: error.message
        });
    }
});

// ADD SERVICE
app.post("/api/services", async (req, res) => {
    try {
        const { service_name, price, description } = req.body;

        if (!service_name || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: "Service name and price are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO services (service_name, price, description)
             VALUES (?, ?, ?)`,
            [
                service_name.trim(),
                Number(price),
                description || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Service added successfully",
            id: result.insertId
        });
    } catch (error) {
        console.error("Add service error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add service",
            error: error.message
        });
    }
});

// UPDATE SERVICE
app.put("/api/services/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { service_name, price, description } = req.body;

        if (!service_name || price === undefined || price === null) {
            return res.status(400).json({
                success: false,
                message: "Service name and price are required"
            });
        }

        const [result] = await db.query(
            `UPDATE services
             SET service_name = ?, price = ?, description = ?
             WHERE id = ?`,
            [
                service_name.trim(),
                Number(price),
                description || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        res.json({
            success: true,
            message: "Service updated successfully"
        });
    } catch (error) {
        console.error("Update service error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update service",
            error: error.message
        });
    }
});

// DELETE SERVICE
app.delete("/api/services/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM services WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        res.json({
            success: true,
            message: "Service deleted successfully"
        });
    } catch (error) {
        console.error("Delete service error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete service",
            error: error.message
        });
    }
});

// ========================================
// PATIENT LOOKUP
// ========================================

// GET PATIENT USING EMAIL
app.get("/api/patients/by-email/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).trim();

        const [rows] = await db.query(
            `SELECT *
             FROM patients
             WHERE LOWER(email) = LOWER(?)
             LIMIT 1`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient record not found"
            });
        }

        res.json({
            success: true,
            patient: rows[0]
        });
    } catch (error) {
        console.error("Patient lookup error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to find patient",
            error: error.message
        });
    }
});

// ========================================
// APPOINTMENTS
// ========================================

function normalizeTime(time) {
    if (!time) return null;

    const value = String(time).trim();

    // Convert 9:00 AM / 2:30 PM to MySQL TIME format
    const twelveHour = value.match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

    if (twelveHour) {
        let hours = Number(twelveHour[1]);
        const minutes = Number(twelveHour[2]);
        const period = twelveHour[3].toUpperCase();

        if (hours < 1 || hours > 12 || minutes > 59) {
            return null;
        }

        if (period === "AM" && hours === 12) hours = 0;
        if (period === "PM" && hours !== 12) hours += 12;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
    }

    // Accept HH:mm or HH:mm:ss
    if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) {
        return value.length === 5 ? `${value}:00` : value;
    }

    return null;
}

// CREATE APPOINTMENT
async function createAppointment(req, res) {
    try {
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
                message: "Patient ID, service, dentist, date, and time are required"
            });
        }

        // Preserve the existing patient_id from the patients table.
        const existingPatientId = String(patientId).trim();

        if (!/^P-[A-Za-z0-9-]+$/.test(existingPatientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID format"
            });
        }

        // Verify that this patient exists.
        const [patients] = await db.query(
            "SELECT patient_id, first_name, last_name FROM patients WHERE patient_id = ? LIMIT 1",
            [existingPatientId]
        );

        if (patients.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient ID does not exist in the patients table"
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date. Use YYYY-MM-DD."
            });
        }

        const appointmentTime = normalizeTime(time);

        if (!appointmentTime) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment time"
            });
        }

        let serviceName = String(service).trim();
        let servicePrice = Number(price) || 0;
        let selectedServiceId = null;

        // Verify selected service against the services table.
        if (serviceId !== undefined && serviceId !== null && serviceId !== "") {
            const [services] = await db.query(
                `SELECT id, service_name, price
                 FROM services
                 WHERE id = ?
                 LIMIT 1`,
                [serviceId]
            );

            if (services.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Selected dental service was not found"
                });
            }

            selectedServiceId = services[0].id;
            serviceName = services[0].service_name;
            servicePrice = Number(services[0].price);
        }

        if (!Number.isFinite(servicePrice) || servicePrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid service price"
            });
        }

        const fullName =
            `${patients[0].first_name || ""} ${patients[0].last_name || ""}`.trim();

        const finalPatientName = fullName || patientName || "Patient";

        const [result] = await db.query(
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
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                existingPatientId,
                selectedServiceId,
                finalPatientName,
                serviceName,
                servicePrice,
                String(dentist).trim(),
                date,
                appointmentTime,
                "Pending",
                notes ? String(notes).trim() : null
            ]
        );

        const [savedAppointment] = await db.query(
            "SELECT * FROM appointments WHERE id = ?",
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            appointment: savedAppointment[0]
        });
    } catch (error) {
        console.error("CREATE APPOINTMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to book appointment",
            error: error.message,
            code: error.code || null
        });
    }
}

// GET ALL APPOINTMENTS
async function getAppointments(req, res) {
    try {
        const [rows] = await db.query(
            `SELECT *
             FROM appointments
             ORDER BY appointment_date DESC, appointment_time DESC`
        );

        res.json(rows);
    } catch (error) {
        console.error("Get appointments error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load appointments",
            error: error.message
        });
    }
}

// UPDATE APPOINTMENT STATUS
async function updateAppointmentStatus(req, res) {
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
                message: "Invalid appointment status"
            });
        }

        const [result] = await db.query(
            "UPDATE appointments SET status = ? WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.json({
            success: true,
            message: "Appointment status updated successfully"
        });
    } catch (error) {
        console.error("Update appointment status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update appointment status",
            error: error.message
        });
    }
}

// PATIENT APPOINTMENT ROUTES
app.get("/api/patient_appoint", getAppointments);
app.post("/api/patient_appoint", createAppointment);
app.put("/api/patient_appoint/:id/status", updateAppointmentStatus);

// DENTIST APPOINTMENT ROUTES
app.get("/api/dentist_appoint", getAppointments);
app.post("/api/dentist_appoint", createAppointment);
app.put("/api/dentist_appoint/:id/status", updateAppointmentStatus);

// START SERVER
app.listen(PORT, () => {
    console.log(`DentalCare server running on port ${PORT}`);
});
