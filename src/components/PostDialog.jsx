import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

export default function PostDialog({ open, onClose, post, onSaved, topicId }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (post) {
            setTitle(post.title || "");
            setContent(post.content || "");
        } else {
            setTitle("");
            setContent("");
        }
    }, [post]);

    const handleSave = () => {
        if (!title.trim() || !content.trim()) return;

        const payload = post
            ? { id: post.id, title, content }       // редактирование
            : { title, content };                   // создание

        if (onSaved) onSaved(payload); // просто передаем данные наверх
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{post ? "Edit Post" : "Create Post"}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                <TextField
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    fullWidth
                    multiline
                    rows={6}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
