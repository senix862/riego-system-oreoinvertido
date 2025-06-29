#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <NTPClient.h>
#include <WiFiUDP.h>

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

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000);

int humedadAnterior = 50;

void setup() {
  Serial.begin(9600);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(SENSOR_LUZ, INPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi conectado");

  timeClient.begin();
  while (!timeClient.update()) {
    timeClient.forceUpdate();
  }

  // Configuración de Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("🔥 Conectado a Firebase");
}

void loop() {
  int humedad = medirHumedadSimulada();
  int luz = digitalRead(SENSOR_LUZ);  // 0 = buena luz, 1 = poca luz

  if (humedad < 45) {
    Serial.println("💧 Suelo seco - Encendiendo bomba");
    digitalWrite(RELAY_PIN, HIGH);
    digitalWrite(LED_BUILTIN, LOW);
  } else {
    Serial.println("🌱 Suelo húmedo - Apagando bomba");
    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(LED_BUILTIN, HIGH);
  }

  String timestamp = timeClient.getFormattedTime();

  FirebaseJson json;
  json.set("humedad", humedad);
  json.set("luz", luz);
  json.set("timestamp", timestamp);

  String path = "/sensorReadings";
  if (Firebase.pushJSON(fbdo, path, json)) {
    Serial.println("Datos enviados correctamente ✅:");
    Serial.println(json.raw());
  } else {
    Serial.print("Error al enviar datos ❌: ");
    Serial.println(fbdo.errorReason());
  }

  delay(10000);
}

// ---------- Simulación de humedad ----------
int medirHumedadSimulada() {
  int variacion = random(-5, 6);
  humedadAnterior = constrain(humedadAnterior + variacion, 30, 80);
  return humedadAnterior;
}
