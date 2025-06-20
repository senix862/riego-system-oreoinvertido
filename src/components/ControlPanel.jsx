import { ref, set, get } from "firebase/database";
import db from "../firebaseConfig";
import { useState } from "react";

const ControlPanel = () => {
  const [humedad, setHumedad] = useState(null);

  const activarRiego = async () => {
    const comandoRef = ref(db, "comandos/riego");
    await set(comandoRef, true);
    alert("¡Comando de riego enviado!");
  };

  const obtenerHumedad = async () => {
    const humedadRef = ref(db, "sensores/humedad_actual");
    const snapshot = await get(humedadRef);
    if (snapshot.exists()) {
      setHumedad(snapshot.val());
    } else {
      setHumedad("No disponible");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow col-span-2">
      <h2 className="text-lg font-semibold mb-2">Controles Manuales</h2>
      <button onClick={activarRiego} className="bg-green-600 text-white px-4 py-2 rounded mr-4">
        Activar Riego
      </button>
      <button onClick={obtenerHumedad} className="bg-blue-600 text-white px-4 py-2 rounded">
        Obtener Humedad Actual
      </button>
      {humedad !== null && (
        <p className="mt-4 text-gray-700">
          Humedad actual: <strong>{humedad}%</strong>
        </p>
      )}
    </div>
  );
};

export default ControlPanel;
