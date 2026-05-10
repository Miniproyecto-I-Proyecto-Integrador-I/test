import React from 'react';
import RegisterForm from '../Feature/ManageRegister/Components/RegisterForm';
import '../Feature/ManageLogin/Styles/LoginPage.css';
import '../Feature/ManageRegister/Styles/RegisterPage.css';

const RegisterPage: React.FC = () => {
  return (
    <div className="login-page-container register-page-container">
      <div className="login-bg-blob" aria-hidden="true"></div>
      <div className="login-bg-blob-top" aria-hidden="true"></div>

      <main className="login-main">
        <RegisterForm />
      </main>
    </div>
  );
};

export default RegisterPage;
