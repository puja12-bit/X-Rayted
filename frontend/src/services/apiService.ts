const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function scanImages(images: Blob[]) {
  const formData = new FormData();

  images.forEach((img) => {
    formData.append("images", img);
  });

  const response = await fetch(`${BACKEND_URL}/api/scan`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Scan failed: ${text}`);
  }

  const data = await response.json();
  return data.results;
}
