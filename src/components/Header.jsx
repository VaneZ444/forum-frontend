import React, { useContext, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Chip, TextField, InputAdornment, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Search } from "@mui/icons-material";

export default function Header() {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const nav = useNavigate();
  const [query, setQuery] = useState("");

  const getRoleColor = () => {
    if (!user) return "grey";
    return isAdmin() ? "#1F4389" : "green";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) nav(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#202020" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Левый блок: логотип */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src="/favicon.ico" alt="logo" style={{ width: 32, height: 32 }} />
          <Typography variant="h6" component={Link} to="/" sx={{ color: "inherit", textDecoration: "none" }}>
            HMS Forum
          </Typography>
        </Box>

        {/* Правый блок */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Поиск */}
          <Box component="form" onSubmit={handleSearch}>
            <TextField
              size="small"
              placeholder="Поиск..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              sx={{
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FFAE00" },
                backgroundColor: "#303030",
                borderRadius: 1,
                width: 200
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" sx={{ color: "#fff" }}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {!user ? (
            <>
              <Button color="inherit" component={Link} to="/login">Войти</Button>
              <Button color="inherit" component={Link} to="/register">Регистрация</Button>
            </>
          ) : (
            <>
              <Chip
                label={user.nickname}
                avatar={<Box sx={{width: 12, height: 12, borderRadius: "50%", bgcolor: getRoleColor()}} />}
                variant="outlined"
                sx={{ color: "#fff", borderColor: "#555" }}
              />
              <Button color="inherit" onClick={() => { logout(); nav("/"); }}>Выйти</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
