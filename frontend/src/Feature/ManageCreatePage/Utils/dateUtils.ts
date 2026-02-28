export const formatSpanishDate = (dateString: string) => {
	if (!dateString) return "Sin fecha";
	const date = new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`);
	return isNaN(date.getTime()) ? "Fecha inválida" : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
};
