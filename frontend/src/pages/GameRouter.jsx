import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { LEVELS } from "@/data/levels";
import WordSearchGame from "@/pages/WordSearchGame";

export default function GameRouter() {
  const { levelId } = useParams();
  const id = parseInt(levelId, 10);
  const level = LEVELS.find((l) => l.id === id);
  if (!level) return <Navigate to="/" replace />;
  return <WordSearchGame />;
}
