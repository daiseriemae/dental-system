const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// ========================================
// SERVICES
// ========================================

const services = [
    {
        id: "1",
        name: "Dental Cleaning",
        price: 800
    },
    {
        id: "2",
        name: "Dental Check-up",
        price: 500
    },
    {
        id: "3",
        name: "Dental Filling",
        price: 1200
    },
    {
        id: "4",
        name: "Teeth Whitening",
        price: 2500
    },
    {
        id: "5",
        name: "Tooth Extraction",
        price: 1500
    },
    {
        id: "6",
        name: "Braces Consultation",
        price: 700
    }
];

const defaultServices = JSON.parse(JSON.stringify(services));

// ========================================
// APPOINTMENTS
// ========================================

let appointments = [];

// ========================================
// PATIENTS
// ========================================

let patients = [
    {
        id: "P-00125",
        name: "Daiserie Mae",
        avatar: "DM",
        email: "patient@email.com",
        phone: "0912 345 6789",
        birthdate: "October 11, 2005",
        lastVisit: "September 2, 2026",
        service: "Dental Cleaning",
        status: "Good",
        nextVisit: "September 15, 2026",
        notes:
            "Patient should continue regular brushing and flossing. Schedule routine cleaning every six months.",
        history: [
            {
                service: "Dental Cleaning",
                date: "September 2, 2026",
                description:
                    "Routine dental cleaning and oral examination."
            },
            {
                service: "Dental Check-up",
                date: "June 10, 2026",
                description:
                    "General dental examination. No major problems found."
            },
            {
                service: "Dental Filling",
                date: "February 15, 2026",
                description:
                    "Dental filling performed on affected tooth."
            }
        ]
    },

    {
        id: "P-00126",
        name: "John Michael Cruz",
        avatar: "JC",
        email: "john@email.com",
        phone: "0913 222 4567",
        birthdate: "March 14, 2004",
        lastVisit: "August 28, 2026",
        service: "Dental Check-up",
        status: "Needs Follow-up",
        nextVisit: "September 18, 2026",
        notes:
            "Patient needs follow-up dental examination.",
        history: [
            {
                service: "Dental Check-up",
                date: "August 28, 2026",
                description:
                    "General dental examination."
            }
        ]
    },

    {
        id: "P-00127",
        name: "Angela Reyes",
        avatar: "AR",
        email: "angela@email.com",
        phone: "0914 333 5678",
        birthdate: "July 22, 2003",
        lastVisit: "August 25, 2026",
        service: "Tooth Extraction",
        status: "Under Treatment",
        nextVisit: "September 16, 2026",
        notes:
            "Patient is currently under dental treatment.",
        history: [
            {
                service: "Tooth Extraction",
                date: "August 25, 2026",
                description:
                    "Extraction consultation and treatment planning."
            }
        ]
    },

    {
        id: "P-00128",
        name: "Mark Anthony Garcia",
        avatar: "MG",
        email: "mark@email.com",
        phone: "0915 444 6789",
        birthdate: "January 8, 2002",
        lastVisit: "August 20, 2026",
        service: "Dental Filling",
        status: "Good",
        nextVisit: "September 17, 2026",
        notes:
            "Continue regular brushing and flossing.",
        history: [
            {
                service: "Dental Filling",
                date: "August 20, 2026",
                description:
                    "Dental filling performed."
            }
        ]
    },

    {
        id: "P-00129",
        name: "Sofia Mendoza",
        avatar: "SM",
        email: "sofia@email.com",
        phone: "0916 555 7890",
        birthdate: "November 30, 2005",
        lastVisit: "August 18, 2026",
        service: "Dental Cleaning",
        status: "Good",
        nextVisit: "February 18, 2027",
        notes:
            "Patient is in good dental condition.",
        history: [
            {
                service: "Dental Cleaning",
                date: "August 18, 2026",
                description:
                    "Routine dental cleaning."
            }
        ]
    }
];

// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "DentalCare backend is running",
        services: "localhost:8080/api/services",
        appointments: "localhost:8080/api/appointment",
        patients: "localhost:8080/api/patients"
    });
});

// ========================================
// SERVICES - GET
// ========================================

app.get("/api/services", (req, res) => {
    res.json(services);
});

// ========================================
// SERVICES - POST
// ========================================

app.post("/api/services", (req, res) => {
    const { name, price } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({
            message: "Service name and price are required"
        });
    }

    const newService = {
        id: Date.now().toString(),
        name,
        price: Number(price)
    };

    services.push(newService);

    console.log("\n========================================");
    console.log("NEW SERVICE CREATED");
    console.log("========================================");
    console.log("Service ID:", newService.id);
    console.log("Service:", JSON.stringify(newService, null, 2));
    console.log("========================================\n");

    res.status(201).json(newService);
});

// ========================================
// SERVICES - RESTORE
// ========================================

app.post("/api/services/restore", (req, res) => {
    services.length = 0;

    defaultServices.forEach(service => {
        services.push({
            ...service
        });
    });

    console.log("Services restored.");

    res.json({
        message: "Services restored",
        services
    });
});

// ========================================
// SERVICES - DELETE
// ========================================

app.delete("/api/services/:id", (req, res) => {
    const index = services.findIndex(
        service => service.id === req.params.id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Service not found"
        });
    }

    const deletedService = services[index];

    services.splice(index, 1);

    console.log("\n========================================");
    console.log("SERVICE DELETED");
    console.log("========================================");
    console.log("Service ID:", deletedService.id);
    console.log("Service:", deletedService.name);
    console.log("========================================\n");

    res.json({
        message: "Service deleted"
    });
});

// ========================================
// APPOINTMENTS - GET
// ========================================

app.get("/api/appointment", (req, res) => {
    res.json(appointments);
});

// ========================================
// APPOINTMENTS - POST
// ========================================

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

    if (
        !patientId ||
        !patientName ||
        !service ||
        !dentist ||
        !date ||
        !time
    ) {
        return res.status(400).json({
            message:
                "Please complete all required appointment fields"
        });
    }

    const newAppointment = {
        id: Date.now().toString(),
        patientId,
        patientName,
        service,
        dentist,
        date,
        time,
        notes: notes || "",
        status: "Pending"
    };

    appointments.push(newAppointment);

    console.log("\n========================================");
    console.log("NEW APPOINTMENT CREATED");
    console.log("========================================");
    console.log("Appointment ID:", newAppointment.id);
    console.log("Patient ID:", newAppointment.patientId);
    console.log("Patient:", newAppointment.patientName);
    console.log("Service:", newAppointment.service);
    console.log("Dentist:", newAppointment.dentist);
    console.log("Date:", newAppointment.date);
    console.log("Time:", newAppointment.time);
    console.log("Status:", newAppointment.status);
    console.log("========================================\n");

    res.status(201).json(newAppointment);
});

// ========================================
// APPOINTMENTS - UPDATE STATUS
// ========================================

app.put("/api/appointment/:id/status", (req, res) => {
    const { status } = req.body;

    const appointment = appointments.find(
        appointment => appointment.id === req.params.id
    );

    if (!appointment) {
        return res.status(404).json({
            message: "Appointment not found"
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
            message: "Invalid appointment status"
        });
    }

    appointment.status = status;

    console.log("\n========================================");
    console.log("APPOINTMENT STATUS UPDATED");
    console.log("========================================");
    console.log("Appointment ID:", appointment.id);
    console.log("Patient ID:", appointment.patientId);
    console.log("New Status:", appointment.status);
    console.log("========================================\n");

    res.json(appointment);
});

// ========================================
// PATIENTS - GET ALL
// ========================================

app.get("/api/patients", (req, res) => {
    res.json(patients);
});

// ========================================
// PATIENTS - GET ONE
// ========================================

app.get("/api/patients/:id", (req, res) => {
    const patient = patients.find(
        patient => patient.id === req.params.id
    );

    if (!patient) {
        return res.status(404).json({
            message: "Patient not found"
        });
    }

    res.json(patient);
});

// ========================================
// PATIENTS - UPDATE
// ========================================
// This is the IMPORTANT route for your Edit button.
//
// React sends:
//
// PUT /api/patients/P-00125
//
// Body:
//
// {
//     name,
//     email,
//     phone,
//     birthdate,
//     service,
//     status,
//     nextVisit
// }

app.put("/api/patients/:id", (req, res) => {
    const id = req.params.id;
    const editedData = req.body;

    console.log("\n========================================");
    console.log("       EDIT PATIENT REQUEST RECEIVED");
    console.log("========================================");

    console.log("Patient ID:", id);

    console.log("\nEdited Data Sent From Frontend:");
    console.log(
        JSON.stringify(editedData, null, 2)
    );

    const patientIndex = patients.findIndex(
        patient =>
            String(patient.id) === String(id)
    );

    if (patientIndex === -1) {
        console.log("\nPatient not found:", id);
        console.log("========================================\n");

        return res.status(404).json({
            message: "Patient not found"
        });
    }

    // Update only the fields sent by the frontend
    patients[patientIndex] = {
        ...patients[patientIndex],
        ...editedData
    };

    // Update avatar automatically if name changed
    if (patients[patientIndex].name) {
        patients[patientIndex].avatar =
            patients[patientIndex].name
                .split(" ")
                .filter(Boolean)
                .map(word => word[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();
    }

    console.log("\nUpdated Patient Data:");
    console.log(
        JSON.stringify(
            patients[patientIndex],
            null,
            2
        )
    );

    console.log("\n========================================");
    console.log(
        `Patient ${id} updated successfully`
    );
    console.log("========================================\n");

    res.json({
        message: "Patient record updated successfully",
        patient: patients[patientIndex]
    });
});

// ========================================
// PATIENT NOTES - UPDATE
// ========================================

app.put("/api/patients/:id/notes", (req, res) => {
    const { notes } = req.body;

    const patient = patients.find(
        patient => patient.id === req.params.id
    );

    if (!patient) {
        return res.status(404).json({
            message: "Patient not found"
        });
    }

    patient.notes = notes ?? "";

    console.log("\n========================================");
    console.log("PATIENT NOTES UPDATED");
    console.log("========================================");
    console.log("Patient ID:", patient.id);
    console.log("Patient:", patient.name);
    console.log("Notes:", patient.notes);
    console.log("========================================\n");

    res.json({
        message: "Notes updated successfully",
        patient
    });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log("========================================");
    console.log("      DentalCare Backend Server");
    console.log("========================================");
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log("Patients API:");
    console.log(`http://localhost:${PORT}/api/patients`);
    console.log("Appointments API:");
    console.log(`http://localhost:${PORT}/api/appointment`);
    console.log("Services API:");
    console.log(`http://localhost:${PORT}/api/services`);
    console.log("========================================");
});