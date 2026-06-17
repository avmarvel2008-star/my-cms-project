import { useState } from "react";

const CLOUD_NAME = "dlyzduzv5";
const UPLOAD_PRESET = "Blogify";

export default function MediaUpload({ onInsert, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Detect type
    const type = file.type.startsWith("video") ? "video" : "image";
    setMediaType(type);
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", type);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setPreview({ url: data.secure_url, type });
      setProgress(100);
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
    setUploading(false);
  };

  const handleInsert = () => {
    if (!preview) return;
    let html = "";
    if (preview.type === "image") {
      html = `<img src="${preview.url}" style="max-width:100%;border-radius:8px;margin:10px 0;" alt="uploaded image"/>`;
    } else {
      html = `<video controls style="max-width:100%;border-radius:8px;margin:10px 0;">
        <source src="${preview.url}" type="video/mp4"/>
        Your browser does not support the video tag.
      </video>`;
    }
    onInsert(html);
    onClose();
  };

  return (
    <div className="media-overlay">
      <div className="media-modal">
        <div className="media-header">
          <h3>📁 Upload Media</h3>
          <button className="builder-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="media-body">
          <div className="media-tabs">
            <button
              className={`media-tab ${mediaType === "image" ? "active" : ""}`}
              onClick={() => setMediaType("image")}
            >
              🖼️ Image
            </button>
            <button
              className={`media-tab ${mediaType === "video" ? "active" : ""}`}
              onClick={() => setMediaType("video")}
            >
              🎬 Video
            </button>
          </div>

          <label className="upload-zone">
            <input
              type="file"
              accept={mediaType === "image" ? "image/*" : "video/*"}
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            {uploading ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p>Uploading... please wait ⏳</p>
              </div>
            ) : preview ? (
              <div className="upload-preview">
                {preview.type === "image" ? (
                  <img src={preview.url} alt="preview" className="preview-img" />
                ) : (
                  <video controls className="preview-video">
                    <source src={preview.url} type="video/mp4" />
                  </video>
                )}
                <p className="reupload-hint">Click to upload a different file</p>
              </div>
            ) : (
              <div className="upload-placeholder">
                <p style={{ fontSize: "48px" }}>
                  {mediaType === "image" ? "🖼️" : "🎬"}
                </p>
                <p>Click to select {mediaType === "image" ? "an image" : "a video"}</p>
                <p className="upload-hint">
                  {mediaType === "image"
                    ? "PNG, JPG, GIF, WEBP supported"
                    : "MP4, MOV, AVI supported (max 100MB)"}
                </p>
              </div>
            )}
          </label>
        </div>

        <div className="media-footer">
          <button
            className="builder-save-btn"
            onClick={handleInsert}
            disabled={!preview || uploading}
          >
            ✅ Insert into Post
          </button>
          <button className="builder-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}