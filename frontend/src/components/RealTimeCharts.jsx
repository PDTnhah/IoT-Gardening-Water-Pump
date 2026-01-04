import { Box, Typography, Paper } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

const ChartBox = ({ title, data, color}) => {
  if (data.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="caption">No data</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2">{title}</Typography>

      <LineChart
        dataset={data.map(p => ({
          time: p.x,
          value: p.y,
        }))}
        xAxis={[
          {
            dataKey: 'time',
            scaleType: 'time',
          },
        ]}
        series={[
          {
            dataKey: 'value',
            label: title,
            color,
            showMark: false,
          },
        ]}
        height={200}
        margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
      />
    </Paper>
  );
};

export default function RealTimeCharts({ tempSeries, humSeries, soilSeries }) {
  return (
    <Box
      mt={3}
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
      gap={2}
    >
      <ChartBox
        title="Nhiệt độ (°C)"
        data={tempSeries}
        color="#ef5350"
      />

      <ChartBox
        title="Độ ẩm không khí (%)"
        data={humSeries}
        color="#42a5f5"
      />

      <ChartBox
        title="Độ ẩm đất (%)"
        data={soilSeries}
        color="#66bb6a"
      />
    </Box>
  );
}
