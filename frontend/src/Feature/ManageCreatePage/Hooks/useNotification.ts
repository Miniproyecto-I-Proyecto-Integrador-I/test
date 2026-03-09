import { useState, useCallback } from 'react';

export const useNotification = () => {
	const [notification, setNotification] = useState<{
		message: string;
		type: 'success' | 'error';
	} | null>(null);

	const showNotification = useCallback((message: string, type: 'success' | 'error') => {
		setNotification({ message, type });
		setTimeout(() => {
			setNotification(null);
		}, 3000);
	}, []);

	return { notification, showNotification, setNotification };
};
