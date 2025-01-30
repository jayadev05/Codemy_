import React, { useState, useEffect } from 'react';

// Custom hook for currency formatting
const useCurrencyFormat = (initialValue = '') => {
    const [value, setValue] = useState(initialValue);
    const [displayValue, setDisplayValue] = useState(initialValue);

    // Format number with commas
    const formatCurrency = (num) => {
        // Remove any non-digit characters
        const cleanedNum = num.toString().replace(/[^\d]/g, '');
        
        // Convert to number and format with commas
        return cleanedNum ? Number(cleanedNum).toLocaleString('en-IN') : '';
    };

    // Handle input change
    const handleChange = (e) => {
        const inputVal = e.target.value;
        
        // Remove commas and non-digit characters
        const numericVal = inputVal.replace(/[^\d]/g, '');
        
        // Update both raw and display values
        setValue(numericVal);
        setDisplayValue(formatCurrency(numericVal));
    };

    // Method to get raw numeric value
    const getRawValue = () => {
        return value ? Number(value) : '';
    };

    return {
        value: getRawValue(),
        displayValue,
        handleChange
    };
};

export default useCurrencyFormat;