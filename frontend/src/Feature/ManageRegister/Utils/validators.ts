export const validateEmail = (email: string): boolean => {
  // Regex básico para empatar con el del backend
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Regex para empatar con el backend (mayuscula, minuscula, numero, caracter especial, min 8)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&._-]/.test(password);

  return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

export const validateFullName = (name: string): boolean => {
  return name.trim().length >= 3;
};
