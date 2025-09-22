import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function DeletePostDialog({ open, onClose, post, onDeleted }) {
    const handleDelete = async () => {
        if (!post) return;

        try {
            const res = await fetch(`/api/forum/posts/${post.id}`, {
                method: "DELETE",
                headers: { "Authorization": localStorage.getItem("token") }
            });

            if (res.ok) {
                if (onDeleted) onDeleted(post.id);
                onClose();
            } else {
                console.error("Failed to delete post", await res.text());
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Delete Post</DialogTitle>
            <DialogContent>
                <Typography>Are you sure you want to delete the post: "{post?.title}"?</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
            </DialogActions>
        </Dialog>
    );
}
