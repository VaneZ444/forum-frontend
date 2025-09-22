import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import NoAccessModal from "./NoAccessModal";

export default function AdminOnly({ children }) {
  const { user, isAdmin } = useContext(AuthContext);
  if (!user) return <NoAccessModal message="Требуется авторизация" />;
  if (!isAdmin()) return <NoAccessModal message="Только для админа" />;
  return children;
}
