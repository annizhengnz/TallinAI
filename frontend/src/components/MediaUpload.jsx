import React, { useState, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Search,
} from "lucide-react";
// import { Alert, AlertDescription } from '@/components/ui/alert';

const MediaUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [uploadResponse, setUploadResponse] = useState(null);
  const [queryResponse, setQueryResponse] = useState(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      const fileType = selectedFile.type.split("/")[0];
      if (fileType !== "image" && fileType !== "video") {
        setError("Please upload only image or video files");
        return;
      }

      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        return;
      }

      setFile(selectedFile);
      setMediaType(fileType);
      setError("");
      setUploadResponse(null);
      setQueryResponse(null);

      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setMediaType("");
    setUploadResponse(null);
    setQueryResponse(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  /**
   * Handles the file upload submission
   * Makes a GET request to the upload endpoint with the selected file
   * Updates the upload response state on success
   * Sets error state if upload fails
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setUploadResponse(null);

    try {
      const formData = new FormData();
      formData.append("files", file);
      const endpoint = "http://localhost:5001/api/upload";
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }
      console.log(response);
      const data = await response.json();
      setUploadResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the query submission
   * Makes a POST request to the query endpoint with the user's query and filename
   * Updates the query response state on success
   * Sets error state if query fails
   * @param {Event} e - The form submission event
   */
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || !file) return;

    setIsQueryLoading(true);
    setError("");
    setQueryResponse(null);

    try {
      const queryData = {
        query: query,
        model: e.target.querySelector("select").value, // Get selected option value
      };
      console.log(queryData);
      fetch(
        `http://127.0.0.1:5001/api/query?query=${encodeURIComponent(queryData.query)}&model=${encodeURIComponent(queryData.model)}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          setQueryResponse(data);
          console.log(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (err) {
      console.error("Query error:", err);
      setError("Query error: " + err.message);
    } finally {
      setIsQueryLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Video Portal</h1>
          <p className="text-gray-600 mt-2">
            Upload your video to database (.mp4)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
              ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
              ${!file ? "hover:border-blue-500 hover:bg-blue-50" : ""}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            {!file ? (
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <span className="text-gray-600">Drag and drop or </span>
                  <span className="text-blue-500 hover:text-blue-600">
                    browse
                  </span>
                  <span className="text-gray-600"> to upload</span>
                </div>
                <span className="text-sm text-gray-500"></span>
              </label>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute -top-4 -right-4 p-1 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center justify-center space-x-2">
                  {mediaType === "image" ? (
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  ) : (
                    <VideoIcon className="h-5 w-5 text-blue-500" />
                  )}
                  <span className="text-gray-600">{file.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || isLoading}
            className="w-full py-2 px-4 rounded-lg text-white bg-blue-500 hover:bg-blue-600
              disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {/* Query Form - Only shown after successful upload */}

        <form onSubmit={handleQuerySubmit} className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your query..."
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="Stocktaking"
              >
                <option value="Stocktaking">Stocktaking</option>
                <option value="Restock">Restock</option>
              </select>
              <button
                type="submit"
                disabled={!query.trim() || isQueryLoading}
                className="px-4 py-2 bg-green-200 text-white rounded-lg hover:bg-green-600
                    disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                    flex items-center gap-2"
              >
                {isQueryLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Processing...
                  </>
                ) : (
                  "Tallin"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Preview */}
        {preview && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center space-x-2 mb-4">
              {mediaType === "image" ? (
                <ImageIcon className="h-5 w-5 text-blue-500" />
              ) : (
                <VideoIcon className="h-5 w-5 text-blue-500" />
              )}
              <span className="font-medium text-gray-700">Preview</span>
            </div>
            <div className="flex justify-center">
              {mediaType === "image" ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 rounded-lg object-contain"
                />
              ) : (
                <video src={preview} controls className="max-h-64 rounded-lg" />
              )}
            </div>
          </div>
        )}

        {/* Response Displays */}
        {uploadResponse && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-medium text-blue-800 mb-2">Upload Response:</h3>
            <pre className="text-sm text-blue-700 overflow-auto">
              {/* {JSON.stringify(uploadResponse, null, 2)} */}
              {uploadResponse["message"]}
            </pre>
          </div>
        )}

        {/* Response Displays */}
        {queryResponse && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-medium text-blue-800 mb-2">Query Response:</h3>
            <pre className="text-sm text-blue-700 overflow-auto">
              {queryResponse["message"]}
            </pre>
          </div>
        )}

        {/* Error Message */}
        {/* {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )} */}
      </div>
    </div>
  );
};

export default MediaUpload;
