import { Card, CardContent, Typography, Box } from "@mui/material";

export default function SensorCard({ label, value, unit, color, }) {
  const sx = {};
  if (color) {
    sx.background = color;
    sx.color = "#fff";
    sx.borderRadius = 3;
  }

  return (
    <Card sx={sx}>
      <CardContent sx={{ width:180 }}>
        <Typography variant="h6">{label}</Typography>
        <Typography variant="h4">{value} {unit}</Typography>
      </CardContent>
    </Card>
  );
}
