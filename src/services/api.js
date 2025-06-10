// API_BASE_URL will be picked from .env.development or .env.production
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  // Construct the full URL. In development with proxy, API_BASE_URL is empty,
  // so this becomes '/evaluate/file'. In production, it's the full https URL.
  const requestUrl = `${API_BASE_URL}/evaluate/file`;

  const response = await fetch(requestUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text(); // Try to get more error details
    throw new Error(`Upload failed, status code ${response.status}. Server response: ${errorBody}`);
  }

  return response.json();
}
