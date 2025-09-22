import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, Grid, Paper, IconButton, Button, List, ListItemButton, ListItemText } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import CategoryDialog from "../components/CategoryDialog";
import DeleteDialog from "../components/DeleteCategoryDialog";
import api from "../api/api"; // предполагается, что есть методы api.listTopics(categoryId)

export default function Home() {
    const { isAdmin, user } = useContext(AuthContext);
    const nav = useNavigate();

    const [categories, setCategories] = useState([]);
    const [topicsMap, setTopicsMap] = useState({}); // { categoryId: [topics] }

    const [openDialog, setOpenDialog] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [deleteCategory, setDeleteCategory] = useState(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch("https://localhost:50050/api/forum/categories");
            const data = await res.json();
            const cats = data.categories || [];
            setCategories(cats);

            // Для каждой категории сразу подтягиваем топики
            const newTopicsMap = {};
            await Promise.all((Array.isArray(cats) ? cats : []).map(async (cat) => {
                try {
                    const topicsRes = await api.listTopics(cat.id);
                    newTopicsMap[cat.id] = topicsRes.data.topics || [];
                } catch (err) {
                    console.error(err);
                    newTopicsMap[cat.id] = [];
                }
            }));
            setTopicsMap(newTopicsMap);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSaveCategory = async (category) => {
        if (!category || !category.name) return;

        const url = category.id 
            ? `/api/forum/categories/${category.id}`  // добавляем ID в URL для PUT
            : "/api/forum/categories";

        const method = category.id ? "PUT" : "POST";

        const payload = category.id 
            ? { id: category.id, name: category.name }  // PUT должен содержать id и name
            : { name: category.name };                 // POST только name

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify(payload)
        });

        setOpenDialog(false);
        setEditCategory(null);
        fetchCategories();
    };


    const handleDeleteCategory = async (id) => {
        await fetch(`/api/forum/categories/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });
        setDeleteCategory(null);
        fetchCategories();
    };

    return (
        <Box sx={{ px: 3, py: 4, backgroundColor: "#202020", minHeight: "100vh", color: "#fff" }}>
            {/* Верхний блок */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 5 }}>
                <img src="/logo.png" alt="logo" style={{ width: 64, height: 64, mb: 2 }} />
                <Typography variant="h3" sx={{ mb: 1 }}>Welcome to HMS Forum!</Typography>
                <Typography variant="body1" sx={{ textAlign: "center", maxWidth: 600 }}>
                    A local forum for friends built with Go, where you can discuss books, history, anime, and much more.
                </Typography>
            </Box>

            {/* Заголовок категорий */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h4">Categories</Typography>
                {isAdmin() && (
                    <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => { setEditCategory(null); setOpenDialog(true); }}>
                        Add
                    </Button>
                )}
            </Box>

            {/* Сетка категорий */}
            <Grid container spacing={3}>
                {(Array.isArray(categories) ? categories : []).map((cat) => (
                    <Grid item xs={12} sm={6} md={4} key={cat.id}>
                        <Paper
    sx={{
        p: 2,
        backgroundColor: "#303030",
        border: "1px solid #505050",
        cursor: "pointer",
        position: "relative",
        "&:hover": { backgroundColor: "#383838" }
    }}
>
    {/* Обёртка, которая ловит клик только по “пустой зоне” */}
    <Box
        onClick={(e) => {
            // Игнорируем клик если это топик или админская кнопка
            if (e.target.closest(".topic-item") || e.target.closest(".admin-btn")) return;
            nav(`/categories/${cat.id}`);
        }}
    >
        <Typography variant="h6" sx={{ mb: 1, color: "#eee" }}>{cat.title}</Typography>

        {/* Мини-список топиков */}
        <List dense>
            {(Array.isArray(topicsMap[cat.id]) ? topicsMap[cat.id].slice(0, 5) : []).map(t => (
                <ListItemButton
                    key={t.id}
                    className="topic-item"
                    sx={{
                        py: 0.5,
                        backgroundColor: "#202020",
                        border: "1px solid #eee",
                        borderRadius: 1,
                        mb: 0.5,
                        "&:hover": { backgroundColor: "#222" }
                    }}
                    onClick={(e) => { e.stopPropagation(); nav(`/topics/${t.id}`); }}
                >
                    <ListItemText
                        primary={t.title}
                        secondary={`Author: ${t.author_id} • ${t.posts_count || 0} posts`}
                        primaryTypographyProps={{ color: "#ccc", fontSize: 14 }}
                        secondaryTypographyProps={{ color: "#888", fontSize: 12 }}
                    />
                </ListItemButton>
            ))}
        </List>
    </Box>

    {/* Админские кнопки */}
    {isAdmin() && (
        <Box className="admin-btn" sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 1 }}>
            <IconButton size="small" sx={{ color: "#eee" }} onClick={(e) => { e.stopPropagation(); setEditCategory(cat); setOpenDialog(true); }}>
                <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: "#eee" }} onClick={(e) => { e.stopPropagation(); setDeleteCategory(cat); }}>
                <Delete fontSize="small" />
            </IconButton>
        </Box>
    )}
</Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Диалог создания/редактирования */}
            <CategoryDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSave={handleSaveCategory}
                category={editCategory}
            />

            {/* Диалог удаления */}
            <DeleteDialog
                open={!!deleteCategory}
                onClose={() => setDeleteCategory(null)}
                onDelete={handleDeleteCategory}
                category={deleteCategory}
            />
        </Box>
    );
}
