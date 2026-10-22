import axios from 'axios';

export default axios.create({
    baseURL: 'http://localhost:5000', // Root server URL
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});