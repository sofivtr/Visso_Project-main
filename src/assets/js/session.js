const KEY = 'visso_current_user';

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

export function setCurrentUser(user) {
  if (user) localStorage.setItem(KEY, JSON.stringify(user));
  else localStorage.removeItem(KEY);
}

export function isLoggedIn() {
  return !!getCurrentUser();
}

export function logout() {
  localStorage.removeItem(KEY);
  localStorage.removeItem('token');
  try {
    localStorage.removeItem('carrito');
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }));
  } catch {}
}
