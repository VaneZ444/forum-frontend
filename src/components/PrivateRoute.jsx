import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import NoAccessModal from "./NoAccessModal";

export default function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <NoAccessModal message="Требуется авторизация" />;
  return children;
}
