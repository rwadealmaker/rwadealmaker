// src/utils/auth.js

const AUTH_EVENT = 'auth-changed';

export function setAuth(token) {
  // 保存 token 和登录状态
  if (token) {
    localStorage.setItem('token', token);
  }
  localStorage.setItem('isLoggedIn', 'true');

  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuth() {
  // 清除所有认证信息
  localStorage.removeItem('token');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('remember_email');

  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

export function getToken() {
  return localStorage.getItem('token') || '';
}

export const AUTH_CHANGED_EVENT = AUTH_EVENT;
