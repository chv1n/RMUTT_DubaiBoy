export const MOCK_CONFIG = {
    useMock: false, // Global toggle
    delay: 500 // Simulated network delay in ms
};

export const simulateDelay = async () => {
    if (MOCK_CONFIG.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delay));
    }
};
