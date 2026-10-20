const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

/* =========================================================
   SERVICES
========================================================= */

const services = [
    {
        id: "1",
        name: "Dental Cleaning",
        price: 800,
        description:
            "Professional dental cleaning and oral examination."
    },
    {
        id: "2",
        name: "Dental Check-up",
        price: 500,
        description:
            "General dental examination and oral health assessment."
    },
    {
        id: "3",
        name: "Dental Filling",
        price: 1200,
        description:
            "Dental filling treatment for affected teeth."
    },
    {
        id: "4",
        name: "Teeth Whitening",
        price: 2500,
        description:
            "Professional teeth whitening treatment."
    },
    {
        id: "5",
        name: "Tooth Extraction",
        price: 1500,
        description:
            "Safe and professional tooth extraction procedure."
    },
    {
        id: "6",
        name: "Braces Consultation",
        price: 700,
        description:
            "Consultation for braces and orthodontic treatment."
    }
];

const defaultServices = JSON.parse(
    JSON.stringify(services)
);

/* =========================================================
   APPOINTMENTS
========================================================= */

let appointments = [];

/* =========================================================
   PATIENTS
========================================================= */

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

/* =========================================================
   HOME
========================================================= */

app.get("/", (req, res) => {
    res.json({
        message: "DentalCare backend is running",
        services: `http://localhost:${PORT}/api/services`,
        appointments: `http://localhost:${PORT}/api/appointment`,
        patients: `http://localhost:${PORT}/api/patients`
    });
});

/* =========================================================
   SERVICES - GET ALL
========================================================= */

app.get("/api/services", (req, res) => {
    console.log("GET SERVICES");

    res.json(services);
});

/* =========================================================
   SERVICES - ADD
========================================================= */

app.post("/api/services", (req, res) => {
    const {
        name,
        price,
        description
    } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({
            message:
                "Service name and price are required."
        });
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return res.status(400).json({
            message:
                "Price must be a valid number."
        });
    }

    const newService = {
        id: Date.now().toString(),
        name: String(name).trim(),
        price: numericPrice,
        description:
            description
                ? String(description).trim()
                : ""
    };

    services.push(newService);

    console.log("----------------------------------------");
    console.log("SERVICE ADDED");
    console.log("ID:", newService.id);
    console.log("Name:", newService.name);
    console.log("Price:", newService.price);
    console.log("Description:", newService.description);
    console.log("----------------------------------------");

    res.status(201).json({
        message: "Service added successfully.",
        service: newService
    });
});

/* =========================================================
   SERVICES - EDIT
========================================================= */

app.put("/api/services/:id", (req, res) => {
    const id = String(req.params.id);

    const {
        name,
        price,
        description
    } = req.body;

    console.log("----------------------------------------");
    console.log("EDIT SERVICE REQUEST");
    console.log("Service ID:", id);

    const serviceIndex = services.findIndex(
        service =>
            String(service.id) === id
    );

    if (serviceIndex === -1) {
        console.log("Service not found:", id);
        console.log("----------------------------------------");

        return res.status(404).json({
            message: "Service not found."
        });
    }

    if (!name || price === undefined) {
        return res.status(400).json({
            message:
                "Service name and price are required."
        });
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return res.status(400).json({
            message:
                "Price must be a valid number."
        });
    }

    const oldService = services[serviceIndex];

    const updatedService = {
        ...oldService,
        name: String(name).trim(),
        price: numericPrice,
        description:
            description !== undefined
                ? String(description).trim()
                : oldService.description || ""
    };

    services[serviceIndex] = updatedService;

    console.log("SERVICE UPDATED");
    console.log(updatedService);
    console.log("----------------------------------------");

    res.json({
        message:
            "Service updated successfully.",
        service: updatedService
    });
});

/* =========================================================
   SERVICES - DELETE
========================================================= */

app.delete("/api/services/:id", (req, res) => {
    const id = String(req.params.id);

    console.log("----------------------------------------");
    console.log("DELETE SERVICE REQUEST");
    console.log("Service ID:", id);

    const serviceIndex = services.findIndex(
        service =>
            String(service.id) === id
    );

    if (serviceIndex === -1) {
        console.log(
            "Service not found:",
            id
        );
        console.log("----------------------------------------");

        return res.status(404).json({
            message: "Service not found."
        });
    }

    const deletedService =
        services[serviceIndex];

    services.splice(serviceIndex, 1);

    console.log("SERVICE DELETED");
    console.log(deletedService);
    console.log("----------------------------------------");

    res.json({
        message:
            "Service deleted successfully.",
        service: deletedService
    });
});

/* =========================================================
   SERVICES - RESTORE DEFAULT
========================================================= */

app.post("/api/services/restore", (req, res) => {
    services.length = 0;

    defaultServices.forEach(service => {
        services.push({
            ...service
        });
    });

    console.log("----------------------------------------");
    console.log("SERVICES RESTORED");
    console.log("----------------------------------------");

    res.json({
        message:
            "Services restored successfully.",
        services
    });
});

/* =========================================================
   APPOINTMENTS - GET
========================================================= */

app.get("/api/appointment", (req, res) => {
    res.json(appointments);
});

/* =========================================================
   APPOINTMENTS - ADD
========================================================= */

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
                "Please complete all required appointment fields."
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

    console.log("----------------------------------------");
    console.log("APPOINTMENT ADDED");
    console.log(newAppointment);
    console.log("----------------------------------------");

    res.status(201).json({
        message:
            "Appointment created successfully.",
        appointment: newAppointment
    });
});

/* =========================================================
   APPOINTMENTS - UPDATE STATUS
========================================================= */

app.put(
    "/api/appointment/:id/status",
    (req, res) => {
        const {
            status
        } = req.body;

        const appointment =
            appointments.find(
                appointment =>
                    String(appointment.id) ===
                    String(req.params.id)
            );

        if (!appointment) {
            return res.status(404).json({
                message:
                    "Appointment not found."
            });
        }

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled"
        ];

        if (
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message:
                    "Invalid appointment status."
            });
        }

        appointment.status = status;

        res.json({
            message:
                "Appointment updated successfully.",
            appointment
        });
    }
);

/* =========================================================
   PATIENTS - GET ALL
========================================================= */

app.get("/api/patients", (req, res) => {
    res.json(patients);
});

/* =========================================================
   PATIENTS - GET ONE
========================================================= */

app.get("/api/patients/:id", (req, res) => {
    const patient = patients.find(
        patient =>
            String(patient.id) ===
            String(req.params.id)
    );

    if (!patient) {
        return res.status(404).json({
            message: "Patient not found."
        });
    }

    res.json(patient);
});

/* =========================================================
   PATIENTS - EDIT
========================================================= */

app.put("/api/patients/:id", (req, res) => {
    const id = String(req.params.id);

    const patientIndex =
        patients.findIndex(
            patient =>
                String(patient.id) === id
        );

    if (patientIndex === -1) {
        return res.status(404).json({
            message: "Patient not found."
        });
    }

    const oldPatient =
        patients[patientIndex];

    const editedData = req.body;

    const changedData = {};

    Object.keys(editedData).forEach(
        key => {
            if (
                JSON.stringify(
                    oldPatient[key]
                ) !==
                JSON.stringify(
                    editedData[key]
                )
            ) {
                changedData[key] =
                    editedData[key];
            }
        }
    );

    patients[patientIndex] = {
        ...oldPatient,
        ...editedData
    };

    if (
        patients[patientIndex].name
    ) {
        patients[patientIndex].avatar =
            patients[patientIndex]
                .name
                .split(" ")
                .filter(Boolean)
                .map(
                    word =>
                        word[0]
                )
                .join("")
                .substring(0, 2)
                .toUpperCase();
    }

    res.json({
        message:
            "Patient record updated successfully.",
        patient:
            patients[patientIndex],
        changedData
    });
});

/* =========================================================
   PATIENTS - UPDATE NOTES
========================================================= */

app.put(
    "/api/patients/:id/notes",
    (req, res) => {
        const {
            notes
        } = req.body;

        const patient =
            patients.find(
                patient =>
                    String(patient.id) ===
                    String(req.params.id)
            );

        if (!patient) {
            return res.status(404).json({
                message:
                    "Patient not found."
            });
        }

        const newNotes =
            notes ?? "";

        if (
            patient.notes ===
            newNotes
        ) {
            return res.json({
                message:
                    "No changes detected.",
                patient
            });
        }

        patient.notes =
            newNotes;

        res.json({
            message:
                "Notes updated successfully.",
            patient
        });
    }
);

/* =========================================================
   PATIENTS - DELETE
========================================================= */

app.delete(
    "/api/patients/:id",
    (req, res) => {
        const id =
            String(req.params.id);

        const patientIndex =
            patients.findIndex(
                patient =>
                    String(patient.id) ===
                    id
            );

        if (patientIndex === -1) {
            return res.status(404).json({
                message:
                    "Patient not found."
            });
        }

        const deletedPatient =
            patients[patientIndex];

        patients.splice(
            patientIndex,
            1
        );

        console.log(
            "PATIENT DELETED:",
            deletedPatient
        );

        res.json({
            message:
                "Patient deleted successfully.",
            patient:
                deletedPatient
        });
    }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
    console.log("========================================");
    console.log("      DentalCare Backend Server");
    console.log("========================================");
    console.log(
        `Backend running at http://localhost:${PORT}`
    );
    console.log(
        `Patients API: http://localhost:${PORT}/api/patients`
    );
    console.log(
        `Appointments API: http://localhost:${PORT}/api/appointment`
    );
    console.log(
        `Services API: http://localhost:${PORT}/api/services`
    );
    console.log("========================================");
});