const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function uploadData() {
  try {
    console.log("Cargando datos a Firestore...");

    const data = JSON.parse(fs.readFileSync('sensorReadings.json', 'utf8'));

    const batch = db.batch();

    data.forEach(entry => {
      const docRef = db.collection('mediciones').doc();
      batch.set(docRef, entry);
    });

    await batch.commit();
    console.log('Datos cargados correctamente. ✅');
  } catch (error) {
    console.error('Error al subir datos ❌:', error);
  }
}

uploadData();