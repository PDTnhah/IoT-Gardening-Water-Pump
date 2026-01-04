import { Drawer, Box, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function Sidebar({ open, onClose, onNavigate }) {
  return (
    <Drawer open={open} onClose={onClose}>
      <Box sx={{ width: 240, p: 2 }}>
        <Typography variant="h6" mb={2}>Smart Garden</Typography>
        <List>
          <ListItem button onClick={() => { onNavigate?.('dashboard'); onClose?.(); }}>
            <ListItemText primary="Dashboard" />
          </ListItem>
          {/* <ListItem button onClick={() => { onNavigate?.('settings'); onClose?.(); }}>
            <ListItemText primary="Cài đặt" />
          </ListItem> */}
          <ListItem button onClick={() => { onNavigate?.('history'); onClose?.(); }}>
            <ListItemText primary="Lịch sử tưới" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
