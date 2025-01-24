'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { fileChecker } from '../../../component/FileChecker';
import { uploadImage } from '../../../config/cloudinary/cloudinary';
import { useSelector } from 'react-redux';

export function CategoryForm({ onSubmit }) {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null); // New state for the image file

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please upload an image.');
      return;
    }

    // Upload the image to Cloudinary
    setLoading(true);
    try {
      const upload = await uploadImage(file); // Upload image
      setImage(upload); // Store the URL of the uploaded image

      const category = {
        userId: currentUser?._id,
        categoryName: name,
        description: 'Admin added category',
        image: upload, // Save the image URL
      };

      const response = await fetch('/api/request/categoryrequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setName('');
        setImage('');
        setPreview('');
        setFile(null); // Clear file state
        onSubmit && onSubmit(); // Trigger callback if provided
      } else {
        toast.error(data.error || 'Failed to add category.');
      }
    } catch (error) {
      console.error('Add category error:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && fileChecker(selectedFile)) {
      setFile(selectedFile); // Save file object
      const imageUrl = URL.createObjectURL(selectedFile);
      setPreview(imageUrl); // Set preview of the image
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Category</h2>

      {/* Category Name Input */}
      <div className="mb-6">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Category Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter category name"
          required
        />
      </div>

      {/* Category Image Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Image
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setPreview('');
                  setImage('');
                  setFile(null); // Clear the file state
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="image"
                  className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="image"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-lg transition duration-200 ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-4 border-t-4 border-white rounded-full animate-spin"></div>
          </div>
        ) : (
          'Add Category'
        )}
      </button>
    </form>
  );
}

export default CategoryForm;
