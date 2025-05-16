#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <ESPmDNS.h>
#include <sdkconfig.h>

#ifndef CONFIG_SPIRAM_SUPPORT
#define CONFIG_SPIRAM_SUPPORT 0
#endif

// Wi-Fi credentials
const char* ssid = ""; //SSID
const char* password = ""; //PASSWORD
const char* hostname = "esp32-monitor";

// Pin configuration
#define voltage1Pin 34
#define voltage2Pin 35  // New voltage sensor
#define currentPin 14
#define mq135Pin   32
#define dhtPin     27
#define relayIN1   26
#define relayIN2   25
#define relayIN3   33
#define relayIN4   18

#define DHTTYPE DHT11
DHT dht(dhtPin, DHTTYPE);

const float referenceVoltage = 3.3;
const int adcResolution = 4095;
const float zeroCurrentVoltage = 2.48;

bool relayStates[4] = {false, false, false, false};

WebServer server(80);

void setup() {
  Serial.begin(115200);

  pinMode(relayIN1, OUTPUT);
  pinMode(relayIN2, OUTPUT);
  pinMode(relayIN3, OUTPUT);
  pinMode(relayIN4, OUTPUT);
  digitalWrite(relayIN1, HIGH);
  digitalWrite(relayIN2, HIGH);
  digitalWrite(relayIN3, HIGH);
  digitalWrite(relayIN4, HIGH);

  dht.begin();
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    if (MDNS.begin(hostname)) {
      Serial.println("mDNS responder started");
      Serial.print("You can access the server at http://");
      Serial.print(hostname);
      Serial.println(".local");
    }
  } else {
    Serial.println("\nWiFi connection failed. Running in AP mode");
    WiFi.mode(WIFI_AP);
    WiFi.softAP("ESP32-Monitor", "12345678");
    Serial.print("Access Point IP: ");
    Serial.println(WiFi.softAPIP());
  }

  server.enableCORS(true);

  server.on("/", handleRoot);
  server.on("/data", HTTP_GET, handleData);

  server.on("/toggle1", HTTP_POST, []() { toggleRelay(0, relayIN1); });
  server.on("/toggle2", HTTP_POST, []() { toggleRelay(1, relayIN2); });
  server.on("/toggle3", HTTP_POST, []() { toggleRelay(2, relayIN3); });
  server.on("/toggle4", HTTP_POST, []() { toggleRelay(3, relayIN4); });

  server.on("/shutdown", HTTP_POST, handleShutdown);
  server.begin();
  Serial.println("Web server started");
}

void loop() {
  server.handleClient();
}

void toggleRelay(int index, int pin) {
  relayStates[index] = !relayStates[index];
  digitalWrite(pin, relayStates[index] ? LOW : HIGH);
  StaticJsonDocument<64> doc;
  doc["relay"] = index + 1;
  doc["state"] = relayStates[index];
  doc["success"] = true;
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  server.send(200, "application/json", jsonResponse);
}

void handleShutdown() {
  for (int i = 0; i < 4; i++) relayStates[i] = false;
  digitalWrite(relayIN1, HIGH);
  digitalWrite(relayIN2, HIGH);
  digitalWrite(relayIN3, HIGH);
  digitalWrite(relayIN4, HIGH);

  StaticJsonDocument<64> doc;
  doc["shutdown"] = true;
  doc["success"] = true;
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  server.send(200, "application/json", jsonResponse);
}

void handleRoot() {
  float v1Raw = analogRead(voltage1Pin);
  float v2Raw = analogRead(voltage2Pin);
  float voltage1 = (v1Raw * referenceVoltage / adcResolution) * (25.0 / 3.3);
  float voltage2 = (v2Raw * referenceVoltage / adcResolution) * (25.0 / 3.3);

  float currentRaw = analogRead(currentPin);
  float currentVoltage = (currentRaw * referenceVoltage) / adcResolution;
  float current = 0.185;


  float power1 = voltage1 * current;
  float power2 = voltage2 * current;

  float airQualityRaw = analogRead(mq135Pin);
  float airQuality = map(airQualityRaw, 0, 4095, 0, 500);

  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  String html = "<!DOCTYPE html><html><head><title>ESP32 Environment Monitor</title>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<meta http-equiv='refresh' content='5'/>";
  html += "<style>body{font-family:Arial;text-align:center;background:#f0f0f0;padding:20px}";
  html += ".container{background:#fff;padding:20px;border-radius:10px;max-width:800px;margin:auto;box-shadow:0 4px 6px rgba(0,0,0,0.1)}";
  html += ".sensor{margin:10px;padding:10px;background:#f9f9f9;border-radius:5px}";
  html += "button{padding:10px 20px;margin:5px;border:none;border-radius:5px;cursor:pointer}";
  html += ".on{color:#4CAF50}.off{color:#f44336}.emergency{background:#f44336;color:white;font-weight:bold}";
  html += "</style></head><body><div class='container'>";
  html += "<h1>ESP32 Environment Monitor</h1>";
  html += "<p><strong>IP:</strong> " + WiFi.localIP().toString() + "</p>";

  html += "<div class='sensor'><h2>Sensor Readings</h2>";
  html += "<p><strong>Voltage 1:</strong> " + String(voltage1, 1) + " V</p>";
  html += "<p><strong>Voltage 2:</strong> " + String(voltage2, 1) + " V</p>";
  html += "<p><strong>Current:</strong> " + String(current, 2) + " A</p>";
  html += "<p><strong>Power 1:</strong> " + String(power1, 2) + " W</p>";
  html += "<p><strong>Power 2:</strong> " + String(power2, 2) + " W</p>";
  html += "<p><strong>Temperature:</strong> " + String(temp, 1) + " &deg;C</p>";
  html += "<p><strong>Humidity:</strong> " + String(hum, 1) + " %</p>";
  html += "<p><strong>Air Quality:</strong> " + String(airQuality, 0) + " AQI</p></div>";

  html += "<div class='sensor'><h2>Relays</h2>";
  for (int i = 0; i < 4; i++) {
    html += "<p>Relay " + String(i + 1) + ": <span class='" + (relayStates[i] ? "on'>ON" : "off'>OFF") + "</span>";
    html += "<button onclick='toggleRelay(" + String(i + 1) + ")'>Toggle</button></p>";
  }
  html += "</div><button class='emergency' onclick='shutdown()'>EMERGENCY SHUTDOWN</button>";
  html += "<script>function toggleRelay(id){fetch('/toggle'+id,{method:'POST'}).then(r=>r.json()).then(d=>{if(d.success)location.reload();});}";
  html += "function shutdown(){if(confirm('Shutdown all relays?'))fetch('/shutdown',{method:'POST'}).then(r=>r.json()).then(d=>{if(d.success)location.reload();});}</script>";
  html += "</div></body></html>";

  server.send(200, "text/html", html);
}

void handleData() {
  float v1Raw = analogRead(voltage1Pin);
  float v2Raw = analogRead(voltage2Pin);
  float voltage1 = (v1Raw * referenceVoltage / adcResolution) * (25.0 / 3.3);
  float voltage2 = (v2Raw * referenceVoltage / adcResolution) * (25.0 / 3.3);

  float currentRaw = analogRead(currentPin);
  float currentVoltage = (currentRaw * referenceVoltage) / adcResolution;
  float current = (currentVoltage - zeroCurrentVoltage) / 0.185;
  if (current < 0) current = 0;

  float power1 = voltage1 * current;
  float power2 = voltage2 * current;

  float gasRaw = analogRead(mq135Pin);
  float airQuality = map(gasRaw, 0, 4095, 0, 500);

  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  if (isnan(temp)) temp = 0;
  if (isnan(hum)) hum = 0;

  StaticJsonDocument<512> doc;
  doc["voltage1"] = voltage1;
  doc["voltage2"] = voltage2;
  doc["current"] = current;
  doc["power1"] = power1;
  doc["power2"] = power2;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["airQuality"] = airQuality;

  JsonArray relays = doc.createNestedArray("relays");
  for (int i = 0; i < 4; i++) {
    JsonObject relay = relays.createNestedObject();
    relay["id"] = i + 1;
    relay["state"] = relayStates[i];
  }

  String jsonResponse;
  serializeJson(doc, jsonResponse);
  server.send(200, "application/json", jsonResponse);

}
