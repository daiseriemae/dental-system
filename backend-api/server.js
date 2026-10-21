const express = require("express");
const cors = require("cors");

const app = express(PORT);
const PORT = process.env.PORT || 8080;

// =========================================================
// MIDDLEWARE
// =========================================================
app.use(cors());
app.use(express.json());

// =========================================================
// SERVICES
// =========================================================
const defaultServices = [
    { id: 1, name: "Dental Cleaning", price: 800, description: "Professional dental cleaning" },
    { id: 2, name: "Check-up", price: 500, description: "General dental check-up" },
    { id: 3, name: "Filling", price: 1200, description: "Dental filling treatment" },
    { id: 4, name: "Whitening", price: 2500, description: "Teeth whitening treatment" },
    { id: 5, name: "Extraction", price: 1500, description: "Tooth extraction" },
    { id: 6, name: "Braces Consultation", price: 700, description: "Braces consultation" }
];

let services = defaultServices.map(service => ({ ...service }));
let nextServiceID = 7;

// GET SERVICES
app.get("/api/services", (req, res) => {
    res.json(services);
});

// ADD SERVICE
app.post("/api/services", (req, res) => {
    const { name, price, description } = req.body;

    if (!name || price === undefined || price === "") {
        return res.status(400).json({
            message: "Service name and price are required."
        });
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
            message: "Please enter a valid price."
        });
    }

    const service = {
        id: nextServiceID++,
        name: String(name).trim(),
        price: numericPrice,
        description: description || ""
    };

    services.push(service);

    console.log("SERVICE ADDED");
    console.log("Service ID:", service.id);
    console.log("Service Name:", service.name);
    console.log("Price:", service.price);

    res.status(201).json({
        message: "Service added successfully.",
        service
    });
});

// UPDATE SERVICE
app.put("/api/services/:id", (req, res) => {
    const id = String(req.params.id);
    const service = services.find(item => String(item.id) === id);

    console.log("UPDATE SERVICE REQUEST");
    console.log("Service ID:", id);

    if (!service) {
        return res.status(404).json({
            message: "Service not found."
        });
    }

    const { name, price, description } = req.body;

    if (name !== undefined) {
        service.name = String(name).trim();
    }

    if (price !== undefined) {
        const numericPrice = Number(price);

        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
            return res.status(400).json({
                message: "Please enter a valid price."
            });
        }

        service.price = numericPrice;
    }

    if (description !== undefined) {
        service.description = description;
    }

    console.log("SERVICE UPDATED:", service.name);

    res.json({
        message: "Service updated successfully.",
        service
    });
});

// DELETE SERVICE
app.delete("/api/services/:id", (req, res) => {
    const id = String(req.params.id);

    console.log("DELETE SERVICE REQUEST");
    console.log("Service ID:", id);

    const index = services.findIndex(
        item => String(item.id) === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Service not found."
        });
    }

    const deletedService = services.splice(index, 1)[0];

    console.log("SERVICE DELETED:", deletedService.name);

    res.json({
        message: "Service deleted successfully.",
        service: deletedService
    });
});

// RESTORE DEFAULT SERVICES
app.post("/api/services/restore", (req, res) => {
    services = defaultServices.map(service => ({ ...service }));
    nextServiceID = 7;

    res.json({
        message: "Default services restored successfully.",
        services
    });
});

// =========================================================
// APPOINTMENTS
// =========================================================
let appointments = [];

// GET APPOINTMENTS
app.get("/api/appointment", (req, res) => {
    res.json(appointments);
});

// CREATE APPOINTMENT
app.post("/api/appointment", (req, res) => {
    const {
        patientId,
        patientName,
        service,
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

    const appointment = {
        id: Date.now().toString(),
        patientId,
        patientName: patientName || "",
        service,
        dentist,
        date,
        time,
        notes: notes || "",
        status: "Pending"
    };

    appointments.push(appointment);

    console.log("----------------------------------------");
    console.log("NEW APPOINTMENT");
    console.log("Appointment ID:", appointment.id);
    console.log("Patient ID:", appointment.patientId);
    console.log("Patient Name:", appointment.patientName);
    console.log("Service:", appointment.service);
    console.log("Dentist:", appointment.dentist);
    console.log("Date:", appointment.date);
    console.log("Time:", appointment.time);
    console.log("Status:", appointment.status);
    console.log("----------------------------------------");

    res.status(201).json({
        message: "Appointment created successfully.",
        appointment
    });
});

// UPDATE APPOINTMENT STATUS
app.put("/api/appointment/:id/status", (req, res) => {
    const id = String(req.params.id);
    const { status } = req.body;

    console.log("----------------------------------------");
    console.log("UPDATE APPOINTMENT STATUS");
    console.log("Appointment ID:", id);
    console.log("Requested Status:", status);

    const appointment = appointments.find(
        item => String(item.id) === id
    );

    if (!appointment) {
        console.log("Appointment not found.");
        console.log("----------------------------------------");

        return res.status(404).json({
            message: "Appointment not found."
        });
    }

    const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
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

    console.log("APPOINTMENT STATUS UPDATED");
    console.log("Service:", appointment.service);
    console.log("Dentist:", appointment.dentist);
    console.log("Date:", appointment.date);
    console.log("Time:", appointment.time);
    console.log("New Status:", appointment.status);
    console.log("----------------------------------------");

    res.json({
        message: "Appointment status updated successfully.",
        appointment
    });
});

// =========================================================
// PATIENTS
// =========================================================
let patients = [
    {
        id: "P-00125",
        firstName: "Daiserie Mae",
        lastName: "",
        name: "Daiserie Mae",
        age: "",
        gender: "",
        contact: "",
        email: "",
        address: "",
        notes: ""
    },
    {
        id: "P-00126",
        firstName: "John Michael",
        lastName: "Cruz",
        name: "John Michael Cruz",
        age: "",
        gender: "",
        contact: "",
        email: "",
        address: "",
        notes: ""
    },
    {
        id: "P-00127",
        firstName: "Angela",
        lastName: "Reyes",
        name: "Angela Reyes",
        age: "",
        gender: "",
        contact: "",
        email: "",
        address: "",
        notes: ""
    },
    {
        id: "P-00128",
        firstName: "Mark Anthony",
        lastName: "Garcia",
        name: "Mark Anthony Garcia",
        age: "",
        gender: "",
        contact: "",
        email: "",
        address: "",
        notes: ""
    },
    {
        id: "P-00129",
        firstName: "Sofia",
        lastName: "Mendoza",
        name: "Sofia Mendoza",
        age: "",
        gender: "",
        contact: "",
        email: "",
        address: "",
        notes: ""
    }
];

// GET ALL PATIENTS
app.get("/api/patients", (req, res) => {
    res.json(patients);
});

// GET ONE PATIENT
app.get("/api/patients/:id", (req, res) => {
    const id = String(req.params.id);

    const patient = patients.find(
        item => String(item.id) === id
    );

    if (!patient) {
        return res.status(404).json({
            message: "Patient not found."
        });
    }

    res.json(patient);
});

// UPDATE PATIENT
app.put("/api/patients/:id", (req, res) => {
    const id = String(req.params.id);

    console.log("----------------------------------------");
    console.log("UPDATE PATIENT REQUEST");
    console.log("Patient ID:", id);

    const patient = patients.find(
        item => String(item.id) === id
    );

    if (!patient) {
        return res.status(404).json({
            message: "Patient not found."
        });
    }

    const allowedFields = [
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

    const changedData = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            patient[field] = req.body[field];
            changedData[field] = req.body[field];
        }
    });

    if (
        req.body.firstName !== undefined ||
        req.body.lastName !== undefined
    ) {
        patient.name =
            `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
    }

    console.log("Changed Data:", changedData);
    console.log("Patient updated:", patient.id);
    console.log("----------------------------------------");

    res.json({
        message: "Patient updated successfully.",
        patient
    });
});

// UPDATE PATIENT NOTES
app.put("/api/patients/:id/notes", (req, res) => {
    const id = String(req.params.id);
    const { notes } = req.body;

    const patient = patients.find(
        item => String(item.id) === id
    );

    if (!patient) {
        return res.status(404).json({
            message: "Patient not found."
        });
    }

    patient.notes = notes || "";

    console.log("PATIENT NOTES UPDATED");
    console.log("Patient ID:", patient.id);

    res.json({
        message: "Patient notes updated successfully.",
        patient
    });
});

// DELETE PATIENT
app.delete("/api/patients/:id", (req, res) => {
    const id = String(req.params.id);

    const index = patients.findIndex(
        item => String(item.id) === id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Patient not found."
        });
    }

    const deletedPatient = patients.splice(index, 1)[0];

    console.log("PATIENT DELETED");
    console.log("Patient ID:", deletedPatient.id);

    res.json({
        message: "Patient deleted successfully.",
        patient: deletedPatient
    });
});

// =========================================================
// START SERVER
// =========================================================
app.listen(PORT, () => {
    console.log("----------------------------------------");
    console.log(`DentalCare API running at http://localhost:${PORT}`);
    console.log("Patients API:     /api/patients");
    console.log("Appointments API: /api/appointment");
    console.log("Services API:     /api/services");
    console.log("----------------------------------------");
});
