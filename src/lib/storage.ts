// Auth & Watchlist storage (localStorage) — vehicle identity based

export function isAuthenticated() {
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
  try {
    return JSON.parse(localStorage.getItem("watchlist_v2") || "[]");
  } catch {
    return [];
  }
}

export function addToWatchlist(vehicleIdentity) {
  const list = getWatchlist();
  if (!list.includes(vehicleIdentity)) {
    list.push(vehicleIdentity);
    localStorage.setItem("watchlist_v2", JSON.stringify(list));
  }
}

export function removeFromWatchlist(vehicleIdentity) {
  const list = getWatchlist().filter(v => v !== vehicleIdentity);
  localStorage.setItem("watchlist_v2", JSON.stringify(list));
}

export function isOnWatchlist(vehicleIdentity) {
  return getWatchlist().includes(vehicleIdentity);
}
