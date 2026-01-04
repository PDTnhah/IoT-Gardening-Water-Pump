import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from "@mui/material";
import { getPumpHistory } from "../services/api";

/* ===== Helpers ===== */

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("vi-VN");
}

function formatTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleTimeString("vi-VN");
}

function formatAction(action) {
  if (action === "PUMP_ON") return "TƯỚI CÂY";
  if (action === "PUMP_OFF") return "NGẮT BƠM";
  return action || "-";
}

/* ===== Component ===== */

export default function PumpHistory({ deviceId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deviceId) return;

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await getPumpHistory(deviceId, controller.signal);

        // Sắp xếp mới nhất lên trên
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setEntries(sorted);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || String(err));
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [deviceId]);

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Lịch sử bơm
      </Typography>

      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="body2" mb={1}>
          Thiết bị: {deviceId}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">Lỗi: {error}</Typography>
        ) : entries.length === 0 ? (
          <Typography>Không có dữ liệu lịch sử.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Giờ</TableCell>
                <TableCell>Trạng thái bơm</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {entries.map((e) => (
                <TableRow key={e._id}>
                  <TableCell>{formatDate(e.createdAt)}</TableCell>
                  <TableCell>{formatTime(e.createdAt)}</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      // color: e.action === "PUMP_ON" ? "green" : "red",
                    }}
                  >
                    {formatAction(e.action)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
