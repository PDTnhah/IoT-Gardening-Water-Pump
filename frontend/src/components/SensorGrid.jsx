import { Grid } from "@mui/material";
import SensorCard from "./SensorCard";

export default function SensorGrid({ items = [] }) {
  return (
    <Grid container spacing={3} alignItems="stretch">
      {items.map((it, idx) => (
        <Grid item xs={12} sm={6} lg={3} key={idx} sx={{ display: "flex" }}>
          <SensorCard label={it.label} value={it.value} unit={it.unit} color={it.color} />
        </Grid>
      ))}
    </Grid>
  );
}
