import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";

export default function TopicDialog({ open, onClose, topic, onSaved }) {
    const { id: categoryId } = useParams(); // айди текущей категории
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        if (topic) {
            setTitle(topic.title || "");
            setContent(""); // при апдейте контент не нужен
        } else {
            setTitle("");
            setContent("");
        }
    }, [topic]);

    const handleSave = async () => {
        if (!title.trim()) return;

        const payload = topic
            ? { id: topic.id, title, category_id: +categoryId } // апдейт
            : { title, category_id: +categoryId, content };     // создание

        const url = topic
            ? `/api/forum/topics/${topic.id}`
            : "/api/forum/topics";

        const method = topic ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (onSaved) onSaved();
                onClose();
            } else {
                console.error("Failed to save topic", await res.text());
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
    <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
            sx: { width: "80%", maxWidth: "800px", minHeight: "400px" }
        }}
    >
        <DialogTitle>{topic ? "Edit Topic" : "Create Topic"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
            />
            {!topic && (
                <TextField
                    label="First Post Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                />
            )}
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
