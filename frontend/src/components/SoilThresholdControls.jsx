import { useState, useEffect } from "react";
import { Stack, TextField, Button, Typography } from "@mui/material";

export default function SoilThresholdControls({
  initialMin = 30,
  initialMax = 70,
  onSave,
  size = "large",
}) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  const [error, setError] = useState("");

  useEffect(() => {
    setMin(initialMin);
  }, [initialMin]);

  useEffect(() => {
    setMax(initialMax);
  }, [initialMax]);

  const handleSave = () => {
    const n = Number(min);
    const m = Number(max);
    if (Number.isNaN(n) || Number.isNaN(m)) {
      setError("Giá trị phải là số");
      return;
    }
    if (n >= m) {
      setError("Min phải nhỏ hơn Max");
      return;
    }
    setError("");
    if (onSave) onSave({ min: n, max: m });
  };

  return (
    <div>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <TextField
          label="Soil Threshold Min"
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          size={size}
        />

        <TextField
          label="Soil Threshold Max"
          type="number"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          size={size}
        />

        <Button variant="contained" onClick={handleSave} size="large"  >
          Lưu
        </Button>
      </Stack>

      {error && (
        <Typography color="error" variant="body2" mt={1}>
          {error}
        </Typography>
      )}
    </div>
  );
}
