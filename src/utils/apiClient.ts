import axios from 'axios';
import Constants from "../constants";

const apiClient = axios.create({
    baseURL: Constants.DBDINFO_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;