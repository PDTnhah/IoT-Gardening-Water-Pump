const API_BASE = "http://localhost:5000";

// Helper function to add authorization header
function getHeaders(additionalHeaders = {}) {
	const token = localStorage.getItem("token");
	const headers = {
		"Content-Type": "application/json",
		...additionalHeaders,
	};
	
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}
	
	return headers;
}

// Generic API call helper
export async function apiCall(endpoint, options = {}) {
	const headers = getHeaders(options.headers);
	const res = await fetch(`${API_BASE}${endpoint}`, {
		...options,
		headers,
	});
	
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`HTTP ${res.status}: ${text}`);
	}
	
	return res.json();
}

export async function getPumpHistory(deviceId, signal) {
	if (!deviceId) throw new Error("deviceId required");
	const url = `${API_BASE}/api/analytics/${encodeURIComponent(deviceId)}/history`;
	const res = await fetch(url, { 
		signal,
		headers: getHeaders(),
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const data = await res.json();
	return Array.isArray(data) ? data : [];
}

export async function getDevice(deviceId) {
	if (!deviceId) throw new Error("deviceId required");
	const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(deviceId)}`, {
		headers: getHeaders(),
	});
	if (!res.ok) throw new Error(`GET /api/devices/${deviceId} failed: ${res.status}`);
	return res.json();
}

export async function updateDeviceConfig(deviceId, config) {
	if (!deviceId) throw new Error("deviceId required");
	const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(deviceId)}/config`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(config),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`POST /api/devices/${deviceId}/config failed: ${res.status} ${text}`);
	}
	return res.json();
}

export async function postControlMode(deviceId, mode) {
	if (!deviceId) throw new Error("deviceId required");
	const res = await fetch(`${API_BASE}/api/control/${encodeURIComponent(deviceId)}/mode`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({ mode }),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`POST /api/control/${deviceId}/mode failed: ${res.status} ${text}`);
	}
	return res.json();
}

export async function postControlPump(deviceId, pump) {
	if (!deviceId) throw new Error("deviceId required");
	const res = await fetch(`${API_BASE}/api/control/${encodeURIComponent(deviceId)}/pump`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({ pump }),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`POST /api/control/${deviceId}/pump failed: ${res.status} ${text}`);
	}
	return res.json();
}

export default { getPumpHistory, getDevice, updateDeviceConfig, apiCall, getHeaders };
