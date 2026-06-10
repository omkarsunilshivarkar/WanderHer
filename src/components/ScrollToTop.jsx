import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    // 1. Handle scroll visibility
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // 2. Track window resizing for responsiveness
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('scroll', toggleVisibility);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Define responsive values based on current screen width
  const isMobile = screenWidth < 480;
  const isTablet = screenWidth >= 480 && screenWidth < 768;

  const dynamicStyles = {
    ...styles.button,
    // Mobile: 35px button, closer to edge | Tablet: 45px button | Desktop: 50px button
    width: isMobile ? '40px' : isTablet ? '40px' : '40px',
    height: isMobile ? '40px' : isTablet ? '40px' : '40px',
    bottom: isMobile ? '25px' : '30px',
    right: isMobile ? '25px' : '30px',
    fontSize: isMobile ? '14px' : '18px',
  };

  return (
    <>
      {isVisible && (
        <button 
          onClick={scrollToTop} 
          style={dynamicStyles}
          aria-label="Scroll to top"
        >
          ▲
        </button>
      )}
    </>
  );
};

// Base styles shared across all devices
const styles = {
  button: {
    position: 'fixed',
    zIndex: 1000,
    backgroundColor: '#1a3a52',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Ensures scaling down doesn't warp the circle
    flexShrink: 0, 
  }
};

export default ScrollToTop;