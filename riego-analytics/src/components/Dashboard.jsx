import ChartPanel from "./ChartPanel";
import LogPanel from "./LogPanel";
import ControlPanel from "./ControlPanel";
import ImageGallery from "./ImageGallery";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ControlPanel />
        <ChartPanel sensorPath="historico/humedad" label="Humedad del Suelo (%)" />
        <ChartPanel sensorPath="historico/luz" label="Luz Recibida (lux)" />
        <LogPanel />
        <ImageGallery />
    </div>
  );
};

export default Dashboard;
