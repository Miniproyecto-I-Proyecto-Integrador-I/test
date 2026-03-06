import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Styles/BackButton.css';

interface BackButtonProps {
  to?: string;
  label?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ to, label = 'Volver', onClick }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button className="back-btn-minimal" onClick={handleBack} type="button">
      <ArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
