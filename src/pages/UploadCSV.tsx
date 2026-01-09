import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadCSV() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a CSV file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            await fetch("/api/teams/upload-csv", {
                method: "POST",
                body: formData,
            });


            alert("CSV uploaded successfully");
            navigate("/");
        } catch (error) {
            alert("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 460,
                    padding: 32,
                    borderRadius: 16,
                    background: "#111",
                    color: "#fff",
                }}
            >
                <h2 style={{ fontSize: 26, marginBottom: 8 }}>
                    Upload CSV
                </h2>
                <p style={{ opacity: 0.7, marginBottom: 20 }}>
                    Bulk upload teams using CSV
                </p>

                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ marginBottom: 20 }}
                />

                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: "12px 16px",
                            borderRadius: 10,
                            border: "none",
                            background: "#e10600",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        {loading ? "Uploading..." : "Upload"}
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        style={{
                            padding: "12px 16px",
                            borderRadius: 10,
                            border: "1px solid #333",
                            background: "transparent",
                            color: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
