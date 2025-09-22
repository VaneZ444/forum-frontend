import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, List, ListItem, ListItemButton, ListItemText, IconButton, Button } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import PostDialog from "../components/PostDialog"; // компонент создания/редактирования поста
import DeletePostDialog from "../components/DeletePostDialog";

export default function Topic() {
    const { id } = useParams();
    const nav = useNavigate();
    const { isAuthorized } = useContext(AuthContext);
    const [commentsMap, setCommentsMap] = useState({}); 
    const [topic, setTopic] = useState(null);
    const [posts, setPosts] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editPost, setEditPost] = useState(null);
    const [deletePost, setDeletePost] = useState(null);

    const fetchPosts = async () => {
        try {
            const r = await api.listPosts(id);
            const postsData = r.data.posts || [];
            api.getTopic(id)
                .then(r => setTopic(r.data.topic || r.data))
                .catch(console.error);
            setPosts(postsData);

            const newCommentsMap = {};
            await Promise.all(postsData.map(async post => {
            try {
                const res = await api.listComments(post.id);
                newCommentsMap[post.id] = res.data.comments || [];
            } catch {
                newCommentsMap[post.id] = [];
            }
            }));
            setCommentsMap(newCommentsMap);

        } catch (err) {
            console.error(err);
        }
        };

    useEffect(() => {
        fetchPosts();
    }, [id]);

    const handleSavePost = async (postData) => {
        if (!postData || !postData.content) return;

        const url = postData.id ? `/api/forum/posts/${postData.id}` : `/api/forum/posts`;
        const method = postData.id ? "PUT" : "POST";

        const payload = postData.id
            ? { id: postData.id, title: postData.title, content: postData.content, topic_id: Number(id) } // апдейт
            : { title: postData.title, content: postData.content, topic_id: Number(id) };               // создание

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setOpenDialog(false);
                setEditPost(null);
                await fetchPosts(); // обновляем список после успешного ответа
            } else {
                console.error("Failed to save post", await res.text());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeletePost = async (postId) => {
        await fetch(`/api/forum/posts/${postId}`, {
            method: "DELETE",
            headers: { "Authorization": localStorage.getItem("token") },
        });
        setDeletePost(null);
        fetchPosts();
    };

    return (
        <Box sx={{ px: 3, py: 4, backgroundColor: "#202020", minHeight: "100vh", color: "#fff" }}>
            {/* Заголовок топика */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 2 }}>{topic?.title + " topic"}</Typography>
                {isAuthorized() && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => { setEditPost(null); setOpenDialog(true); }}
                    >
                        Create Post
                    </Button>
                )}
            </Box>

            {/* Сетка постов */}
            <Grid container spacing={3}>
                {(Array.isArray(posts) ? posts : []).map(post => (
                    <Grid item xs={12} sm={6} md={4} key={post.id}>
                    <Paper sx={{ p: 2, backgroundColor: "#303030", border: "1px solid #505050", position: "relative", "&:hover": { backgroundColor: "#383838" } }}>
                        {/* Заголовок поста */}
                        <Box sx={{ cursor: "pointer", mb: 1 }} onClick={() => nav(`/posts/${post.id}`)}>
                        <Typography variant="h6" sx={{ color: "#eee" }}>
                            {post.title || (post.content?.slice(0, 50) + (post.content?.length > 50 ? "..." : ""))}
                        </Typography>
                        </Box>

                        {/* Автор, дата, preview контента */}
                        <Typography variant="subtitle2" sx={{ color: "#ccc", mb: 1 }}>
                        {post.author_nickname || "Unknown"} • {new Date(post.created_at?.seconds ? post.created_at.seconds * 1000 : post.createdAt).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#eee", mb: 1 }}>
                        {post.content.slice(0, 30)}{post.content.length > 30 ? "..." : ""}
                        </Typography>

                        {/* Последние 2 комментария */}
                        <List dense sx={{ pl: 2, mb: 1 }}>
                        {(commentsMap[post.id] || []).slice(-2).map(comment => (
                            <ListItem key={comment.id} sx={{ py: 0.5 }}>
                            <ListItemText
                                primary={`${comment.author_nickname || "Unknown"} • ${new Date(comment.created_at?.seconds ? comment.created_at.seconds * 1000 : comment.createdAt).toLocaleString()}`}
                                secondary={comment.content.slice(0, 20) + (comment.content.length > 20 ? "..." : "")}
                                primaryTypographyProps={{ color: "#ccc", fontSize: 13 }}
                                secondaryTypographyProps={{ color: "#888", fontSize: 12 }}
                            />
                            </ListItem>
                        ))}
                        </List>

                        {/* Кнопки редактирования/удаления */}
                        {isAuthorized() && (
                        <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
                            <IconButton size="small" sx={{ color: "#eee" }} onClick={(e) => { e.stopPropagation(); setEditPost(post); setOpenDialog(true); }}>
                            <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: "#eee" }} onClick={(e) => { e.stopPropagation(); setDeletePost(post); }}>
                            <Delete fontSize="small" />
                            </IconButton>
                        </Box>
                        )}
                    </Paper>
                    </Grid>
                ))}
                </Grid>

            {/* Диалоги */}
            <PostDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                post={editPost}
                topicId={id} 
                onSaved={handleSavePost} // передаем напрямую, без лишнего вызова
            />

            <DeletePostDialog
                open={!!deletePost}
                onClose={() => setDeletePost(null)}
                post={deletePost}
                onDeleted={handleDeletePost}
            />
        </Box>
    );
}
