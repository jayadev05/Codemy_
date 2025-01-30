import React from 'react';
import { useEffect, useState } from 'react';

const TypingIndicator = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 p-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
             style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
             style={{ animationDelay: '200ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
             style={{ animationDelay: '400ms' }} />
      </div>
      <span className="text-sm text-gray-500 min-w-[60px]">
        Typing{dots}
      </span>
    </div>
  );
};

export default TypingIndicator;