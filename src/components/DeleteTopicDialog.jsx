import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

export default function DeleteTopicDialog({ open, onClose, onDelete, topic }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                Are you sure you want to delete topic "{topic?.title}"?
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="error" onClick={() => onDelete(topic.id)}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
