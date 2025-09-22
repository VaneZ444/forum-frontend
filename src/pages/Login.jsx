import React, {useContext, useState} from "react";
import {AuthContext} from "../context/AuthContext";
import {TextField, Button, Box, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";

export default function Login() {
    const {login} = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const nav = useNavigate();

    const submit = async () => {
        try {
            const userInfo = await login(email, password);
            nav("/"); // теперь навигация идёт уже после обновления
        } catch (e) {
            alert(e);
        }
    };


    return (
        <Box sx={{maxWidth: 480}}>
            <Typography variant="h5">Войти</Typography>
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth sx={{mt: 2}}/>
            <TextField type="password" label="Пароль" value={password} onChange={e => setPassword(e.target.value)}
                       fullWidth sx={{mt: 2}}/>
            <Button variant="contained" sx={{mt: 2}} onClick={submit}>Войти</Button>
        </Box>
    );
}
