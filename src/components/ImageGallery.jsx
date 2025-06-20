import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useEffect, useState } from "react";

const ImageGallery = () => {
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    const storage = getStorage();
    const imgRef = ref(storage, "imagenes/oreo.jpg"); // Ruta en Firebase Storage
    getDownloadURL(imgRef)
      .then((url) => setImgUrl(url))
      .catch((error) => console.error("Error cargando imagen:", error));
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Imagen del entorno</h2>
      {imgUrl && <img src={imgUrl} alt="Entorno" className="w-full rounded" />}
    </div>
  );
};

export default ImageGallery;
