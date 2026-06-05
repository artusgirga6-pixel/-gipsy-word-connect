import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export async function initPlayer(name) {
  const { data } = await api.post("/progress/init", { name });
  return data;
}

export async function fetchProgress(playerId) {
  const { data } = await api.get(`/progress/${playerId}`);
  return data;
}

export async function completeLevel(payload) {
  const { data } = await api.post("/progress/complete", payload);
  return data;
}

export async function resetProgress(playerId) {
  const { data } = await api.post(`/progress/reset/${playerId}`);
  return data;
}

export async function updateName(playerId, name) {
  const { data } = await api.post(`/progress/${playerId}/name`, { name });
  return data;
}

export async function updateCoins(playerId, delta, reason) {
  const { data } = await api.post(`/progress/${playerId}/coins`, { delta, reason });
  return data;
}

export async function fetchLeaderboard(limit = 20) {
  const { data } = await api.get(`/leaderboard`, { params: { limit } });
  return data;
}
