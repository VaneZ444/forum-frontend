import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const { register } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState(""); // <-- 1. ДОБАВЛЕНО СОСТОЯНИЕ
    const nav = useNavigate();

    const submit = async () => {
        if (!email || !password || !nickname) {
            alert("Пожалуйста, заполните все поля.");
            return;
        }
        try {
            await register(email, password, nickname); // <-- 2. ПЕРЕДАЕМ НИКНЕЙМ
            alert("Зарегистрирован, войдите");
            nav("/login");
        } catch (e) {
            alert("Ошибка регистрации. Такой email или никнейм уже может существовать.");
        }
    };

    return (
        <Box sx={{ maxWidth: 480, margin: 'auto', mt: 5 }}>
            <Typography variant="h5">Регистрация</Typography>
            <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth sx={{ mt: 2 }} />
            <TextField type="password" label="Пароль" value={password} onChange={e=>setPassword(e.target.value)} fullWidth sx={{ mt: 2 }} />
            {/* 3. ДОБАВЛЕНО ПОЛЕ */}
            <TextField label="Никнейм" value={nickname} onChange={e=>setNickname(e.target.value)} fullWidth sx={{ mt: 2 }} />
            <Button variant="contained" sx={{ mt: 2 }} onClick={submit}>Зарегистрироваться</Button>
        </Box>
    );
}