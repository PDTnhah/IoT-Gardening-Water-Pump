import { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper } from "@mui/material";

import Sidebar from "../components/Sidebar";
import HeaderBar from "../components/HeaderBar";
import SensorGrid from "../components/SensorGrid";
import ControlPanel from "../components/ControlPanel";
import RealTimeCharts from "../components/RealTimeCharts";
import PumpHistory from "./PumpHistory";
import { connectMQTT, mqttPublish, TOPIC_DATA, TOPIC_STATUS, DEVICE_ID } from "../services/mqtt";

export default function Dashboard() {
  const [pump, setPump] = useState(false);
  const [mode, setMode] = useState('auto');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState('dashboard');

  // live sensor state (updated from MQTT messages)
  const [data, setData] = useState({
    temperature: 27,
    humidityAir: 68,
    humiditySoil: 42,
    light: 820,
  });

  // MQTT client stored in ref so updates don't re-render component
  const mqttClientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [tempSeries, setTempSeries] = useState([]);
  const [humSeries, setHumSeries] = useState([]);
  const [soilSeries, setSoilSeries] = useState([]);
  const maxPoints = 30;

  useEffect(() => {
    // connect and set up message handler
    const client = connectMQTT((topic, msg) => {
      if (!msg) return;

      // If message came on data topic, update sensors
      if (topic === TOPIC_DATA) {
        // msg expected to be object with sensor fields
        setData((prev) => ({ ...prev,
          ...(msg.temp !== undefined ? { temperature: msg.temp } : {}),
          ...(msg.humidity !== undefined ? { humidityAir: msg.humidity } : {}),
          ...(msg.soil !== undefined ? { humiditySoil: msg.soil } : {}),
        }));
        setLastUpdate(new Date().toISOString());
        // append to time series
        if (msg.temp !== undefined) {
          setTempSeries((prev) => {
            const next = [...prev.slice(-maxPoints + 1), { x: new Date(), y: msg.temp }];
            console.debug('append tempSeries', next.length, next[next.length-1]);
            return next;
          });
        }
        if (msg.humidity !== undefined) {
          setHumSeries((prev) => {
            const next = [...prev.slice(-maxPoints + 1), { x: new Date(), y: msg.humidity }];
            console.debug('append humSeries', next.length, next[next.length-1]);
            return next;
          });
        }
        if (msg.soil !== undefined) {
          setSoilSeries((prev) => {
            const next = [...prev.slice(-maxPoints + 1), { x: new Date(), y: msg.soil }];
            console.debug('append soilSeries', next.length, next[next.length-1]);
            return next;
          });
        }
        return;
      }

      // If message came on status topic, update pump state (or other status fields)
      if (topic === TOPIC_STATUS) {
        if (typeof msg === "object" && msg.pump !== undefined) {
          setPump(Boolean(msg.pump));
          setLastUpdate(new Date().toISOString());
        }
        if (typeof msg === "object" && msg.mode !== undefined) {
          // msg.mode expected to be 'auto'|'manual_on'|'manual_off'
          setMode(msg.mode);
          setLastUpdate(new Date().toISOString());
        }
        return;
      }

      // Fallback: if message contains fields, merge into data and pump
      if (typeof msg === "object") {
        setData((prev) => ({ ...prev,
          ...(msg.temperature !== undefined ? { temperature: msg.temperature } : {}),
          ...(msg.humidityAir !== undefined ? { humidityAir: msg.humidityAir } : {}),
          ...(msg.humiditySoil !== undefined ? { humiditySoil: msg.humiditySoil } : {}),
          ...(msg.light !== undefined ? { light: msg.light } : {}),
        }));
        if (msg.pump !== undefined) setPump(Boolean(msg.pump));
        setLastUpdate(new Date().toISOString());
      }
    });

    mqttClientRef.current = client;

    // attach connection events to reflect status in UI
    try {
      client.on("connect", () => setConnected(true));
      client.on("reconnect", () => setConnected(false));
      client.on("offline", () => setConnected(false));
      client.on("close", () => setConnected(false));
      client.on("error", () => setConnected(false));
    } catch (err) {
      console.debug("Failed to attach MQTT client events:", err);
    }

    return () => {
      // cleanup mqtt connection on unmount
      try {
        if (mqttClientRef.current) {
          mqttClientRef.current.end(true);
          mqttClientRef.current = null;
        }
      } catch (e) {
        console.warn("Error while disconnecting MQTT:", e);
      }
    };
  }, []);

  const togglePump = () => {
    setPump((p) => {
      const newState = !p;

      // publish MQTT command to request pump change
      const client = mqttClientRef.current;
      const payload = { cmd: "mode", value: newState ? "manual_on" : "manual_off" };
      try {
        mqttPublish(client, payload, TOPIC_STATUS);
      } catch (e) {
        console.error("Failed to publish pump command:", e);
      }

      return newState;
    });
  };

  const sensors = [
    { label: "Nhiệt độ", value: data.temperature, unit: "°C", color: "#ef5350", connected, lastUpdate },
    { label: "Độ ẩm không khí", value: data.humidityAir, unit: "%", color: "#42a5f5", connected, lastUpdate },
    { label: "Độ ẩm đất", value: data.humiditySoil, unit: "%", color: "#66bb6a", connected, lastUpdate },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} onNavigate={(v) => setView(v)} />

      <Box sx={{ flexGrow: 1 }}>
        <HeaderBar onMenuOpen={() => setDrawerOpen(true)} />

        <Box sx={{ p: 3 }}>
          {view === 'history' ? (
            <PumpHistory deviceId={DEVICE_ID} />
          ) : (
            <>
              {/* Status row: connection + last update */}
              <Paper sx={{ p: 1, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }} elevation={1}>
                <Typography variant="body2">MQTT:</Typography>
                <Typography variant="body2" sx={{ color: connected ? 'green' : 'red', fontWeight: 700 }}>
                  {connected ? 'Connected' : 'Disconnected'}
                </Typography>
              </Paper>

              <SensorGrid items={sensors} />

              <RealTimeCharts tempSeries={tempSeries} humSeries={humSeries} soilSeries={soilSeries} />

              <Box mt={5}>
                <ControlPanel pump={pump} onToggle={togglePump} deviceId={DEVICE_ID} deviceMode={mode} onModeChange={setMode} />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
