export const generateTrendData = (currentValue: number, days: number = 7, volatility: number = 0.2) => {
    const data = [];
    let value = currentValue;
    
    // Generate backwards from today
    for (let i = 0; i < days; i++) {
        data.unshift({
            name: `Day ${days - i}`,
            value: Math.max(0, Math.round(value))
        });
        
        // Random change for previous day
        const change = 1 + (Math.random() * volatility * 2 - volatility);
        value = value / change;
    }
    
    return data;
};

export const calculateTrendPercentage = (data: any[]) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1].value;
    const previous = data[0].value; // Compare with start of period
    
    if (previous === 0) return 100;
    return Number(((current - previous) / previous * 100).toFixed(1));
};
