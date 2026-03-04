const now = new Date();
const colombia = new Date(now.getTime() - 5 * 60 * 60 * 1000);

export const fecha = colombia.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });