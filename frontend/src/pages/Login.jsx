import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
            Đăng Nhập
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />

            <TextField
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Đăng Nhập"}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              Chưa có tài khoản?{" "}
              <Link to="/register" style={{ textDecoration: "none", color: "#1976d2" }}>
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
