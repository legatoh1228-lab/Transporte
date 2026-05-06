export const getMediaUrl = (path) => {
  if (!path) return null;
  // Si la ruta ya es una URL completa (ej. http:// o https://), la devolvemos tal cual
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  // Si es una ruta relativa que empieza por /media/, le añadimos el servidor backend
  if (path.startsWith('/media/')) {
    return `http://localhost:8000${path}`;
  }
  return path;
};
