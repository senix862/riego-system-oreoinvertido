import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Droplets, Sun, Activity, Settings, RefreshCw } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "sriegosystem-oreoinvertido.firebaseapp.com",
  projectId: "sriegosystem-oreoinvertido",
  storageBucket: "sriegosystem-oreoinvertido.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  const [humedadData, setHumedadData] = useState([]);
  const [luzData, setLuzData] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const q = query(collection(db, "mediciones"), orderBy("timestamp", "desc"), limit(7));
        const querySnapshot = await getDocs(q);

        const humedad = [];
        const luz = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const date = data.timestamp?.toDate?.() ?? new Date();
          const hora = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          humedad.unshift({ name: hora, Humedad: data.humedad ?? 0 });
          luz.unshift({ name: hora, Luz: data.luz ?? 0 });
        });

        setHumedadData(humedad);
        setLuzData(luz);
      } catch (error) {
        console.error("Error al obtener datos de Firestore:", error);
      }
    };

    fetchDatos();
  }, []);

  const handleActivarRiego = async () => {
    setMessage('Activando sistema de riego...');
    try {
      await addDoc(collection(db, 'commands'), {
        commandType: 'regar',
        status: 'pending',
        timestamp: serverTimestamp(),
        requester: 'web'
      });
      setMessage('Sistema de riego activado. Verificando nivel de humedad...');
      handleRefreshData();
      handleObtenerHumedad();

      setTimeout(() => {
            setMessage('Datos actualizados.');
          }, 2000);

    } catch (error) {
      console.error("Error al enviar comando de riego:", error);
      setMessage("Error al activar el riego.");
    }
  };

  const handleObtenerHumedad = async () => {
    setMessage('Obteniendo humedad actual...');
    try {
      const q = query(collection(db, "mediciones"), orderBy("timestamp", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setMessage(`Humedad actual del suelo: ${data.humedad ?? '--'}%`);
      } else {
        setMessage("No hay lecturas disponibles.");
      }
    } catch (error) {
      console.error("Error al obtener humedad:", error);
      setMessage("Error al obtener humedad.");
    }
    setTimeout(() => {
      handleRefreshData();
        }, 3000);
  };

  const handleRefreshData = async () => {
    setMessage('Actualizando datos...');
    try {
      const q = query(collection(db, "mediciones"), orderBy("timestamp", "desc"), limit(7));
      const querySnapshot = await getDocs(q);

      const humedad = [];
      const luz = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.timestamp?.toDate?.() ?? new Date();
        const hora = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        humedad.unshift({ name: hora, Humedad: data.humedad ?? 0 });
        luz.unshift({ name: hora, Luz: data.luz ?? 0 });
      });

      setHumedadData(humedad);
      setLuzData(luz);
      setMessage('Datos actualizados.');
    } catch (error) {
      console.error("Error al refrescar datos:", error);
      setMessage('Error al actualizar datos.');
    }
  };

  return (

    <div className="bg-gray-50 font-inter min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="max-w-7xl w-full mx-auto bg-white rounded-xl shadow-2xl p-6 sm:p-10">
        {/* Encabezado Dashboard */}
        <header className="mb-8">
          <div className="flex justify-between items-center w-full mb-4 px-4 sm:px-0">
            {/* Logo UNDAV */}
            <img
              src="/imagenes/undav-full-nobg.png"
              alt="Logo UNDAV"
              className="w-12 h-12 md:w-20 md:h-20 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/6b7280/FFFFFF?text=IMG_ERR"; }}           />
            {/* Logo Oreo Invertido */}
            <img
              src="/imagenes/Oreo-invertido-cyn-nobg.png"
              alt="Logo Oreo Invertido"
              className="w-12 h-12 md:w-20 md:h-20 object-contain rounded-full"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/6b7280/FFFFFF?text=IMG_ERR"; }}           />
          </div>

          {/* Titulo y presentación - web */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              Sistema de Riego <span className="text-emerald-600">Oreo Invertido</span>
            </h1>
            <p className="text-lg text-gray-600">Monitoreo y control inteligente de tu cultivo</p>
            <p className="text-lg text-gray-600">Yanzón - Navarro - Jalowicki</p>
            <p className="text-lg text-gray-600">Profesor: Matias Loiseau</p>
          </div>
        </header>

        {/* Alert Box */}
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {/* Control Manual */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 shadow-md flex flex-col items-center justify-center text-center">
            <Settings className="h-10 w-10 text-emerald-600 mb-4" />
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">Controles Rápidos</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleActivarRiego}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Droplets className="h-5 w-5" />
                <span>Activar Riego</span>
              </button>
              <button
                onClick={handleObtenerHumedad}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Activity className="h-5 w-5" />
                <span>Obtener Humedad Actual</span>
              </button>
              <button
                onClick={handleRefreshData}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Actualizar Datos</span>
              </button>
            </div>
          </div>

          {/* Estado Actual */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-md flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Estado del Sistema</h2>
            <p className="text-gray-700 text-lg mb-2">
              <span className="font-bold">Humedad del Suelo:</span> {humedadData.length > 0 ? humedadData[humedadData.length - 1].Humedad : '--'}%
            </p>
            <p className="text-gray-700 text-lg mb-2">
              <span className="font-bold">Intensidad de Luz:</span> {luzData.length > 0 ? luzData[luzData.length - 1].Luz : '--'} Lux
            </p>
            <p className="text-gray-700 text-lg">
              <span className="font-bold">Estado del Riego:</span> <span className="text-red-600 font-bold">Inactivo</span> (automático)
            </p>
          </div>
        </section>

        {/* Gráficos */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Humedad del Suelo */}
          <div className="bg-white rounded-lg p-6 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Droplets className="h-6 w-6 text-cyan-600 mr-2" />
              Humedad del Suelo (%)
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={humedadData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                    labelStyle={{ color: '#333' }}
                    itemStyle={{ color: '#007bff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Humedad"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0ea5e9' }}
                    activeDot={{ r: 7, stroke: '#0ea5e9', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4">Datos de humedad en las últimas horas.</p>
          </div>

          {/* Luz Recibida */}
          <div className="bg-white rounded-lg p-6 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Sun className="h-6 w-6 text-yellow-500 mr-2" />
              Luz Recibida (Lux)
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={luzData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                    labelStyle={{ color: '#333' }}
                    itemStyle={{ color: '#ffa500' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Luz"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4">Niveles de luz registrados en las últimas horas.</p>
          </div>
        </section>
      </div>
      {/* Footer */}
      <footer className="mt-10 text-center text-gray-500 text-sm flex flex-col items-center space-y-4">
        <a
          href="https://t.me/RiegoOreo_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-telegramBlue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition duration-300"
          style={{ backgroundColor: '#229ED9' }}
        >
          Consultar al Bot en Telegram 🤖 
        </a>
          <p>&copy; {new Date().getFullYear()} Sistema de Riego - @OreoInvertido. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
};

export default App;
