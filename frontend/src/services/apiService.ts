const BACKEND_URL = "https://xrayted-467467814488.europe-west1.run.app";

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

  return response.json();
}
