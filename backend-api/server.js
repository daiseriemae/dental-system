
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Log every request that reaches THIS backend.
app.use((req, res, next) => {
    console.log(
        `\n[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`
    );
    next();
});

// NOTE: Data is currently stored in memory and resets when the server restarts.
const defaultServices = [
    { id: 1, name: "Dental Cleaning", price: 800, description: "Professional dental cleaning" },
    { id: 2, name: "Dental Check-up", price: 500, description: "General dental check-up" },
    { id: 3, name: "Dental Filling", price: 1200, description: "Dental filling treatment" },
    { id: 4, name: "Teeth Whitening", price: 2500, description: "Teeth whitening treatment" },
    { id: 5, name: "Tooth Extraction", price: 1500, description: "Tooth extraction" },
    { id: 6, name: "Braces Consultation", price: 700, description: "Braces consultation" }
];

let services = defaultServices.map(service => ({ ...service }));
let nextServiceId = 7;
let appointments = [];

let patients = [
    { id: "P-00125", firstName: "Daiserie Mae", lastName: "", name: "Daiserie Mae", age: "", gender: "", contact: "", email: "", address: "", notes: "" },
    { id: "P-00126", firstName: "John Michael", lastName: "Cruz", name: "John Michael Cruz", age: "", gender: "", contact: "", email: "", address: "", notes: "" },
    { id: "P-00127", firstName: "Angela", lastName: "Reyes", name: "Angela Reyes", age: "", gender: "", contact: "", email: "", address: "", notes: "" },
    { id: "P-00128", firstName: "Mark Anthony", lastName: "Garcia", name: "Mark Anthony Garcia", age: "", gender: "", contact: "", email: "", address: "", notes: "" },
    { id: "P-00129", firstName: "Sofia", lastName: "Mendoza", name: "Sofia Mendoza", age: "", gender: "", contact: "", email: "", address: "", notes: "" }
];

function logBlock(title, data) {
    console.log("\n========================================");
    console.log(title);
    if (data !== undefined) {
        console.log(JSON.stringify(data, null, 2));
    }
    console.log("========================================\n");
}

function findServiceByIdOrName(value) {
    return services.find(service =>
        String(service.id) === String(value) ||
        service.name.toLowerCase() ===
            String(value || "").trim().toLowerCase()
    );
}

// ROOT
app.get("/", (req, res) => {
    res.send("DentalCare API is running.");
});

// ==================== SERVICES ====================

app.get("/api/services", (req, res) => {
    res.json(services);
});

app.post("/api/services", (req, res) => {
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
            message: "A service name and valid non-negative price are required."
        });
    }

    const service = {
        id: nextServiceId++,
        name: String(name).trim(),
        price: numericPrice,
        description: String(description || "")
    };

    services.push(service);

    logBlock("SERVICE ADDED", {
        id: service.id,
        name: service.name,
        price: service.price,
        description: service.description
    });

    res.status(201).json({
        message: "Service added successfully.",
        service
    });
});

app.put("/api/services/:id", (req, res) => {
    const serviceId = String(req.params.id);

    const service = services.find(
        item => String(item.id) === serviceId
    );

    if (!service) {
        logBlock("SERVICE UPDATE FAILED", {
            id: serviceId,
            reason: "Service not found"
        });

        return res.status(404).json({
            message: "Service not found."
        });
    }

    const body = req.body;
    const changed = {};

    // Validate all provided fields before changing the service.
    if (
        body.name !== undefined &&
        !String(body.name).trim()
    ) {
        return res.status(400).json({
            message: "Service name cannot be empty."
        });
    }

    let numericPrice;

    if (body.price !== undefined) {
        numericPrice = Number(body.price);

        if (
            body.price === "" ||
            !Number.isFinite(numericPrice) ||
            numericPrice < 0
        ) {
            return res.status(400).json({
                message: "Please enter a valid non-negative price."
            });
        }
    }

    // Update and record only the fields supplied by the frontend.
    if (body.name !== undefined) {
        service.name = String(body.name).trim();
        changed.name = service.name;
    }

    if (body.price !== undefined) {
        service.price = numericPrice;
        changed.price = numericPrice;
    }

    if (body.description !== undefined) {
        service.description = String(body.description || "");
        changed.description = service.description;
    }

    // Print the ID and only the fields sent in the update.
    logBlock("SERVICE UPDATED — CHANGED FIELDS ONLY", {
        id: service.id,
        ...changed
    });

    res.json({
        message: "Service updated successfully.",
        service
    });
});

app.delete("/api/services/:id", (req, res) => {
    const index = services.findIndex(
        item => String(item.id) === String(req.params.id)
    );

    if (index < 0) {
        return res.status(404).json({
            message: "Service not found."
        });
    }

    const [deleted] = services.splice(index, 1);

    logBlock("SERVICE DELETED", deleted);

    res.json({
        message: "Service deleted successfully.",
        service: deleted
    });
});

app.post("/api/services/restore", (req, res) => {
    services = defaultServices.map(service => ({ ...service }));
    nextServiceId = 7;

    logBlock("DEFAULT SERVICES RESTORED", services);

    res.json({
        message: "Default services restored successfully.",
        services
    });
});

// Log service selection from the patient frontend.
app.post("/api/logs/service-selection", (req, res) => {
    const { serviceId, serviceName, price } = req.body;

    logBlock("PATIENT SELECTED A SERVICE", {
        serviceId: serviceId ?? null,
        serviceName: serviceName || "",
        price: price ?? null
    });

    res.json({ message: "Service selection logged." });
});

// ==================== APPOINTMENTS ====================

function listAppointments(req, res) {
    res.json(appointments);
}

function createAppointment(req, res) {
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

    const currentService =
        serviceId !== undefined && serviceId !== null
            ? findServiceByIdOrName(serviceId)
            : findServiceByIdOrName(service);

    if (
        serviceId !== undefined &&
        serviceId !== null &&
        !currentService
    ) {
        return res.status(400).json({
            message: "The selected service no longer exists. Please reload the service list."
        });
    }

    const appointment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        patientId: String(patientId),
        patientName: String(patientName || ""),
        service: currentService ? currentService.name : String(service),
        serviceId: currentService ? currentService.id : (serviceId ?? null),
        price: currentService
            ? currentService.price
            : (price === undefined ? null : Number(price)),
        dentist: String(dentist),
        date: String(date),
        time: String(time),
        notes: String(notes || ""),
        status: "Pending",
        createdAt: new Date().toISOString()
    };

    appointments.push(appointment);

    logBlock("NEW APPOINTMENT CREATED", appointment);

    res.status(201).json({
        message: "Appointment created successfully.",
        appointment
    });
}

function updateAppointmentStatus(req, res) {
    const appointment = appointments.find(
        item => String(item.id) === String(req.params.id)
    );

    if (!appointment) {
        return res.status(404).json({
            message: "Appointment not found."
        });
    }

    const { status } = req.body;
    const allowed = ["Pending", "Confirmed", "Completed", "Cancelled"];

    if (!allowed.includes(status)) {
        return res.status(400).json({
            message: "Invalid appointment status."
        });
    }

    if (
        appointment.status === "Completed" ||
        appointment.status === "Cancelled"
    ) {
        return res.status(400).json({
            message: "This appointment can no longer be updated."
        });
    }

    appointment.status = status;

    logBlock("APPOINTMENT STATUS UPDATED", {
        id: appointment.id,
        patientId: appointment.patientId,
        service: appointment.service,
        status: appointment.status
    });

    res.json({
        message: "Appointment status updated successfully.",
        appointment
    });
}

app.get("/api/appointment", listAppointments);
app.get("/api/appointments", listAppointments);

app.post("/api/appointment", createAppointment);
app.post("/api/appointments", createAppointment);

app.put("/api/appointment/:id/status", updateAppointmentStatus);
app.put("/api/appointments/:id/status", updateAppointmentStatus);

// ==================== PATIENTS ====================

app.get("/api/patients", (req, res) => {
    res.json(patients);
});

app.get("/api/patients/:id", (req, res) => {
    const patient = patients.find(
        item => String(item.id) === String(req.params.id)
    );

    if (!patient) {
        return res.status(404).json({
            message: "Patient not found."
        });
    }

    res.json(patient);
});

app.put("/api/patients/:id", (req, res) => {
    const patient = patients.find(
        item => String(item.id) === String(req.params.id)
    );

    if (!patient) {
        return res.status(404).json({
            message: "Patient not found."
        });
    }

    const fields = [
        "firstName",
        "lastName",
        "name",
        "age",
        "gender",
        "contact",
        "email",
        "address",
        "notes"
    ];

    const changed = {};

    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            patient[field] = req.body[field];
            changed[field] = req.body[field];
        }
    });

    if (
        req.body.firstName !== undefined ||
        req.body.lastName !== undefined
    ) {
        patient.name =
            `${patient.firstName || ""} ${patient.lastName || ""}`.trim();

        changed.name = patient.name;
    }

    logBlock("PATIENT UPDATED — CHANGED FIELDS", {
        id: patient.id,
        changed
    });

    res.json({
        message: "Patient updated successfully.",
        patient
    });
});

app.put("/api/patients/:id/notes", (req, res) => {
    const patient = patients.find(
        item => String(item.id) === String(req.params.id)
    );

    if (!patient) {
        return res.status(404).json({
            message: "Patient not found."
        });
    }

    patient.notes = String(req.body.notes || "");

    logBlock("PATIENT NOTES UPDATED", {
        id: patient.id,
        notes: patient.notes
    });

    res.json({
        message: "Patient notes updated successfully.",
        patient
    });
});

app.delete("/api/patients/:id", (req, res) => {
    const index = patients.findIndex(
        item => String(item.id) === String(req.params.id)
    );

    if (index < 0) {
        return res.status(404).json({
            message: "Patient not found."
        });
    }

    const [deleted] = patients.splice(index, 1);

    logBlock("PATIENT DELETED", deleted);

    res.json({
        message: "Patient deleted successfully.",
        patient: deleted
    });
});

// Start the backend once, after registering all routes.
app.listen(PORT, () => {
    console.log("\n========================================");
    console.log(`DentalCare API running at http://localhost:${PORT}`);
    console.log("Services:     /api/services");
    console.log("Appointments: /api/appointments and /api/appointment");
    console.log("Patients:     /api/patients");
    console.log("========================================\n");
});
