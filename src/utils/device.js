// src/utils/device.js
export function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
