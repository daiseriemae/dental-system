
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "dentalcare_db"
});

async function connectDatabase() {
    try {
        const connection = await db.getConnection();
        console.log("Database Connected");
        connection.release();
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

connectDatabase();

app.use((req, res, next) => {
    console.log(`\n${req.method} ${req.originalUrl}`);
    next();
});

function logBlock(title, data) {
    console.log("\n========================================");
    console.log(title);
    console.log(JSON.stringify(data, null, 2));
    console.log("========================================\n");
}

app.get("/", (req, res) => {
    res.send("DentalCare API is running.");
});


app.get("/api/services", async (req, res) => {
    try {
        const [services] = await db.query(
            "SELECT * FROM services"
        );

        res.json(services);
    } catch (error) {
        console.error("Get services error:", error.message);
        res.status(500).json({ message: "Failed to retrieve services." });
    }
});


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
                message: "A service name and valid price are required."
            });
        }

        const [result] = await db.query(
            "INSERT INTO services (name, price, description) VALUES (?, ?, ?)",
            [String(name).trim(), numericPrice, String(description || "")]
        );

        const [rows] = await db.query(
            "SELECT * FROM services WHERE id = ?",
            [result.insertId]
        );

        logBlock("SERVICE ADDED", rows[0]);

        res.status(201).json({
            message: "Service added successfully.",
            service: rows[0]
        });
    } catch (error) {
        console.error("Add service error:", error.message);
        res.status(500).json({ message: "Failed to add service." });
    }
});

app.put("/api/services/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { name, price, description } = req.body;

        const [existing] = await db.query(
            "SELECT * FROM services WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Service not found." });
        }

        const service = existing[0];
        const changed = {};
        const updates = [];
        const values = [];

        if (name !== undefined) {
            if (!String(name).trim()) {
                return res.status(400).json({
                    message: "Service name cannot be empty."
                });
            }

            if (String(name).trim() !== service.name) {
                updates.push("name = ?");
                values.push(String(name).trim());
                changed.name = String(name).trim();
            }
        }

        if (price !== undefined) {
            const numericPrice = Number(price);

            if (
                price === "" ||
                !Number.isFinite(numericPrice) ||
                numericPrice < 0
            ) {
                return res.status(400).json({
                    message: "Enter a valid non-negative price."
                });
            }

            if (numericPrice !== Number(service.price)) {
                updates.push("price = ?");
                values.push(numericPrice);
                changed.price = numericPrice;
            }
        }

        if (description !== undefined) {
            const newDescription = String(description || "");

            if (newDescription !== String(service.description || "")) {
                updates.push("description = ?");
                values.push(newDescription);
                changed.description = newDescription;
            }
        }

        if (updates.length > 0) {
            values.push(id);

            await db.query(
                `UPDATE services SET ${updates.join(", ")} WHERE id = ?`,
                values
            );

            logBlock("SERVICE UPDATED — CHANGED FIELDS ONLY", {
                id,
                ...changed
            });
        }

        const [updated] = await db.query(
            "SELECT * FROM services WHERE id = ?",
            [id]
        );

        res.json({
            message: "Service updated successfully.",
            service: updated[0]
        });
    } catch (error) {
        console.error("Update service error:", error.message);
        res.status(500).json({ message: "Failed to update service." });
    }
});

// DELETE SERVICE
app.delete("/api/services/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const [existing] = await db.query(
            "SELECT * FROM services WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Service not found." });
        }

        await db.query(
            "DELETE FROM services WHERE id = ?",
            [id]
        );

        logBlock("SERVICE DELETED", existing[0]);

        res.json({
            message: "Service deleted successfully.",
            service: existing[0]
        });
    } catch (error) {
        console.error("Delete service error:", error.message);
        res.status(500).json({
            message: "Failed to delete service. Check whether appointments reference it."
        });
    }
});

// ==================================================
// APPOINTMENTS
// MySQL table: appointments
// ==================================================

// GET APPOINTMENTS
async function listAppointments(req, res) {
    try {
        const [appointments] = await db.query(
            "SELECT * FROM appointments ORDER BY id DESC"
        );

        res.json(appointments);
    } catch (error) {
        console.error("Get appointments error:", error.message);
        res.status(500).json({ message: "Failed to retrieve appointments." });
    }
}

app.get("/api/appointment", listAppointments);
app.get("/api/appointments", listAppointments);

// ADD APPOINTMENT
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
                message: "Please complete all required appointment fields."
            });
        }

        let serviceName = String(service);
        let servicePrice = price === undefined || price === ""
            ? null
            : Number(price);

        let selectedServiceId = null;

        if (serviceId !== undefined && serviceId !== null && serviceId !== "") {
            const [services] = await db.query(
                "SELECT * FROM services WHERE id = ?",
                [serviceId]
            );

            if (services.length === 0) {
                return res.status(400).json({
                    message: "The selected service does not exist."
                });
            }

            selectedServiceId = services[0].id;
            serviceName = services[0].name;
            servicePrice = Number(services[0].price);
        }

        const [result] = await db.query(
            `INSERT INTO appointments
            (patient_id, patient_name, service, service_id, price,
             dentist, date, time, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                String(patientId),
                String(patientName || ""),
                serviceName,
                selectedServiceId,
                servicePrice,
                String(dentist),
                String(date),
                String(time),
                String(notes || ""),
                "Pending"
            ]
        );

        const [rows] = await db.query(
            "SELECT * FROM appointments WHERE id = ?",
            [result.insertId]
        );

        logBlock("NEW APPOINTMENT CREATED", rows[0]);

        res.status(201).json({
            message: "Appointment created successfully.",
            appointment: rows[0]
        });
    } catch (error) {
        console.error("Create appointment error:", error.message);
        res.status(500).json({ message: "Failed to create appointment." });
    }
}

app.post("/api/appointment", createAppointment);
app.post("/api/appointments", createAppointment);

// UPDATE APPOINTMENT STATUS
async function updateAppointmentStatus(req, res) {
    try {
        const { status } = req.body;
        const id = req.params.id;
        const allowed = ["Pending", "Confirmed", "Completed", "Cancelled"];

        if (!allowed.includes(status)) {
            return res.status(400).json({
                message: "Invalid appointment status."
            });
        }

        const [existing] = await db.query(
            "SELECT * FROM appointments WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        if (
            existing[0].status === "Completed" ||
            existing[0].status === "Cancelled"
        ) {
            return res.status(400).json({
                message: "This appointment can no longer be updated."
            });
        }

        if (existing[0].status !== status) {
            await db.query(
                "UPDATE appointments SET status = ? WHERE id = ?",
                [status, id]
            );

            logBlock("APPOINTMENT STATUS UPDATED", {
                id,
                status
            });
        }

        const [updated] = await db.query(
            "SELECT * FROM appointments WHERE id = ?",
            [id]
        );

        res.json({
            message: "Appointment status updated successfully.",
            appointment: updated[0]
        });
    } catch (error) {
        console.error("Update appointment error:", error.message);
        res.status(500).json({
            message: "Failed to update appointment status."
        });
    }
}

app.put("/api/appointment/:id/status", updateAppointmentStatus);
app.put("/api/appointments/:id/status", updateAppointmentStatus);

// ==================================================
// PATIENTS
// MySQL table: patients
// ==================================================

// GET ALL PATIENTS
app.get("/api/patients", async (req, res) => {
    try {
        const [patients] = await db.query(
            "SELECT * FROM patients ORDER BY id"
        );

        res.json(patients);
    } catch (error) {
        console.error("Get patients error:", error.message);
        res.status(500).json({ message: "Failed to retrieve patients." });
    }
});

// GET ONE PATIENT
app.get("/api/patients/:id", async (req, res) => {
    try {
        const [patients] = await db.query(
            "SELECT * FROM patients WHERE id = ?",
            [req.params.id]
        );

        if (patients.length === 0) {
            return res.status(404).json({ message: "Patient not found." });
        }

        res.json(patients[0]);
    } catch (error) {
        console.error("Get patient error:", error.message);
        res.status(500).json({ message: "Failed to retrieve patient." });
    }
});

// UPDATE PATIENT — log only changed fields
app.put("/api/patients/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const fields = [
            "firstName", "lastName", "name", "age", "gender",
            "contact", "email", "address", "notes"
        ];

        const [existing] = await db.query(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Patient not found." });
        }

        const patient = existing[0];
        const changed = {};
        const updates = [];
        const values = [];

        for (const field of fields) {
            if (req.body[field] === undefined) continue;

            const newValue = req.body[field];

            if (String(newValue ?? "") !== String(patient[field] ?? "")) {
                updates.push(`\`${field}\` = ?`);
                values.push(newValue ?? "");
                changed[field] = newValue ?? "";
            }
        }

        if (
            req.body.firstName !== undefined ||
            req.body.lastName !== undefined
        ) {
            const firstName = req.body.firstName ?? patient.firstName ?? "";
            const lastName = req.body.lastName ?? patient.lastName ?? "";
            const fullName = `${firstName} ${lastName}`.trim();

            if (fullName !== String(patient.name || "")) {
                const nameIndex = updates.findIndex(item => item === "`name` = ?");

                if (nameIndex >= 0) {
                    values[nameIndex] = fullName;
                } else {
                    updates.push("`name` = ?");
                    values.push(fullName);
                }

                changed.name = fullName;
            }
        }

        if (updates.length > 0) {
            values.push(id);

            await db.query(
                `UPDATE patients SET ${updates.join(", ")} WHERE id = ?`,
                values
            );

            logBlock("PATIENT UPDATED — CHANGED FIELDS ONLY", {
                id,
                ...changed
            });
        }

        const [updated] = await db.query(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        res.json({
            message: "Patient updated successfully.",
            patient: updated[0]
        });
    } catch (error) {
        console.error("Update patient error:", error.message);
        res.status(500).json({ message: "Failed to update patient." });
    }
});

// UPDATE PATIENT NOTES
app.put("/api/patients/:id/notes", async (req, res) => {
    try {
        const id = req.params.id;
        const notes = String(req.body.notes || "");

        const [existing] = await db.query(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Patient not found." });
        }

        if (String(existing[0].notes || "") !== notes) {
            await db.query(
                "UPDATE patients SET notes = ? WHERE id = ?",
                [notes, id]
            );

            logBlock("PATIENT NOTES UPDATED", { id, notes });
        }

        const [updated] = await db.query(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        res.json({
            message: "Patient notes updated successfully.",
            patient: updated[0]
        });
    } catch (error) {
        console.error("Update patient notes error:", error.message);
        res.status(500).json({ message: "Failed to update patient notes." });
    }
});

// DELETE PATIENT
app.delete("/api/patients/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const [existing] = await db.query(
            "SELECT * FROM patients WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: "Patient not found." });
        }

        await db.query(
            "DELETE FROM patients WHERE id = ?",
            [id]
        );

        logBlock("PATIENT DELETED", existing[0]);

        res.json({
            message: "Patient deleted successfully.",
            patient: existing[0]
        });
    } catch (error) {
        console.error("Delete patient error:", error.message);
        res.status(500).json({ message: "Failed to delete patient." });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log("\n========================================");
    console.log(`DentalCare API running at http://localhost:${PORT}`);
    console.log("Services:     /api/services");
    console.log("Appointments: /api/appointments");
    console.log("Patients:     /api/patients");
    console.log("========================================\n");
});
