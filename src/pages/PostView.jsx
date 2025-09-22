import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { Typography, Box, Paper, Divider, TextField, Button, List, ListItem, ListItemText } from "@mui/material";
import { AuthContext } from "../context/AuthContext";

export default function PostView() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const { user } = useContext(AuthContext);

    const fetchPost = async () => {
        try {
            const r = await api.getPost(id);
            setPost(r.data.post || r.data);

            const c = await api.listComments(id);
            const data = c.data.comments || c.data;
            setComments(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    const submitComment = async () => {
        if (!user) return alert("Только для авторизованных пользователей");
        if (!content.trim()) return;

        try {
            await api.createComment(Number(id), content.trim());
            setContent("");
            fetchPost(); // обновляем список комментариев
        } catch (e) {
            console.error(e);
            alert("Ошибка при добавлении комментария");
        }
    };

    return (
        <Box sx={{ px: 3, py: 4, backgroundColor: "#202020", minHeight: "100vh", color: "#fff" }}>
            {post && (
                <Paper sx={{ p: 3, mb: 3, backgroundColor: "#303030", border: "1px solid #505050" }}>
                    <Typography variant="h5" sx={{ color: "#eee", mb: 1 }}>{post.title}</Typography>
                    <Typography sx={{ color: "#ddd", whiteSpace: 'pre-wrap', mb: 1 }}>{post.content}</Typography>
                    {post.images && Array.isArray(post.images) && post.images.map((name, i) => (
                        <img
                            key={i}
                            src={api.imageUrl(name)}
                            alt={`image-${i}`}
                            style={{ maxWidth: "100%", marginTop: 8, borderRadius: 4 }}
                        />
                    ))}
                </Paper>
            )}

            <Divider sx={{ my: 2, borderColor: "#505050" }} />

            <Typography variant="h6" sx={{ color: "#eee", mb: 1 }}>Комментарии</Typography>
            <List>
                {comments.length > 0 ? comments.map(c => (
                    <ListItem key={c.id} sx={{ p: 1, mb: 1, backgroundColor: "#303030", border: "1px solid #505050", borderRadius: 2 }}>
                        <ListItemText
                            primary={`${c.author_name || 'Unknown'} • ${new Date(c.created_at?.seconds ? c.created_at.seconds * 1000 : c.createdAt).toLocaleString()}`}
                            secondary={c.content}
                            primaryTypographyProps={{ color: "#ccc", fontSize: 13 }}
                            secondaryTypographyProps={{ color: "#fff", fontSize: 13, whiteSpace: "pre-wrap" }}
                        />
                    </ListItem>
                )) : (
                    <Typography sx={{ mt: 1, fontStyle: "italic", color: "#888" }}>No comments yet</Typography>
                )}
            </List>

            {user && (
                <Box component="form" onSubmit={(e) => { e.preventDefault(); submitComment(); }} sx={{ mt: 2 }}>
                    <TextField
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add a comment..."
                        sx={{
                            backgroundColor: "#303030",
                            "& .MuiInputBase-input": { color: "#fff" },
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#505050" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#777" },
                            "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FFAE00" }
                        }}
                    />
                    <Button sx={{ mt: 1 }} variant="contained" color="primary" type="submit">
                        Отправить
                    </Button>
                </Box>
            )}
        </Box>
    );
}
