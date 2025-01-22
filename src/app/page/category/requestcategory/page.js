"use client";
import { uploadImage } from "@/app/config/cloudinary/cloudinary";
import { useState } from "react";
import { useSelector } from "react-redux"; 
import { toast } from "sonner"; 

export default function RequestCategory() {
  const currentUser = useSelector((state) => state.user.currentUser); // Redux state for user
  const [categoryName, setCategoryName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // For previewing the image
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Generate a preview URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || !image || !description) {
      toast.error("Please fill out all fields!");
      return;
    }
    setUploading(true);
    const imageUrl = await uploadImage(image);
    if (!imageUrl) {
      setUploading(false);
      return;
    }
    const requestData = {
      userId: currentUser._id,
      categoryName,
      image: imageUrl,
      description,
    };

    try {
      console.log("Request data:", requestData);
      const response = await fetch("/api/request/categoryrequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Request submitted successfully!");
        setCategoryName("");
        setImage(null);
        setImagePreview(null);
        setDescription("");
        
      } else {
        toast.error(result.message || "Failed to submit request.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      toast.error("Failed to submit request.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="rounded-lg shadow-lg p-8 w-full max-w-lg bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Request to Add a Category
        </h1>
        <div className="flex items-center space-x-4">
          {console.log(currentUser.profilePicture)}
          {currentUser.profilePicture ? (
            <img
              src={currentUser.profilePicture}
              alt={currentUser.displayName}
              className="h-8 w-8 object-cover rounded-full"
            />
          ) : (
            <span className="text-white text-lg">{currentUser?.displayName}</span>
          )}
          <div>
            <h2 className="text-xl font-semibold">{currentUser?.displayName}</h2>
            <p className="text-sm text-gray-500">ID: {currentUser?._id}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">Category Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">Category Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Image preview"
                className="mt-4 w-full h-auto rounded-lg"
              />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
              Why add this category?
            </label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this category should be added"
              rows="4"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-2 px-4 text-white font-semibold rounded-lg ${
              uploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            } dark:bg-indigo-500 dark:hover:bg-indigo-600`}
          >
            {uploading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
