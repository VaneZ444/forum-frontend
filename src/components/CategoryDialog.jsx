import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

export default function CategoryDialog({ open, onClose, onSave, category }) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (category) {
            setName(category.name || "");
        } else {
            setName("");
        }
    }, [category]);

    const handleSave = () => {
        if (!name.trim()) return;
        const payload = category ? { id: category.id, name } : { name };
        onSave(payload);
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
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
