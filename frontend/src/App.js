import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LevelSelect from "@/pages/LevelSelect";
import Game from "@/pages/Game";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LevelSelect />} />
          <Route path="/level/:levelId" element={<Game />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#FFFBF0",
            border: "2px solid #E8DFCA",
            color: "#2D2323",
            fontFamily: "Nunito, sans-serif",
          },
        }}
      />
    </div>
  );
}

export default App;
