import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Interceptor to attach Recruiter ID
api.interceptors.request.use((config) => {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.id) {
                config.headers['X-Employee-Id'] = user.id;
            }
        }
    } catch (e) {
        // Ignore JSON parse errors
    }
    return config;
});

export const getJobs = async (params = {}) => {
    // Convert object to query string
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/jobs/?${queryString}` : '/jobs/';
    const response = await api.get(url);
    return response.data;
};

export const getJobDetail = async (id) => {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
};

export const submitApplication = async (formData) => {
    const response = await api.post('/applications/', formData, {
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
    // API doesn't support nested /jobs/:id/applications, use filter
    const response = await api.get(`/applications/?job=${jobId}`);
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

export const updateJob = async (id, jobData) => {
    const response = await api.patch(`/jobs/${id}/`, jobData);
    return response.data;
};

export const updateApplicationStatus = async (id, status) => {
    const response = await api.patch(`/applications/${id}/`, { status });
    return response.data;
};

export const addComment = async (appId, text) => {
    const response = await api.post(`/applications/${appId}/comments/`, { text });
    return response.data;
};

export const reparseApplication = async (appId) => {
    const response = await api.post(`/applications/${appId}/parse/`);
    return response.data;
};

export const previewResume = async (formData) => {
    const response = await api.post('/applications/preview/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
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

export const deleteEmployee = async (id) => {
    const response = await api.delete(`/employees/${id}/`);
    return response.data;
};

export const updateEmployeePassword = async (id, newPassword) => {
    const response = await api.post(`/employees/${id}/password/`, { new_password: newPassword });
    return response.data;
};

export default api;
