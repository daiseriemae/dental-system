const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("./firebase-service-account.json");


// Initialize Firebase Admin
initializeApp({
    credential: cert(serviceAccount)
});


const email = process.argv[2];
const role = process.argv[3];


// Check arguments
if (!email || !role) {

    console.log("");
    console.log("Usage:");
    console.log("node setRole.js EMAIL ROLE");
    console.log("");

    console.log("Example for patient:");
    console.log("node setRole.js patient@gmail.com patient");
    console.log("");

    console.log("Example for dentist:");
    console.log("node setRole.js dentist@gmail.com dentist");
    console.log("");

    process.exit(1);
}


// Only allow patient or dentist
if (
    role !== "patient" &&
    role !== "dentist"
) {

    console.log("");
    console.log(
        'ERROR: Role must be "patient" or "dentist".'
    );
    console.log("");

    process.exit(1);
}


// Set Firebase custom claim
async function setRole() {

    try {

        const user =
            await getAuth().getUserByEmail(email);


        await getAuth().setCustomUserClaims(
            user.uid,
            {
                role: role
            }
        );


        console.log("");
        console.log("=================================");
        console.log("Firebase role successfully assigned.");
        console.log("=================================");

        console.log("Email:", email);
        console.log("UID:", user.uid);
        console.log("Role:", role);

        console.log("=================================");
        console.log("");

    }

    catch (error) {

        console.error("");
        console.error("ERROR SETTING FIREBASE ROLE:");
        console.error(error.message);
        console.error("");

    }

}


setRole();