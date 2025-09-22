import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Topic from "./pages/Topic";
import PostView from "./pages/PostView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateEditCategory from "./pages/CreateEditCategory";
import CreateEditTopic from "./pages/CreateEditTopic";
import CreateEditPost from "./pages/CreateEditPost";
import CreateEditComment from "./pages/CreateEditComment";
import NotFound from "./pages/NotFound";
import { Container } from "@mui/material";
import PrivateRoute from "./components/PrivateRoute";
import AdminOnly from "./components/AdminOnly";
import {ChatBox} from "./components/ChatBox"; // <-- 1. ИМПОРТ ЧАТА
import SearchResults from "./pages/SearchResults";
export default function App() {
  return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 3, pb: 5 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories/:id" element={<Category />} />
            <Route path="/topics/:id" element={<Topic />} />
            <Route path="/posts/:id" element={<PostView />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/categories/create" element={<AdminOnly><CreateEditCategory /></AdminOnly>} />
            <Route path="/categories/:id/edit" element={<AdminOnly><CreateEditCategory edit /></AdminOnly>} />

            <Route path="/topics/create" element={<PrivateRoute><CreateEditTopic /></PrivateRoute>} />
            <Route path="/topics/:id/edit" element={<PrivateRoute><CreateEditTopic edit /></PrivateRoute>} />

            <Route path="/posts/create" element={<PrivateRoute><CreateEditPost /></PrivateRoute>} />
            <Route path="/posts/:id/edit" element={<PrivateRoute><CreateEditPost edit /></PrivateRoute>} />

            <Route path="/comments/:id/edit" element={<PrivateRoute><CreateEditComment edit /></PrivateRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
        <ChatBox /> {/* <-- 2. ДОБАВЛЕНИЕ ЧАТА НА ВСЕ СТРАНИЦЫ */}
      </>
  );
}