import React, { useState, useContext } from "react";
import { TextField, Button, Box } from "@mui/material";
import ImageUploader from "../components/ImageUploader";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CreateEditPost({ edit = false, initial = {} }) {
  const [title, setTitle] = useState(initial.title || "");
  const [content, setContent] = useState(initial.content || "");
  const [files, setFiles] = useState([]);
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  const handleFiles = (fileList) => setFiles(Array.from(fileList));

  const submit = async () => {
    if (!user) return alert("только для авторизованных");

    try {
      const fd = new FormData();
      fd.append("topic_id", initial.topic_id || "");
      fd.append("title", title);
      fd.append("content", content);
      files.forEach(f => fd.append("files", f));

      await api.createPost(initial.topic_id || null, title, content, fd);
      nav(-1);
    } catch (e) {
      alert("Ошибка при создании поста");
    }
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <TextField label="Заголовок" value={title} onChange={e=>setTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <TextField label="Содержимое" value={content} onChange={e=>setContent(e.target.value)} fullWidth multiline rows={6} sx={{ mb: 2 }} />
      <ImageUploader onFiles={handleFiles} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={submit}>{edit ? "Сохранить" : "Создать"}</Button>
    </Box>
  );
}
