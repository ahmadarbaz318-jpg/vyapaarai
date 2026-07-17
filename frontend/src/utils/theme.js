export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  try {
    localStorage.setItem('vyapaar_theme', theme);
  } catch (e) {}
}

export function getSavedTheme() {
  try {
    return localStorage.getItem('vyapaar_theme') || null;
  } catch (e) { return null; }
}
