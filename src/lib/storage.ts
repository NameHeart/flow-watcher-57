// Auth & Watchlist storage (localStorage)

export function isAuthenticated() {
  return localStorage.getItem("auth_session") === "1";
}

export function login(username: string, password: string) {
  if (username === "admin" && password === "admin123") {
    localStorage.setItem("auth_session", "1");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem("auth_session");
}

export function getWatchlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem("watchlist") || "[]");
  } catch {
    return [];
  }
}

export function addToWatchlist(plate: string) {
  const list = getWatchlist();
  if (!list.includes(plate)) {
    list.push(plate);
    localStorage.setItem("watchlist", JSON.stringify(list));
  }
}

export function removeFromWatchlist(plate: string) {
  const list = getWatchlist().filter(p => p !== plate);
  localStorage.setItem("watchlist", JSON.stringify(list));
}

export function isOnWatchlist(plate: string) {
  return getWatchlist().includes(plate);
}
