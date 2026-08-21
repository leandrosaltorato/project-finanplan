import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBr_EZmntLFyRKoUJEzVJI6VUgDVAWY9n4",
    authDomain: "finanplan-0000.firebaseapp.com",
    projectId: "finanplan-0000",
    storageBucket: "finanplan-0000.firebasestorage.app",
    messagingSenderId: "161492935328",
    appId: "1:161492935328:web:67ed9e3548206c3668dfc5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);