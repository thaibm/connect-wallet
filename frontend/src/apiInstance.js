import axios from 'axios';

const baseURL = "http://localhost:3001/api/transactions";
const apiInstance = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
});
apiInstance.interceptors.request.use((config) => {
	return config;
});
apiInstance.interceptors.response.use(
	(response) => {
		return response.data;
	},
	async (error) => {
		return await Promise.reject(error);
	}
);
export default apiInstance;