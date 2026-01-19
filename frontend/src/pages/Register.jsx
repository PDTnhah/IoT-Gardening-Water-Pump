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

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      const result = await register(username, password, fullName);
      if (result.success) {
        setSuccess(true);
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        // Redirect to login sau 2 giây
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(result.error || "Đăng ký thất bại");
      }
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
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
            Đăng Ký Tài Khoản
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Đăng ký thành công! Chuyển hướng đến trang đăng nhập...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Tên đầy đủ"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              required
              disabled={loading}
            />

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
              helperText="Tối thiểu 6 ký tự"
            />

            <TextField
              label="Xác nhận mật khẩu"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? <CircularProgress size={24} /> : "Đăng Ký"}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              Đã có tài khoản?{" "}
              <Link to="/login" style={{ textDecoration: "none", color: "#1976d2" }}>
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
