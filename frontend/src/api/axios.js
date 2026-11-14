import axios from 'axios';

export default axios.create({
    baseURL: 'https://my-first-project-2-7i76.onrender.com', // Root server URL
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});
