import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./Firebase";

import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import PatientDashboard from "./pages/PatientDashboard.jsx";
import PatientAppointment from "./pages/PatientAppointment.jsx";
import PatientRecord from "./pages/PatientRecord.jsx";
import PatientServices from "./pages/PatientServices.jsx";
import PatientProfile from "./pages/PatientProfile.jsx";

import DentistDashboard from "./pages/DentistDashboard.jsx";
import DentistAppointments from "./pages/DentistAppointments.jsx";
import DentistPatientRecord from "./pages/DentistPatientRecord.jsx";
import DentistServices from "./pages/DentistServices.jsx";
import DentistProfile from "./pages/DentistProfile.jsx";

const routes = {
    "/": LandingPage,

    "/login": Login,
    "/loginpage.html": Login,

    "/register": Register,
    "/register.html": Register,

    "/patient/dashboard": PatientDashboard,
    "/patient/patientsdash.html": PatientDashboard,

    "/patient/appointment": PatientAppointment,
    "/patient/appointment.html": PatientAppointment,

    "/patient/record": PatientRecord,
    "/patient/record.html": PatientRecord,
    "/patient/records.html": PatientRecord,

    "/patient/services": PatientServices,
    "/patient/services.html": PatientServices,

    "/patient/profile": PatientProfile,
    "/patient/profile.html": PatientProfile,

    "/dentist/dashboard": DentistDashboard,
    "/dentist/dentistdash.html": DentistDashboard,

    "/dentist/appointments": DentistAppointments,
    "/dentist/appointment.html": DentistAppointments,
    "/dentist/appointments.html": DentistAppointments,

    "/dentist/patient-record": DentistPatientRecord,
    "/dentist/patientrecord.html": DentistPatientRecord,

    "/dentist/services": DentistServices,
    "/dentist/services.html": DentistServices,

    "/dentist/profile": DentistProfile,
    "/dentist/profile.html": DentistProfile
};

function getPath() {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    return routes[path] ? path : "/";
}

function getRoute(href) {
    if (!href || href === "#") {
        return null;
    }

    try {
        const url = new URL(href, window.location.href);
        const path = url.pathname.replace(/\/+$/, "") || "/";

        if (routes[path]) {
            return path;
        }

        const file = path.split("/").pop();

        if (file === "loginpage.html") {
            return "/login";
        }

        if (file === "register.html") {
            return "/register";
        }

        if (file === "patientsdash.html") {
            return "/patient/dashboard";
        }

        if (file === "appointment.html") {
            return path.includes("/dentist/")
                ? "/dentist/appointments"
                : "/patient/appointment";
        }

        if (file === "record.html" || file === "records.html") {
            return "/patient/record";
        }

        if (file === "services.html") {
            return path.includes("/dentist/")
                ? "/dentist/services"
                : "/patient/services";
        }

        if (file === "profile.html") {
            return path.includes("/dentist/")
                ? "/dentist/profile"
                : "/patient/profile";
        }

        if (file === "patientrecord.html") {
            return "/dentist/patient-record";
        }

        if (
            file === "dentistdash.html" ||
            file === ".dentistdash.html"
        ) {
            return "/dentist/dashboard";
        }

        return null;
    } catch {
        return null;
    }
}

export default function App() {
    const [path, setPath] = useState(getPath);
    const [authChecked, setAuthChecked] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(
                auth,
                googleProvider
            );

            const currentUser = result.user;

            const userRef = doc(
                db,
                "users",
                currentUser.uid
            );

            const userSnap = await getDoc(userRef);

            let userRole = "patient";

            if (userSnap.exists()) {
                const userData = userSnap.data();

                if (
                    userData.role === "patient" ||
                    userData.role === "dentist"
                ) {
                    userRole = userData.role;
                }

                await setDoc(
                    userRef,
                    {
                        email: currentUser.email || "",
                        displayName: currentUser.displayName || "",
                        photoURL: currentUser.photoURL || "",
                        role: userRole,
                        updatedAt: serverTimestamp()
                    },
                    {
                        merge: true
                    }
                );
            } else {
                const displayName =
                    currentUser.displayName || "";

                const nameParts =
                    displayName.split(" ");

                await setDoc(userRef, {
                    uid: currentUser.uid,
                    email: currentUser.email || "",
                    displayName,
                    firstName: nameParts[0] || "",
                    lastName: nameParts.slice(1).join(" "),
                    photoURL: currentUser.photoURL || "",
                    role: "patient",
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }

            localStorage.setItem(
                "userRole",
                userRole
            );

            localStorage.setItem(
                "userEmail",
                currentUser.email || ""
            );

            const nameParts =
                (currentUser.displayName || "").split(" ");

            localStorage.setItem(
                "userFirstName",
                nameParts[0] || ""
            );

            localStorage.setItem(
                "userLastName",
                nameParts.slice(1).join(" ")
            );

            localStorage.setItem(
                "userPhoto",
                currentUser.photoURL || ""
            );

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );
        } catch (error) {
            console.error("Google login failed:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            async (currentUser) => {
                setUser(currentUser);

                if (!currentUser) {
                    setRole(null);

                    localStorage.removeItem("userEmail");
                    localStorage.removeItem("userRole");
                    localStorage.removeItem("dentalCareUser");
                    localStorage.removeItem("isLoggedIn");

                    setAuthChecked(true);
                    return;
                }

                try {
                    const userRef = doc(
                        db,
                        "users",
                        currentUser.uid
                    );

                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();

                        const userRole =
                            userData.role === "dentist"
                                ? "dentist"
                                : "patient";

                        setRole(userRole);

                        localStorage.setItem(
                            "userRole",
                            userRole
                        );

                        localStorage.setItem(
                            "userEmail",
                            currentUser.email || ""
                        );

                        const nameParts =
                            (currentUser.displayName || "").split(" ");

                        localStorage.setItem(
                            "userFirstName",
                            nameParts[0] || ""
                        );

                        localStorage.setItem(
                            "userLastName",
                            nameParts
                                .slice(1)
                                .join(" ")
                        );

                        localStorage.setItem(
                            "userPhoto",
                            currentUser.photoURL || ""
                        );

                        localStorage.setItem(
                            "isLoggedIn",
                            "true"
                        );
                    } else {
                        await setDoc(userRef, {
                            uid: currentUser.uid,
                            email: currentUser.email || "",
                            displayName:
                                currentUser.displayName || "",
                            photoURL:
                                currentUser.photoURL || "",
                            role: "patient",
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        });

                        setRole("patient");

                        localStorage.setItem(
                            "userRole",
                            "patient"
                        );

                        localStorage.setItem(
                            "userEmail",
                            currentUser.email || ""
                        );

                        localStorage.setItem(
                            "isLoggedIn",
                            "true"
                        );
                    }
                } catch (error) {
                    console.error(
                        "Failed to load Firebase user:",
                        error
                    );

                    setRole(null);
                } finally {
                    setAuthChecked(true);
                }
            }
        );

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleBackForward = () => {
            setPath(getPath());
            window.scrollTo(0, 0);
        };

        const handleLinks = (event) => {
            const link = event.target.closest("a[href]");

            if (!link) {
                return;
            }

            const href = link.getAttribute("href");
            const route = getRoute(href);

            if (!route) {
                return;
            }

            event.preventDefault();

            window.history.pushState(
                {},
                "",
                route
            );

            setPath(route);
            window.scrollTo(0, 0);
        };

        window.addEventListener(
            "popstate",
            handleBackForward
        );

        document.addEventListener(
            "click",
            handleLinks
        );

        return () => {
            window.removeEventListener(
                "popstate",
                handleBackForward
            );

            document.removeEventListener(
                "click",
                handleLinks
            );
        };
    }, []);

    if (!authChecked) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#f3efff",
                    color: "#7b61a8",
                    fontFamily: "Arial, sans-serif"
                }}
            >
                <div className="text-center">
                    <div
                        className="spinner-border mb-3"
                        role="status"
                    ></div>

                    <div>
                        Loading DentalCare...
                    </div>
                </div>
            </div>
        );
    }

    const publicPages = [
        "/",
        "/login",
        "/loginpage.html",
        "/register",
        "/register.html"
    ];

    if (publicPages.includes(path)) {
        if (
            path === "/login" ||
            path === "/loginpage.html"
        ) {
            return (
                <Login
                    onLogin={handleLogin}
                />
            );
        }

        const Page = routes[path] || LandingPage;

        return <Page />;
    }

    if (!user) {
        window.history.replaceState(
            {},
            "",
            "/"
        );

        return <LandingPage />;
    }

    if (!role) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#f3efff",
                    color: "#7b61a8",
                    fontFamily: "Arial, sans-serif"
                }}
            >
                Loading account...
            </div>
        );
    }

    if (path.startsWith("/patient/")) {
        if (role !== "patient") {
            window.history.replaceState(
                {},
                "",
                "/dentist/dashboard"
            );

            setTimeout(() => {
                setPath("/dentist/dashboard");
            }, 0);

            return <DentistDashboard />;
        }
    }

    if (path.startsWith("/dentist/")) {
        if (role !== "dentist") {
            window.history.replaceState(
                {},
                "",
                "/patient/dashboard"
            );

            setTimeout(() => {
                setPath("/patient/dashboard");
            }, 0);

            return <PatientDashboard />;
        }
    }

    const Page = routes[path] || LandingPage;

    return <Page />;
}