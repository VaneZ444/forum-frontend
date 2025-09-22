import React, {useEffect, useRef, useState, useContext, useCallback} from "react";
import {Box, Typography, TextField, Button, Paper, IconButton, Avatar} from "@mui/material";
import {Close, Refresh} from "@mui/icons-material";
import {AuthContext} from "../context/AuthContext";
import { chatService } from "../api/api";

export function ChatBox() {
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [isOpen, setIsOpen] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState("disconnected");
    const {user} = useContext(AuthContext);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    useEffect(scrollToBottom, [messages]);

    const handleMessage = useCallback((msg) => setMessages((prev) => [...prev, msg]), []);
    const handleOpen = useCallback(() => { setConnectionStatus("connected"); setMessages([]); }, []);
    const handleClose = useCallback(() => setConnectionStatus("disconnected"), []);
    const handleError = useCallback((error) => { setConnectionStatus("error"); console.error(error); }, []);

    useEffect(() => {
        if (!isOpen) return chatService.disconnect();
        chatService.connect(handleMessage, handleOpen, handleClose, handleError);
        return () => chatService.disconnect();
    }, [user, isOpen, handleMessage, handleOpen, handleClose, handleError]);

    const sendMessage = () => {
        if (!content.trim()) return;
        chatService.sendMessage(content);
        setContent("");
    };
    const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
    const reconnect = () => { setMessages([]); chatService.disconnect(); chatService.connect(handleMessage, handleOpen, handleClose, handleError); };

    if (!isOpen) return null;

    return (
        <Paper
            elevation={6}
            sx={{
                position: "fixed",
                bottom: 20,
                right: 20,
                width: 350,
                height: 450,
                zIndex: 1300,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#202020",
                color: "#fff"
            }}
        >
            {/* Заголовок */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, borderBottom: "1px solid #555", backgroundColor: "#202020" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="subtitle1">Чат</Typography>
                    <Box sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        ml: 1,
                        backgroundColor: connectionStatus === "connected" ? "green" : "red"
                    }} />
                </Box>
                <Box>
                    <IconButton size="small" sx={{ color: 'white', mr: 1 }} onClick={reconnect} title="Переподключиться">
                        <Refresh />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'white' }} onClick={() => setIsOpen(false)}>
                        <Close />
                    </IconButton>
                </Box>
            </Box>

            {/* Сообщения */}
            <Box sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': { background: '#202020' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#505050', borderRadius: '4px' }
            }}>
                {messages.length === 0 ? (
                    <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'rgba(255,255,255,0.6)' }}>
                        Нет сообщений
                    </Typography>
                ) : (
                    messages.map((m, index) => (
                        <Box key={m.id || m.tempId || index} sx={{ mb: 1.5, opacity: m.isPending ? 0.7 : 1 }}>
                            <Box sx={{
                                display: 'inline-block',
                                p: 1,
                                borderRadius: 5,
                                backgroundColor: '#303030',
                                paddingLeft:2,
                                paddingRight:4
                            }}>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#2b6ffd' }}>
                                    {m.author_name}:
                                </Typography>
                                <Typography variant="body2" sx={{ wordWrap: 'break-word', color: '#eee' }}>
                                    {m.content}
                                </Typography>
                                {m.created_at && (
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'rgba(255,255,255,0.7)' }}>
                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        {m.isPending && " (отправляется...)"}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    ))
                )}
                <div ref={messagesEndRef} />
            </Box>


            {/* Поле ввода */}
            {user ? (
                <Box component="form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }} sx={{ display: "flex", p: 1, borderTop: "1px solid #555" }}>
                    <TextField
                        fullWidth
                        size="small"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Сообщение..."
                        autoComplete="off"
                        disabled={connectionStatus !== "connected"}
                        sx={{
                            '& .MuiInputBase-input': { color: '#fff' },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#aaa' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                        }}
                    />
                    <Button
                        type="submit"
                        disabled={!content.trim() || connectionStatus !== "connected"}
                        sx={{
                            ml: 1,
                            backgroundColor: '#1F4389',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: '#163771'
                            }
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ color: '#eee' }}>
                            send
                        </span>
                    </Button>
                </Box>
            ) : (
                <Box sx={{ p: 2, borderTop: "1px solid #555", textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Войдите, чтобы отправлять сообщения
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}
