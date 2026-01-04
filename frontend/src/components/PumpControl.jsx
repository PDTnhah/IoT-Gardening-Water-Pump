import { Button } from "@mui/material";

export default function PumpControlButton({ pump, onToggle, disabled = false }) {
  return (
    <Button
      variant="contained"
      color={pump ? "error" : "primary"}
      size="large"
      onClick={onToggle}
      disabled={disabled}
    >
      {pump ? "Tắt bơm" : "Bật bơm"}
    </Button>
  );
}
