#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// ---------- WiFi ----------
#define WIFI_SSID "OreoInvertido"
#define WIFI_PASSWORD "NoRacist"

// ---------- Firebase ----------
#define FIREBASE_HOST "sriegosystem-oreoinvertido-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "K6htk011SVdmtHowE95m5S4zFKU9vkMD1iu0U9wG"

// ---------- Pines ----------
#define RELAY_PIN D2
#define SENSOR_HUMEDAD A0
#define SENSOR_LUZ D0
const int humedadUmbral = 500;

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000);  // UTC cada 60 seg

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  Serial.begin(9600);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado ✅");

  timeClient.begin();
  while (!timeClient.update()) {
    timeClient.forceUpdate();
  }

  // Configurar Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("Conectado a Firebase 🔥");
}


void enviarMedicion() {
  int humedad = analogRead(SENSOR_HUMEDAD);
  int luz = digitalRead(SENSOR_LUZ); // 0 = buena luz, 1 = poca luz
  String timestamp = timeClient.getFormattedTime();

  FirebaseJson json;
  json.set("humedad", humedad);
  json.set("luz", luz);
  json.set("timestamp", timestamp);

  String path = "/sensorReadings";
  if (Firebase.pushJSON(fbdo, path, json)) {
    Serial.println("✅ Datos enviados:");
    Serial.println(json.raw());
  } else {
    Serial.print("❌ Error al enviar: ");
    Serial.println(fbdo.errorReason());
  }
}

void regarAutomaticamente() {
  int humedad = analogRead(SENSOR_HUMEDAD);
  if (humedad > humedadUmbral) {
    Serial.println("Suelo seco - Encendiendo bomba 💧");
    digitalWrite(RELAY_PIN, HIGH);
    digitalWrite(LED_BUILTIN, LOW);
    delay(5000);
    digitalWrite(RELAY_PIN, LOW);
    delay(5000);
  } else {
    Serial.println("Suelo húmedo - Apagando bomba 🌱");
    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(LED_BUILTIN, HIGH);
  }
}

void regarPorComando() {
  Serial.println("Comando de riego recibido ⚙️");

  int humedad = analogRead(SENSOR_HUMEDAD);
  if (humedad > humedadUmbral) {
    digitalWrite(RELAY_PIN, HIGH);
    delay(5000);
    digitalWrite(RELAY_PIN, LOW);
    delay(10000);  // Tiempo de espera, a que se humedezca la tierra.
    humedad = analogRead(SENSOR_HUMEDAD);
    if (humedad > humedadUmbral) {
      Serial.println("Tierra muy seca, continuando el riego ➡️");
      digitalWrite(RELAY_PIN, HIGH);
      delay(5000);
      digitalWrite(RELAY_PIN, LOW);
    }
  }

  enviarMedicion();
  Firebase.set(fbdo, "/commands/regar/status", "completed");
}

void loop() {
  // Regar automaticamente si el umbral es menor a 500.
  regarAutomaticamente();

  // Revisa si hay comando de riego
  String comandoPath = "/commands/regar/status";
  if (Firebase.getString(fbdo, comandoPath) && fbdo.stringData() == "pending") {
    Serial.println("Riego por comando - ACTIVADO 💧");
    regarPorComando();
  }
  enviarMedicion();
  delay(10000);
}