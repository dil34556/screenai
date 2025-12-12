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

export const getApplications = async (params = {}) => {
    // Convert object to query string
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/applications/?${queryString}` : '/applications/';
    const response = await api.get(url);
    return response.data;
};

export const getJobApplications = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applications/`);
    // Note: Backend might not have this specific endpoint, we might need to filter client side or add it.
    // Checking urls.py or views... wait, standard ViewSets usually support filtering or we use the main list.
    // Let's assume we filter the main list for now if the backend doesn't support nested.
    // Actually, looking at the previous analysis, we didn't check views.py for nested logic.
    // Safest bet for now: Filter on client side if getting all, OR use query param ?job=ID
    return response.data;
};

// Update: Let's use query param style which is more common in DRF without nested routers
export const getApplicationsForJob = async (jobId) => {
    const response = await api.get(`/applications/?job=${jobId}`);
    return response.data;
};

export const createJob = async (jobData) => {
    const response = await api.post('/jobs/', jobData);
    return response.data;
};

export const updateApplicationStatus = async (id, status) => {
    const response = await api.patch(`/applications/${id}/`, { status });
    return response.data;
};

export const addComment = async (id, text) => {
    const response = await api.post(`/applications/${id}/comments/`, { text });
    return response.data;
};

export const login = async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
};

export const createEmployee = async (employeeData) => {
    const response = await api.post('/employees/create/', employeeData);
    return response.data;
};

export const getEmployees = async () => {
    const response = await api.get('/employees/');
    return response.data;
};

export default api;
