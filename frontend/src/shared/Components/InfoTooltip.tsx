import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import '../Styles/InfoTooltip.css';

interface InfoTooltipProps {
  content: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="info-tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsVisible(!isVisible)} // Mobile toggle bypass
      aria-label={content}
      role="tooltip"
      tabIndex={0}
    >
      <Info size={18} strokeWidth={2.2} className="info-tooltip-icon" />
      {isVisible && (
        <div className="info-tooltip-content">
          {content}
          <div className="info-tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
