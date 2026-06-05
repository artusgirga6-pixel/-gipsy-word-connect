import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LevelSelect from "@/pages/LevelSelect";
import GameRouter from "@/pages/GameRouter";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n/I18nContext";
import MusicPlayer from "@/components/MusicPlayer";
import { initAds } from "@/lib/ads";

function App() {
  useEffect(() => {
    initAds().catch(() => {});
  }, []);
  return (
    <div className="App">
      <I18nProvider>
        <BrowserRouter>
          <MusicPlayer />
          <Routes>
            <Route path="/" element={<LevelSelect />} />
            <Route path="/level/:levelId" element={<GameRouter />} />
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
      </I18nProvider>
    </div>
  );
}

export default App;
