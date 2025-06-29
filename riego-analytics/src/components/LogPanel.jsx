import { ref, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import db from "../firebaseConfig";

const LogPanel = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const logsRef = ref(db, "logs");
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const listado = Object.entries(data).reverse().map(([key, value]) => `${key}: ${value}`);
      setLogs(listado);
    });
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow col-span-2">
      <h2 className="text-lg font-semibold mb-2">Logs del Sistema</h2>
      <ul className="list-disc pl-5 max-h-64 overflow-y-auto">
        {logs.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default LogPanel;
