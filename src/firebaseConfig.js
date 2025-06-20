// Importá lo necesario
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Configuración de tu proyecto (está perfecta)
const firebaseConfig = {
  apiKey: "AIzaSyB6kV4oPy6Er4Mg0B3I32iIqM9NuzLoVLA",
  authDomain: "sriegosystem-oreoinvertido.firebaseapp.com",
  projectId: "sriegosystem-oreoinvertido",
  storageBucket: "sriegosystem-oreoinvertido.firebasestorage.app",
  messagingSenderId: "44203553858",
  appId: "1:44203553858:web:2a12621d318f709a5969db",
  measurementId: "G-V9XHRDGR2T"
};

// Inicializá Firebase
const app = initializeApp(firebaseConfig);

// Conectá a la base de datos
const db = getDatabase(app);

export default db;
