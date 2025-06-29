import { Line } from "react-chartjs-2";
import { ref, onValue } from "firebase/database";
import db from "../firebaseConfig";
import { useEffect, useState } from "react";
import { Chart as ChartJS, LineElement, TimeScale, LinearScale, PointElement, Title } from "chart.js";
import 'chartjs-adapter-date-fns';

ChartJS.register(LineElement, TimeScale, LinearScale, PointElement, Title);

const ChartPanel = ({ sensorPath, label }) => {
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => {
    const sensorRef = ref(db, sensorPath);
    onValue(sensorRef, (snapshot) => {
      const datos = snapshot.val();
      const array = Object.entries(datos || {}).map(([key, value]) => ({
        x: new Date(key),
        y: value
      }));
      setDataPoints(array);
    });
  }, [sensorPath]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">{label}</h2>
      <Line
        data={{
          datasets: [
            {
              label,
              data: dataPoints,
              borderColor: "green",
              backgroundColor: "rgba(0, 128, 0, 0.1)",
              tension: 0.3,
            },
          ],
        }}
        options={{
          responsive: true,
          scales: {
            x: {
              type: "time",
              time: { unit: "hour" },
              title: { display: true, text: "Hora" },
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: label.includes("Humedad") ? "%" : "Lux" },
            },
          },
        }}
      />
    </div>
  );
};

export default ChartPanel;
