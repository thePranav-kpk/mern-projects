const rawUrl = import.meta.env.VITE_API_URL || "";
// Strip any trailing slash so `${API_URL}/api/...` never generates double slashes
const API_URL = rawUrl.replace(/\/+$/, "");

export default API_URL;

