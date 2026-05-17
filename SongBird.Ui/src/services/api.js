// const BASE = import.meta.env.VITE_API_URL || "http://localhost:5260/api";
const BASE = "https://localhost:7252/api";

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.blob(); // video file download
}

export const videoApi = {
  /**
   * POST /api/Video/create
   * multipart: Audio (binary), Background (binary), Title (string)
   */
  async create({ audioFile, backgroundFile, title }) {
    const fd = new FormData();
    fd.append("Audio", audioFile);
    if (backgroundFile) fd.append("Background", backgroundFile);
    fd.append("Title", title);
    const res = await fetch(`${BASE}/Video/create`, { method: "POST", body: fd });
    return handleResponse(res);
  },

  /**
   * POST /api/Video/lrc?id=&artist=&title=
   * multipart: lrcFile (binary)
   */
  async uploadLrc({ id, artist, title, lrcFile }) {
    const params = new URLSearchParams({ id, artist, title });
    const fd = new FormData();
    fd.append("lrcFile", lrcFile);
    const res = await fetch(`${BASE}/Video/lrc?${params}`, { method: "POST", body: fd });
    return handleResponse(res);
  },

  /**
   * POST /api/Video/render?id=&isShort=
   * multipart: srtFile (binary)
   */
  async render({ id, isShort = false, srtFile }) {
    const params = new URLSearchParams({ id, isShort });
    const fd = new FormData();
    if (srtFile) fd.append("srtFile", srtFile);
    const res = await fetch(`${BASE}/Video/render?${params}`, { method: "POST", body: fd });
    return handleResponse(res);
  },

  /**
   * GET /api/Video
   * Returns list of all videos
   */
  async getAll() {
    const res = await fetch(`${BASE}/Video`);
    return handleResponse(res);
  },
};
