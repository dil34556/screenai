import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getJobs = async () => {
    const response = await api.get('/jobs/');
    return response.data;
};

export const getJobDetail = async (id) => {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
};

export const submitApplication = async (formData) => {
    const response = await api.post('/apply/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats/');
    return response.data;
};

export const getApplications = async () => {
    const response = await api.get('/applications/');
    return response.data;
};

export default api;
