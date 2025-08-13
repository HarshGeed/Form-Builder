import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

export const register = (data) => axios.post(`${API_BASE}/auth/register`, data);
export const login = (data) => axios.post(`${API_BASE}/auth/login`, data);

export const getForms = () => axios.get(`${API_BASE}/forms`);
export const getForm = (id) => axios.get(`${API_BASE}/forms/${id}`);
const getAuthConfig = () => {
  const user = localStorage.getItem('user');
  if (!user) return {};
  try {
    const { token } = JSON.parse(user);
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  } catch {
    return {};
  }
};

export const createForm = (data) => axios.post(`${API_BASE}/forms`, data, getAuthConfig());
export const updateForm = (id, data) => axios.put(`${API_BASE}/forms/${id}`, data, getAuthConfig());
export const deleteForm = (id) => axios.delete(`${API_BASE}/forms/${id}`);

export const uploadHeaderImage = (file) => {
  const formData = new FormData();
  formData.append('headerImage', file);
  return axios.post(`${API_BASE}/forms/upload-header-image`, formData);
};

export const uploadQuestionImage = (file) => {
  const formData = new FormData();
  formData.append('questionImage', file);
  return axios.post(`${API_BASE}/forms/upload-question-image`, formData);
};

export const submitResponse = (data) => axios.post(`${API_BASE}/responses`, data);
export const getResponses = (formId) => axios.get(`${API_BASE}/responses/form/${formId}`);
export const getResponse = (id) => axios.get(`${API_BASE}/responses/${id}`);
export const deleteResponse = (id) => axios.delete(`${API_BASE}/responses/${id}`);
