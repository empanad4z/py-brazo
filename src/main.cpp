#include <WiFi.h>
#include <ws_handler.h>
#include <utils.h>
#include <routes.h>
#include <LittleFS.h>

// Config WiFi
const char* ssid = "David";
const char* password = "88rkl446";

// Server and socket
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// Initialize LittleFS
void initLittleFS() {
  if (!LittleFS.begin(true)) {
    Serial.println("An error has occurred while mounting LittleFS");
  }
  Serial.println("LittleFS mounted successfully");
}


void setup() {
  Serial.begin(115200);
  initLittleFS();

  WiFi.begin(ssid, password);
  Serial.println("Conectando a WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // WebSocket for real-time responses
  ws.onEvent(onEvent);
  server.addHandler(&ws);

  // Web page
  setupRoutes(server);  
  server.begin();
}

void loop() {
  // Keep websocket active
  ws.cleanupClients();
}
