import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex h-screen overflow-hidden justify-center items-center bg-white">
      <motion.div
        className="w-16 h-16 border-4 border-gray-300 rounded-full"
        style={{ borderTopColor: '#ff6738' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default LoadingSpinner;

