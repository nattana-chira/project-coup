// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsIBpUDPfv4xjmIc9MwicNsbbfE9zeFso",
  authDomain: "wtk-game.firebaseapp.com",
  projectId: "wtk-game",
  storageBucket: "wtk-game.appspot.com",
  messagingSenderId: "71061308659",
  appId: "1:71061308659:web:43897c0162aba760f6e386"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

 // Export firestore database
 // It will be imported into your react app whenever it is needed
export const db = getFirestore(app);