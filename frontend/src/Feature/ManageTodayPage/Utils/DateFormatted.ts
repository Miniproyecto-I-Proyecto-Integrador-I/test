const now = new Date();
const colombia = new Date(now.getTime() - 5 * 60 * 60 * 1000);

export const fecha = colombia.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const fechaToday = colombia.toISOString().split('T')[0];

const mañana = new Date(colombia);
mañana.setDate(colombia.getDate() + 1);

export const fechaMañana = mañana.toISOString().split('T')[0];


export const fechaMañanaCol = mañana.toLocaleDateString('es-CO', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});


const ayer = new Date(colombia);
ayer.setDate(colombia.getDate() - 1);

export const fechaAyer = ayer.toISOString().split('T')[0];