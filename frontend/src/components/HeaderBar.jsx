import { Box, IconButton, Typography, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function HeaderBar({ onMenuOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#e8f5e9",
        borderBottom: "1px solid #ccc"
      }}
    >
      <IconButton onClick={onMenuOpen}>
        <MenuIcon />
      </IconButton>

      <Typography variant="h5" fontWeight="bold">
        Hệ thống tưới cây thông minh
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {user && (
          <Typography variant="body2">
            Xin chào, <strong>{user.fullName || user.username}</strong>
          </Typography>
        )}
        <Button
          variant="outlined"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </Box>
    </Box>
  );
}
