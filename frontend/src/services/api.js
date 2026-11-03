import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:5000"
});

// ===============================
// Predict Transaction
// ===============================
export const predictTransaction = (data) => {
    return API.post("/predict", data);
};

// ===============================
// Get Prediction History
// ===============================
export const getHistory = () => {
    return API.get("/history");
};

// ===============================
// Dashboard Statistics
// ===============================
export const getDashboardStats = async () => {
    const response = await getHistory();
    const history = response.data;
    const total = history.length;
    const fraud = history.filter(
        item => item.prediction === 1
    ).length;
    const genuine = history.filter(
        item => item.prediction === 0
    ).length;

    return {
        total,
        fraud,
        genuine
    };
};

// ===============================
// Clear Prediction History
// ===============================
export const clearHistory = () => {
    return API.delete("/history");
};

// ===============================
// Get Model Evaluation Metrics
// ===============================
export const getModelMetrics = () => {
    return API.get("/metrics");
};

// ===============================
// Get Labeled Sample Transactions
// ===============================
export const getSampleTransactions = () => {
    return API.get("/samples");
};

// ===============================
// Get a Random Labeled Sample
// type: 'fraud' | 'genuine' | undefined
// ===============================
export const getRandomSample = (type) => {
    const params = type ? { type } : {};
    return API.get("/samples/random", { params });
};

export default API;
