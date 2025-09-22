import React from "react";
import { Box, Typography, Paper } from "@mui/material";

export default function NoAccessModal({ message = "Нет доступа" }) {
  return (
    <Box sx={{ mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">{message}</Typography>
        <Typography sx={{ mt: 1 }}>У вас нет прав для выполнения действия.</Typography>
      </Paper>
    </Box>
  );
}
