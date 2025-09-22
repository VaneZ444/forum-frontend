import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

export default function DeleteDialog({ open, onClose, onDelete, category }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                Are you sure you want to delete category "{category?.title}"?
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="error" onClick={() => onDelete(category.id)}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
