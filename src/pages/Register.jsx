import { useEffect } from "react";

const pageScript = "\n\n\n/* =====================================\n   SHOW/HIDE PASSWORD\n===================================== */\n\nfunction togglePassword(id, icon) {\n\n    const passwordInput =\n        document.getElementById(id);\n\n\n    if (passwordInput.type === \"password\") {\n\n        passwordInput.type = \"text\";\n\n        icon.classList.remove(\n            \"bi-eye-slash\"\n        );\n\n        icon.classList.add(\n            \"bi-eye\"\n        );\n\n    }\n\n    else {\n\n        passwordInput.type = \"password\";\n\n        icon.classList.remove(\n            \"bi-eye\"\n        );\n\n        icon.classList.add(\n            \"bi-eye-slash\"\n        );\n\n    }\n\n}\n\n\n/* =====================================\n   SHOW LICENSE FIELD FOR DENTIST\n===================================== */\n\nfunction checkAccountType() {\n\n    const role =\n        document.getElementById(\"role\").value;\n\n    const licenseBox =\n        document.getElementById(\"licenseBox\");\n\n    const licenseId =\n        document.getElementById(\"licenseId\");\n\n\n    if (role === \"dentist\") {\n\n        /* Show License ID */\n\n        licenseBox.style.display = \"block\";\n\n        /* Make License ID required */\n\n        licenseId.required = true;\n\n    }\n\n    else {\n\n        /* Hide License ID */\n\n        licenseBox.style.display = \"none\";\n\n        /* Remove required */\n\n        licenseId.required = false;\n\n        /* Clear old value */\n\n        licenseId.value = \"\";\n\n    }\n\n}\n\n\n/* =====================================\n   REGISTER FORM\n===================================== */\n\ndocument\n    .getElementById(\"registerForm\")\n    .addEventListener(\n        \"submit\",\n        function(event) {\n\n            event.preventDefault();\n\n\n            /* Get values */\n\n            const firstName =\n                document\n                    .getElementById(\"firstName\")\n                    .value\n                    .trim();\n\n\n            const lastName =\n                document\n                    .getElementById(\"lastName\")\n                    .value\n                    .trim();\n\n\n            const email =\n                document\n                    .getElementById(\"email\")\n                    .value\n                    .trim();\n\n\n            const role =\n                document\n                    .getElementById(\"role\")\n                    .value;\n\n\n            const licenseId =\n                document\n                    .getElementById(\"licenseId\")\n                    .value\n                    .trim();\n\n\n            const password =\n                document\n                    .getElementById(\"password\")\n                    .value;\n\n\n            const confirmPassword =\n                document\n                    .getElementById(\"confirmPassword\")\n                    .value;\n\n\n            const terms =\n                document\n                    .getElementById(\"terms\")\n                    .checked;\n\n\n            /* =================================\n               VALIDATION\n            ================================= */\n\n            if (firstName === \"\") {\n\n                showMessage(\n                    \"Please enter your first name.\",\n                    \"danger\"\n                );\n\n                return;\n\n            }\n\n\n            if (lastName === \"\") {\n\n                showMessage(\n                    \"Please enter your last name.\",\n                    \"danger\"\n                );\n\n                return;\n\n            }\n\n\n            if (email === \"\") {\n\n                showMessage(\n                    \"Please enter your email.\",\n                    \"danger\"\n                );\n\n                return;\n\n            }\n\n\n            if (role === \"\") {\n\n                showMessage(\n                    \"Please select your account type.\",\n                    \"danger\"\n                );\n\n                return;\n\n            }\n\n\n            /* =================================\n               DENTIST LICENSE VALIDATION\n            ================================= */\n\n            if (\n                role === \"dentist\" &&\n                licenseId === \"\"\n            ) {\n\n                showMessage(\n                    \"Please enter your Professional License ID.\",\n                    \"danger\"\n                );\n\n                return;\n\n            }\n\n\n            if (password.length < 6) {\n\n                showMessage(\n                    \"Password must be at least 6 characters.\",\n                    \"danger\"\n                );\n\n                return;\n\n            }\n\n\n            if (password !== confirmPassword) {\n\n                showMessage(\n                    \"Passwords do not match.\",\n                    \"danger\"\n                );\n\n                return;\n\n            }\n\n\n            if (!terms) {\n\n                showMessage(\n                    \"Please agree to the terms and conditions.\",\n                    \"danger\"\n                );\n\n                return;\n\n            }\n\n\n            /* =================================\n               SAVE TEMPORARILY\n            ================================= */\n\n            localStorage.setItem(\n                \"userFirstName\",\n                firstName\n            );\n\n\n            localStorage.setItem(\n                \"userLastName\",\n                lastName\n            );\n\n\n            localStorage.setItem(\n                \"userEmail\",\n                email\n            );\n\n\n            localStorage.setItem(\n                \"userRole\",\n                role\n            );\n\n\n            /* Save license only for dentist */\n\n            if (role === \"dentist\") {\n\n                localStorage.setItem(\n                    \"dentistLicenseId\",\n                    licenseId\n                );\n\n            }\n\n\n            /* =================================\n               SUCCESS\n            ================================= */\n\n            showMessage(\n                \"Account created successfully! Redirecting to login...\",\n                \"success\"\n            );\n\n\n            setTimeout(\n                function() {\n\n                    if (role === \"dentist\") {\n\n                        window.location.href =\n                            \"dentist-login.html\";\n\n                    }\n\n                    else {\n\n                        window.location.href =\n                            \"loginpage.html\";\n\n                    }\n\n                },\n                1500\n            );\n\n        }\n    );\n\n\n/* =====================================\n   SHOW MESSAGE\n===================================== */\n\nfunction showMessage(text, type) {\n\n    const message =\n        document.getElementById(\n            \"registerMessage\"\n        );\n\n\n    message.className =\n        \"alert alert-\" +\n        type +\n        \" text-center\";\n\n\n    message.innerText = text;\n\n\n    message.style.display = \"block\";\n\n}\n\n";

function runInline(code, event) {
  try {
    return Function("event", code).call(event.currentTarget, event);
  } catch (error) {
    console.error(error);
  }
}

export default function Register() {
  useEffect(() => {
    if (!pageScript.trim()) return;

    const script = document.createElement("script");
    script.textContent = pageScript;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <>
      <style>{"\n\n        /* =====================================\n           PAGE BACKGROUND\n        ===================================== */\n\n        body {\n\n            min-height: 100vh;\n\n            margin: 0;\n\n            display: flex;\n\n            align-items: center;\n\n            justify-content: center;\n\n            background:\n                linear-gradient(\n                    135deg,\n                    #eee8ff,\n                    #f8f5ff,\n                    #e9ddf7\n                );\n\n            font-family: Arial, sans-serif;\n\n        }\n\n\n        /* =====================================\n           REGISTER CARD\n        ===================================== */\n\n        .register-card {\n\n            width: 100%;\n\n            max-width: 480px;\n\n            background:\n                linear-gradient(\n                    145deg,\n                    #ffffff 0%,\n                    #faf8ff 55%,\n                    #f1eaff 100%\n                );\n\n            border: none;\n\n            border-radius: 25px;\n\n            position: relative;\n\n            overflow: hidden;\n\n            box-shadow:\n                0 15px 40px\n                rgba(123, 97, 168, 0.20);\n\n        }\n\n\n        /* =====================================\n           DECORATIVE CIRCLES\n        ===================================== */\n\n        .register-card::before {\n\n            content: \"\";\n\n            position: absolute;\n\n            width: 180px;\n\n            height: 180px;\n\n            background:\n                rgba(155, 123, 184, 0.12);\n\n            border-radius: 50%;\n\n            top: -90px;\n\n            right: -60px;\n\n        }\n\n\n        .register-card::after {\n\n            content: \"\";\n\n            position: absolute;\n\n            width: 140px;\n\n            height: 140px;\n\n            background:\n                rgba(169, 139, 196, 0.10);\n\n            border-radius: 50%;\n\n            bottom: -70px;\n\n            left: -50px;\n\n        }\n\n\n        .register-card > * {\n\n            position: relative;\n\n            z-index: 2;\n\n        }\n\n\n        /* =====================================\n           LOGO\n        ===================================== */\n\n        .logo-container {\n\n            width: 80px;\n\n            height: 80px;\n\n            margin: 0 auto 15px;\n\n            border-radius: 50%;\n\n            background-color: #eee7ff;\n\n            display: flex;\n\n            align-items: center;\n\n            justify-content: center;\n\n            overflow: hidden;\n\n            box-shadow:\n                0 5px 15px\n                rgba(123, 97, 168, 0.12);\n\n        }\n\n\n        .logo-container img {\n\n            width: 80px;\n\n            height: 80px;\n\n            object-fit: cover;\n\n        }\n\n\n        /* =====================================\n           TITLE\n        ===================================== */\n\n        .register-title {\n\n            color: #7b61a8;\n\n            font-weight: bold;\n\n        }\n\n\n        .register-subtitle {\n\n            color: #8c8499;\n\n        }\n\n\n        /* =====================================\n           LABEL\n        ===================================== */\n\n        .form-label {\n\n            color: #655a70;\n\n            font-weight: 600;\n\n        }\n\n\n        /* =====================================\n           INPUT\n        ===================================== */\n\n        .form-control {\n\n            height: 45px;\n\n            border-radius: 10px;\n\n            border: 1px solid #d8ccec;\n\n            background-color:\n                rgba(255, 255, 255, 0.90);\n\n        }\n\n\n        .form-control:focus {\n\n            border-color: #a98bc4;\n\n            box-shadow:\n                0 0 0 0.2rem\n                rgba(169, 139, 196, 0.20);\n\n        }\n\n\n        /* =====================================\n           SELECT\n        ===================================== */\n\n        .form-select {\n\n            height: 45px;\n\n            border-radius: 10px;\n\n            border: 1px solid #d8ccec;\n\n            background-color:\n                rgba(255, 255, 255, 0.90);\n\n        }\n\n\n        .form-select:focus {\n\n            border-color: #a98bc4;\n\n            box-shadow:\n                0 0 0 0.2rem\n                rgba(169, 139, 196, 0.20);\n\n        }\n\n\n        /* =====================================\n           PASSWORD\n        ===================================== */\n\n        .password-box {\n\n            position: relative;\n\n        }\n\n\n        .password-box .form-control {\n\n            padding-right: 45px;\n\n        }\n\n\n        .password-icon {\n\n            position: absolute;\n\n            right: 15px;\n\n            top: 50%;\n\n            transform: translateY(15%);\n\n            color: #9b7bb8;\n\n            cursor: pointer;\n\n            font-size: 18px;\n\n        }\n\n\n        .password-icon:hover {\n\n            color: #80609e;\n\n        }\n\n\n        /* =====================================\n           REGISTER BUTTON\n        ===================================== */\n\n        .btn-register {\n\n            height: 45px;\n\n            border: none;\n\n            border-radius: 12px;\n\n            background-color: #9b7bb8;\n\n            color: white;\n\n            font-weight: 600;\n\n            transition: 0.3s;\n\n        }\n\n\n        .btn-register:hover {\n\n            background-color: #80609e;\n\n            color: white;\n\n            transform: translateY(-2px);\n\n            box-shadow:\n                0 5px 15px\n                rgba(128, 96, 158, 0.25);\n\n        }\n\n\n        /* =====================================\n           LOGIN LINK\n        ===================================== */\n\n        .signin-link {\n\n            color: #80609e;\n\n            font-weight: 600;\n\n        }\n\n\n        .signin-link:hover {\n\n            color: #6d4f8e;\n\n            text-decoration: underline !important;\n\n        }\n\n\n        /* =====================================\n           TERMS\n        ===================================== */\n\n        .form-check-label {\n\n            color: #716a78;\n\n        }\n\n\n        .form-check-input:checked {\n\n            background-color: #9b7bb8;\n\n            border-color: #9b7bb8;\n\n        }\n\n\n        /* =====================================\n           LICENSE BOX\n        ===================================== */\n\n        #licenseBox {\n\n            display: none;\n\n        }\n\n\n        .license-note {\n\n            font-size: 12px;\n\n            color: #8c8499;\n\n            margin-top: 5px;\n\n        }\n\n\n        /* =====================================\n           MESSAGE\n        ===================================== */\n\n        #registerMessage {\n\n            display: none;\n\n            border-radius: 10px;\n\n        }\n\n\n        /* =====================================\n           RESPONSIVE\n        ===================================== */\n\n        @media (max-width: 576px) {\n\n            body {\n\n                padding: 20px 10px;\n\n            }\n\n\n            .register-card {\n\n                max-width: 100%;\n\n                border-radius: 20px;\n\n                padding: 30px 25px !important;\n\n            }\n\n        }\n\n    "}</style>
        <div className="container py-4">
    <div className="row justify-content-center">
      <div className="col-12 col-sm-6 col-md-11 col-lg-9">

        <div className="register-card p-4 p-md-5">

          <div className="logo-container">
            <img src="images.jfif" alt="DentalCare Logo" />
</div>

          <div className="text-center mb-4">
            <h2 className="register-title">

                        Create Account

                    </h2>
            <p className="register-subtitle mb-0">

                        Register for your DentalCare account.

                    </p>
</div>

          <div id="registerMessage" className="alert text-center" role="alert">
</div>

          <form id="registerForm">

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label htmlFor="firstName" className="form-label">

                                First Name

                            </label>
                <input type="text" id="firstName" className="form-control" placeholder="First name" required="" />
</div>
              <div className="col-6">
                <label htmlFor="lastName" className="form-label">

                                Last Name

                            </label>
                <input type="text" id="lastName" className="form-control" placeholder="Last name" required="" />
</div>
</div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">

                            Email

                        </label>
              <input type="email" id="email" className="form-control" placeholder="Enter your email" required="" />
</div>

            <div className="mb-3">
              <label htmlFor="role" className="form-label">

                            Account Type

                        </label>
              <select id="role" className="form-select" required="" onChange={(event) => runInline("checkAccountType()", event)}>
                <option value="">

                                Select account type

                            </option>
                <option value="patient">

                                Patient

                            </option>
                <option value="dentist">

                                Dentist

                            </option>
</select>
</div>

            <div id="licenseBox" className="mb-3">
              <label htmlFor="licenseId" className="form-label">
                <i className="bi bi-card-text me-1"></i>

                            Professional License ID

                        </label>
              <input type="text" id="licenseId" className="form-control" placeholder="Enter your professional license ID" />
              <div className="license-note">

                            Required for dentist registration.

                        </div>
</div>

            <div className="mb-3 password-box">
              <label htmlFor="password" className="form-label">

                            Password

                        </label>
              <input type="password" id="password" className="form-control" placeholder="Create a password" required="" />
              <i className="bi bi-eye-slash password-icon" onClick={(event) => runInline("togglePassword(\n                                'password',\n                                this\n                            )", event)}>
</i>
</div>

            <div className="mb-3 password-box">
              <label htmlFor="confirmPassword" className="form-label">

                            Confirm Password

                        </label>
              <input type="password" id="confirmPassword" className="form-control" placeholder="Confirm your password" required="" />
              <i className="bi bi-eye-slash password-icon" onClick={(event) => runInline("togglePassword(\n                                'confirmPassword',\n                                this\n                            )", event)}>
</i>
</div>

            <div className="form-check mb-4">
              <input className="form-check-input" type="checkbox" id="terms" required="" />
              <label className="form-check-label small" htmlFor="terms">

                            I agree to the terms and
                            conditions.

                        </label>
</div>

            <div className="d-grid">
              <button type="submit" className="btn btn-register">
                <i className="bi bi-person-plus me-1">
</i>

                            Create Account

                        </button>
</div>

            <div className="text-center mt-4">
              <small className="text-secondary">

                            Already have an account?

                                            <a href="/" className="signin-link text-decoration-none">

                                Login

                            </a>
</small>
</div>
</form>
</div>
</div>
</div>
</div>
    </>
  );
}
