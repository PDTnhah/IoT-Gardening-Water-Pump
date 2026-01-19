const API_BASE = "http://localhost:5000/api";

export async function register(username, password, fullName) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, fullName }),
  });

  console.log(res);

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Đăng ký thất bại");
  }
  return data;
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Đăng nhập thất bại");
  }
  return data;
}

export async function getProfile(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Không thể lấy thông tin người dùng");
  }
  return data;
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function removeToken() {
  localStorage.removeItem("token");
}
