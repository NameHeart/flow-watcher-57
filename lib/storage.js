// Auth & Watchlist storage (localStorage)

export function isAuthenticated() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("auth_session") === "1";
}

export function login(username, password) {
  if (username === "admin" && password === "admin123") {
    localStorage.setItem("auth_session", "1");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem("auth_session");
}

export function getWatchlist() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("watchlist") || "[]");
  } catch {
    return [];
  }
}

export function addToWatchlist(plate) {
  const list = getWatchlist();
  if (!list.includes(plate)) {
    list.push(plate);
    localStorage.setItem("watchlist", JSON.stringify(list));
  }
}

export function removeFromWatchlist(plate) {
  const list = getWatchlist().filter((p) => p !== plate);
  localStorage.setItem("watchlist", JSON.stringify(list));
}

export function isOnWatchlist(plate) {
  return getWatchlist().includes(plate);
}
