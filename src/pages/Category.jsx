import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, List, ListItemButton, ListItemText, IconButton, Button } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import TopicDialog from "../components/TopicDialog";
import DeleteTopicDialog from "../components/DeleteTopicDialog";

export default function Category() {
    const { id } = useParams();
    const nav = useNavigate();
    const { isAuthorized, user } = useContext(AuthContext);

    const [category, setCategory] = useState(null);
    const [topics, setTopics] = useState([]);
    const [postsMap, setPostsMap] = useState({}); // { topicId: [posts] }

    const [openDialog, setOpenDialog] = useState(false);
    const [editTopic, setEditTopic] = useState(null);
    const [deleteTopic, setDeleteTopic] = useState(null);
    const fetchTopics = async () => {
        try {
            const r = await api.listTopics(id);
            const t = r.data.topics || [];
            setTopics(t);

            const newPostsMap = {};
            await Promise.all(t.map(async topic => {
                try {
                    const postsRes = await api.listPosts(topic.id);
                    newPostsMap[topic.id] = postsRes.data.posts || [];
                } catch {
                    newPostsMap[topic.id] = [];
                }
            }));
            setPostsMap(newPostsMap);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        api.getCategory(id)
            .then(r => setCategory(r.data.category || r.data))
            .catch(console.error);
        fetchTopics();
        api.listTopics(id)
            .then(async r => {
                const t = r.data.topics || r.data;
                setTopics(t);

                // подтягиваем посты для каждого топика
                const newPostsMap = {};
                await Promise.all((Array.isArray(t) ? t : []).map(async topic => {
                    try {
                        const postsRes = await api.listPosts(topic.id);
                        newPostsMap[topic.id] = postsRes.data.posts || [];
                    } catch (err) {
                        console.error(err);
                        newPostsMap[topic.id] = [];
                    }
                }));
                setPostsMap(newPostsMap);
            })
            .catch(console.error);
    }, [id]);
    const handleSaveTopic = async (topic) => {
        if (!topic || !topic.name) return;

        const url = topic.id 
            ? `/api/forum/topics/${topic.id}` 
            : "/api/forum/topics";

        const method = topic.id ? "PUT" : "POST";

        const payload = topic.id 
            ? { id: topic.id, name: topic.name, category_id: id } 
            : { name: topic.name, category_id: id };

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify(payload)
        });

        setOpenDialog(false);
        setEditTopic(null);
        api.listTopics(id).then(r => setTopics(r.data.topics || r.data)).catch(console.error);
    };

    const handleDeleteTopic = async (topicId) => {
        await fetch(`/api/forum/topics/${topicId}`, {
            method: "DELETE",
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });
        setDeleteTopic(null);
        api.listTopics(id).then(r => setTopics(r.data.topics || r.data)).catch(console.error);
    };

    return (
        <Box sx={{ px: 3, py: 4, backgroundColor: "#202020", minHeight: "100vh", color: "#fff" }}>
            {/* Верхний блок */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 5 }}>
                <img src="/logo.png" alt="logo" style={{ width: 64, height: 64, mb: 2 }} />
                <Typography variant="h3" sx={{ mb: 1 }}>{category?.title || "Category"}</Typography>
                <Typography variant="body1" sx={{ textAlign: "center", maxWidth: 600 }}>
                    {category?.description || "Explore topics and posts in this category."}
                </Typography>
            </Box>

            {/* Кнопка добавления топика */}
            {isAuthorized() && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<Add />} 
                        onClick={() => { setEditTopic(null); setOpenDialog(true); }}
                    >
                        Create Topic
                    </Button>
                </Box>
            )}

            {/* Сетка топиков */}
            <Grid container spacing={3}>
              {(Array.isArray(topics) ? topics : []).map(topic => (
                <Grid item xs={12} sm={6} md={4} key={topic.id}>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: "#303030",
                      border: "1px solid #505050",
                      position: "relative",
                      "&:hover": { backgroundColor: "#383838" }
                    }}
                  >
                    {/* Основной кликабельный контейнер */}
                    <Box
                      sx={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 1 }}
                      onClick={() => nav(`/topics/${topic.id}`)}
                    >
                      <Typography variant="h6" sx={{ color: "#eee" }}>{topic.title}</Typography>
                    </Box>

                    {/* Мини-посты (не кликабельный контейнер) */}
                    <List dense>
                      {(Array.isArray(postsMap[topic.id]) ? postsMap[topic.id].slice(0, 5) : []).map(post => (
                        <ListItemButton
                          key={post.id}
                          sx={{
                            py: 0.5,
                            backgroundColor: "#151515",
                            border: "1px solid #eee",
                            borderRadius: 1,
                            mb: 0.5,
                            "&:hover": { backgroundColor: "#222" }
                          }}
                          onClick={(e) => { e.stopPropagation(); nav(`/posts/${post.id}`); }}
                        >
                          <ListItemText
                            primary={post.content.slice(0, 50) + (post.content.length > 50 ? "..." : "")}
                            secondary={`Author: ${post.author_nickname || 'Unknown'} • ${new Date(post.created_at?.seconds ? post.created_at.seconds * 1000 : post.createdAt).toLocaleString()}`}
                            primaryTypographyProps={{ color: "#ccc", fontSize: 14 }}
                            secondaryTypographyProps={{ color: "#888", fontSize: 12 }}
                          />
                        </ListItemButton>
                      ))}
                    </List>

                    {/* Кнопки редактирования/удаления */}
                    {isAuthorized() && (
                      <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
                        <IconButton size="small" sx={{ color: "#eee" }} onClick={(e) => { e.stopPropagation(); setEditTopic(topic); setOpenDialog(true); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ color: "#eee" }} onClick={(e) => { e.stopPropagation(); setDeleteTopic(topic); }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>


            {/* Диалоги */}
            <TopicDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSave={handleSaveTopic}
                topic={editTopic}
                onSaved={fetchTopics}
            />

            <DeleteTopicDialog
                open={!!deleteTopic}
                onClose={() => setDeleteTopic(null)}
                onDelete={handleDeleteTopic}
                topic={deleteTopic}
                onDeleted={fetchTopics}
            />
        </Box>
    );
}
