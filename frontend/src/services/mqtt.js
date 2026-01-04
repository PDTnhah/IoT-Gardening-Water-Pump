import mqtt from "mqtt";

const MQTT_USERNAME = "Admin123";
const MQTT_PASSWORD = "Admin123";

// WebSocket Secure Endpoint của HiveMQ Cloud
const MQTT_URL = "wss://28f49484412341f9a4480874c05255d3.s1.eu.hivemq.cloud:8884/mqtt";

export const DEVICE_ID = "esp32_simu";
export const TOPIC_DATA = `devices/${DEVICE_ID}/data`;
export const TOPIC_STATUS = `devices/${DEVICE_ID}/status`;

// Tạo kết nối MQTT
export function connectMQTT(onMessage) {
  const options = {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    clean: true,
    reconnectPeriod: 2000,
    connectTimeout: 30 * 1000,
    protocol: "wss",
  };

  console.log("Connecting to MQTT...");

  const client = mqtt.connect(MQTT_URL, options);

  client.on("connect", () => {
    console.log(" MQTT Connected (HiveMQ Cloud)");
    // Subscribe to both data and status topics for this device
    client.subscribe([TOPIC_DATA, TOPIC_STATUS]);
    console.log(" Subscribed to:", TOPIC_DATA, TOPIC_STATUS);
  });

  client.on("error", (err) => {
    console.error(" MQTT Error:", err);
  });

  client.on("message", (topic, message) => {
    const text = message.toString();
    console.log(" Received:", topic, text);

    try {
      const parsed = JSON.parse(text);
      onMessage(topic, parsed);
    } catch (err) {
      console.warn("Failed to parse MQTT message:", err);
      onMessage(topic, text);
    }
  });

  return client;
}

// Hàm publish ra MQTT
export function mqttPublish(client, data, topic = TOPIC_STATUS) {
  if (!client) return;

  const msg = typeof data === "string" ? data : JSON.stringify(data);
  client.publish(topic, msg);
  console.log("Published to", topic, ":", msg);
}
