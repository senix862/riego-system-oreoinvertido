import Navbar from "./components/NavBar";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="p-4">
        <Dashboard />
      </main>
      <div className="bg-green-200 text-center p-4 rounded">
        <h1 className="text-2xl font-bold text-green-800">Tailwind está funcionando 🎉</h1>
      </div>
    </div>
  );
}

export default App;
