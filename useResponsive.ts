
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 1024; // Use a larger breakpoint for a better tablet/desktop experience

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile };
};