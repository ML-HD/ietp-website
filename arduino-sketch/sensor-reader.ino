#include <WiFi.h>
#include <HTTPClient.h>

// Define the analog pin
#define VOLTAGE_SENSOR_PIN 34 // Adjust to the pin you're using

// Constants for voltage calculation
const float ADC_RESOLUTION = 4095.0; // 12-bit ADC
const float REFERENCE_VOLTAGE = 3.3; // ESP32 ADC reference voltage
const float VOLTAGE_DIVIDER_RATIO = 5.0; // Adjust based on your sensor's specifications

// Wi-Fi credentials
const char *ssid = "Galaxy M12 61AA";        // Replace with your Wi-Fi SSID
const char *password = "jvkx0445"; // Replace with your Wi-Fi password

// Server URL
const char *serverUrl = "https://heman.serveo.net/sensor-data"; // Replace with your server's IP and port

void setup() {
  // Start serial communication
  Serial.begin(115200);

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Read the raw ADC value
    int rawValue = analogRead(VOLTAGE_SENSOR_PIN);

    // Convert the ADC value to voltage
    float measuredVoltage = (rawValue / ADC_RESOLUTION) * REFERENCE_VOLTAGE;

    // Adjust for voltage divider ratio
    float actualVoltage = measuredVoltage * VOLTAGE_DIVIDER_RATIO;

    // Send data to the server
    HTTPClient http;
    http.begin(serverUrl);

    // Create JSON payload
    String jsonPayload = "{";
    jsonPayload += "\"windSpeed\":0,"; // Placeholder if not measured
    jsonPayload += "\"voltage\":" + String(actualVoltage, 2) + ",";
    jsonPayload += "\"current\":0,";  // Placeholder if not measured
    jsonPayload += "\"power\":0";    // Placeholder if not measured
    jsonPayload += "}";

    // Set headers and POST data
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.printf("Data sent. HTTP Response code: %d\n", httpResponseCode);
    } else {
      Serial.printf("Error sending data. HTTP Response code: %d\n", httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("Wi-Fi disconnected. Reconnecting...");
    WiFi.begin(ssid, password);
    delay(1000);
  }

  delay(5000); // Adjust as needed
}
