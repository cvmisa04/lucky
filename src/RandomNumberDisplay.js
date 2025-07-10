import React from 'react';
import { motion } from 'framer-motion';

const RandomNumberDisplay = ({ number }) => {
  return (
    <motion.div
      className="number-box"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {number}
    </motion.div>
  );
};

export default RandomNumberDisplay;
