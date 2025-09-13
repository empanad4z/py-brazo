#include <routes.h>
#include <utils.h>
#include <LittleFS.h>

void setupRoutes(AsyncWebServer &server) {
    server.serveStatic("/", LittleFS, "/");
    
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send(LittleFS, "/index.html", "text/html");
    });

    server.on("/", HTTP_POST, [](AsyncWebServerRequest *request) {
        if (request->hasParam("data", true)) {
            String valStr = request->getParam("data", true)->value();
            float val = valStr.toFloat();
            Serial.printf("Grados recibidos: %f\n", val);

            // convert to steps
            val = fmod(val, 360.0);
            int steps = degreesToSteps(val);
            Serial.printf("Steps calculados: %d\n", steps);

            //parseAndStoreTrajectory(coords);
            request->send(200, "text/plain", "Dibujo recibido!");
        } else {
        request->send(400, "text/plain", "No se recibieron datos");
        } 
    });

    server.on("/real-time", HTTP_GET, [](AsyncWebServerRequest *request) {
        request->send(LittleFS, "/interactive.html", "text/html");
    });
}