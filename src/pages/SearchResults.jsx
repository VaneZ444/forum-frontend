import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import { Box, Typography, Paper, Grid } from "@mui/material";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery();
  const q = query.get("q") || "";
  const navigate = useNavigate();
  const [results, setResults] = useState({ posts: [], topics: [] });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const r = await api.search(q); // предполагается, что api.search(q) возвращает { posts, topics }
        setResults({
          posts: r.data.posts || [],
          topics: r.data.topics || [],
        });
      } catch (err) {
        console.error(err);
        setResults({ posts: [], topics: [] });
      }
    };

    if (q.trim()) fetchResults();
  }, [q]);

  const previewText = (text, length = 50) =>
    text.length > length ? text.slice(0, length) + "..." : text;

  return (
    <Box sx={{ px: 3, py: 4, backgroundColor: "#202020", minHeight: "100vh", color: "#fff" }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Результаты поиска: "{q}"
      </Typography>

      {/* Топики */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Топики
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Array.isArray(results.topics) && results.topics.length > 0 ? (
          results.topics.map((topic) => (
            <Grid item xs={12} sm={6} md={4} key={topic.id}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "#303030",
                  border: "1px solid #505050",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/topics/${topic.id}`)}
              >
                <Typography variant="h6" sx={{ color: "#eee", mb: 1 }}>
                  {topic.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  Постов: {topic.posts_count || 0}
                </Typography>
                {topic.last_activity && (
                  <Typography variant="body2" sx={{ color: "#888", mt: 0.5 }}>
                    Последняя активность: {new Date(topic.last_activity.seconds * 1000).toLocaleString()}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))
        ) : (
          <Typography sx={{ color: "#888" }}>Топиков не найдено</Typography>
        )}
      </Grid>

      {/* Посты */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Посты
      </Typography>
      <Grid container spacing={2}>
        {Array.isArray(results.posts) && results.posts.length > 0 ? (
          results.posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "#303030",
                  border: "1px solid #505050",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <Typography variant="h6" sx={{ color: "#eee", mb: 1 }}>
                  {post.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  {previewText(post.content, 60)}
                </Typography>
                {post.created_at && (
                  <Typography variant="body2" sx={{ color: "#888", mt: 0.5 }}>
                    Создано: {new Date(post.created_at.seconds * 1000).toLocaleString()}
                  </Typography>
                )}
                {post.author_nickname && (
                  <Typography variant="caption" sx={{ color: "#aaa", mt: 0.5, display: "block" }}>
                    Автор: {post.author_nickname}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))
        ) : (
          <Typography sx={{ color: "#888" }}>Постов не найдено</Typography>
        )}
      </Grid>
    </Box>
  );
}
