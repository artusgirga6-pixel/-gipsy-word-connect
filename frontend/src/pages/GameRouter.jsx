import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { LEVELS } from "@/data/levels";
import WordSearchGame from "@/pages/WordSearchGame";
import WordConnectGame from "@/pages/WordConnectGame";

export default function GameRouter() {
  const { levelId } = useParams();
  const id = parseInt(levelId, 10);
  const level = LEVELS.find((l) => l.id === id);
  if (!level) return <Navigate to="/" replace />;
  if (level.type === "word_connect") return <WordConnectGame />;
  return <WordSearchGame />;
}
