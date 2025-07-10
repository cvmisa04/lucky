import React from 'react';
import { useSpring, animated } from 'react-spring';

const RandomNumberDisplay = ({ number }) => {
  const fade = useSpring({ opacity: number ? 1 : 0, transform: number ? 'scale(1)' : 'scale(0.5)' });

  return (
    <animated.div style={fade} className="random-number">
      {number}
    </animated.div>
  );
};

export default RandomNumberDisplay;
