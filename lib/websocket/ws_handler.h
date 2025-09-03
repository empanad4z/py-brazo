#pragma once
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

// websocket callback for receive message from client socket
void onWebSocketMessage(AsyncWebSocketClient *client, void *arg, uint8_t *data, size_t len);

// websocket event manager
void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len);