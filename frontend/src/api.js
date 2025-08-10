import axios from 'axios';


const API_BASE = 'http://localhost:5000/api';

export const register = (data) => axios.post(`${API_BASE}/auth/register`, data);
export const login = (data) => axios.post(`${API_BASE}/auth/login`, data);

export const getForms = () => axios.get(`${API_BASE}/forms`);
export const getForm = (id) => axios.get(`${API_BASE}/forms/${id}`);
export const createForm = (data) => axios.post(`${API_BASE}/forms`, data);
export const updateForm = (id, data) => axios.put(`${API_BASE}/forms/${id}`, data);
export const deleteForm = (id) => axios.delete(`${API_BASE}/forms/${id}`);

export const uploadHeaderImage = (file) => {
  const formData = new FormData();
  formData.append('headerImage', file);
  return axios.post(`${API_BASE}/forms`, formData);
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
