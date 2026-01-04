import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function HeaderBar({ onMenuOpen }) {
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

      <Box />
    </Box>
  );
}
