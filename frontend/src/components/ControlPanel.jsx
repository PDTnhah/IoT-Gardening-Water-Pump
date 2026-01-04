import { useEffect, useState } from "react";
import { Card, Typography, Divider, Box, FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress } from "@mui/material";
import PumpControlButton from "./PumpControl";
import SoilThresholdControls from "./SoilThresholdControls";
import { getDevice, updateDeviceConfig, postControlMode, postControlPump } from "../services/api";

export default function ControlPanel({
  pump,
  onToggle,
  deviceId,
  soilThresholdMin = 30,
  soilThresholdMax = 70,
  onThresholdsChange,
  deviceMode, // optional: parent-provided mode
  onModeChange, // optional: parent callback to update mode
}) {
  const [min, setMin] = useState(soilThresholdMin);
  const [max, setMax] = useState(soilThresholdMax);
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState(deviceMode ?? "auto");
  const [loadingMode, setLoadingMode] = useState(false);
  const [loadingPump, setLoadingPump] = useState(false);

  useEffect(() => {
    // fetch device config when mounting or deviceId changes

    let mounted = true;
    if (!deviceId) return;
    (async () => {
      try {
        const data = await getDevice(deviceId);
        if (!mounted) return;
        if (data && data.config) {
          setMin(data.config.soilThresholdMin ?? soilThresholdMin);
          setMax(data.config.soilThresholdMax ?? soilThresholdMax);
            // detect mode from device config (may be 'auto'|'manual_on'|'manual_off')
            const cfgMode = data.config.mode ?? data.mode ?? "auto";
            if (typeof cfgMode === "string" && deviceMode === undefined) setMode(cfgMode);
        }
      } catch (err) {
        console.error("Failed to fetch device:", err);
      }
    })();
    return () => (mounted = false);
  }, [deviceId]);

  // keep local mode in sync with parent-provided deviceMode
  useEffect(() => {
    if (deviceMode !== undefined && deviceMode !== mode) setMode(deviceMode);
  }, [deviceMode]);

  const handleSave = async ({ min: newMin, max: newMax }) => {
    // setStatus("Saving...");
    try {
      if (deviceId) {
        const saved = await updateDeviceConfig(deviceId, {
          soilThresholdMin: newMin,
          soilThresholdMax: newMax,
        });
        setMin(saved.config?.soilThresholdMin ?? newMin);
        setMax(saved.config?.soilThresholdMax ?? newMax);
        // setStatus("Saved");
      } else {
        setMin(newMin);
        setMax(newMax);
        // setStatus("Saved (local)");
      }
      if (onThresholdsChange) onThresholdsChange({ min: newMin, max: newMax });
    } catch (err) {
      console.error(err);
      setStatus("Save failed");
    } finally {
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const isManual = mode && mode.startsWith("manual");

  const handleModeChange = async (evt) => {
    const val = evt.target.value; // 'auto' or 'manual'
    if (!deviceId) return setMode(val === 'manual' ? (pump ? 'manual_on' : 'manual_off') : 'auto');
    setLoadingMode(true);
    try {
      if (val === 'auto') {
        await postControlMode(deviceId, 'auto');
        setMode('auto');
        if (onModeChange) onModeChange('auto');
      } else {
        // set manual preserving current pump state
        const desired = pump ? 'manual_on' : 'manual_off';
        await postControlMode(deviceId, desired);
        setMode(desired);
        if (onModeChange) onModeChange(desired);
      }
    } catch (err) {
      console.error('Failed to set mode:', err);
    } finally {
      setLoadingMode(false);
    }
  };

  const handlePumpToggle = async () => {
    if (!isManual) return; // disabled when not manual
    const newPumpState = !pump;
    setLoadingPump(true);
    try {
      // call parent toggle (MQTT optimistic update)
      if (onToggle) onToggle();
      // persist via REST
      await postControlPump(deviceId, newPumpState);
      // update local mode to reflect manual_on/manual_off
      const newMode = newPumpState ? 'manual_on' : 'manual_off';
      setMode(newMode);
      if (onModeChange) onModeChange(newMode);
    } catch (err) {
      console.error('Failed to change pump via API:', err);
    } finally {
      setLoadingPump(false);
    }
  };

  return (
    <Card sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" mb={2}>Điều khiển thiết bị</Typography>
      <Divider sx={{ mb: 3 }} />

      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
        <Box>
          <Typography variant="h6">
            Trạng thái bơm: {" "}
            <strong style={{ color: pump ? "#d32f2f" : "#2e7d32" }}>
              {pump ? "Đang chạy" : "Đang tắt"}
            </strong>
          </Typography>
          <Box mt={1} display="flex" alignItems="center" gap={1}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="mode-select-label">Chế độ</InputLabel>
              <Select
                labelId="mode-select-label"
                value={isManual ? 'manual' : 'auto'}
                label="Chế độ"
                onChange={handleModeChange}
              >
                <MenuItem value="auto">Auto</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
              <FormHelperText>
                {loadingMode ? <span>Đang cập nhật... <CircularProgress size={12} /></span> : (isManual ? 'Manual cho phép bật/tắt thủ công' : 'Auto: hệ thống tự điều khiển')}
              </FormHelperText>
            </FormControl>
          </Box>
        </Box>

        <Box>
          <PumpControlButton pump={pump} onToggle={handlePumpToggle} disabled={!isManual || loadingPump} />
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" mb={1}>Tùy chỉnh ngưỡng độ ẩm đất</Typography>

        <SoilThresholdControls
          initialMin={min}
          initialMax={max}
          onSave={handleSave}
        />

        {status && (
          <Typography variant="body2" mt={1} color={status.startsWith('Saved') ? 'success.main' : 'text.secondary'}>
            {status}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
