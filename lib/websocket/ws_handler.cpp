#include <ws_handler.h>
#include <utils.h>

void onWebSocketMessage(AsyncWebSocketClient *client, void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_BINARY) {
    // receive degrees
    float val;
    memcpy(&val, data, sizeof(float));
    Serial.printf("Grados recibidos: %f\n", val);
    
    // convert to steps
    val = fmod(val, 360.0);
    int steps = degreesToSteps(val);
    Serial.printf("Steps calculados: %d\n", steps);
    
    // send steps to socket
    uint8_t buf[sizeof(int)];
    memcpy(buf, &steps, sizeof(int));
    client->binary(buf, sizeof(buf));
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {

  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("Cliente conectado: %u\n", client->id());
      break;

    case WS_EVT_DISCONNECT:
      Serial.printf("Cliente desconectado: %u\n", client->id());
      break;

    case WS_EVT_DATA:
      onWebSocketMessage(client, arg, data, len);
      break;
    
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}