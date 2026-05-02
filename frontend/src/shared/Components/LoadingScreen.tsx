import React from 'react';
import '../Styles/LoadingScreen.css';
import Logo from '../../assets/logo staskm loading.png';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Cargando información...' }) => {
  return (
    <div className="loading-screen-container">
      <div className="loading-logo-wrapper">
        <div className="loading-spinner-ring" />
        <img src={Logo} alt="Loading TaskMaster" className="loading-logo-img" />
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingScreen;
