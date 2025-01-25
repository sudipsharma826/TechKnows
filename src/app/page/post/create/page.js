"use client";
import { useState, useEffect } from "react";
import {
  Button,
  TextInput,
  Card,
  Label,
  FileInput,
  Checkbox,
} from "flowbite-react";
import dynamic from "next/dynamic";
import AdSpaceContainer from "@/app/component/AdSense";
import { fileChecker } from "../../../component/FileChecker";
import { uploadImage } from "@/app/config/cloudinary/cloudinary";
import { toast } from "sonner";
import "react-quill-new/dist/quill.snow.css";
import { useSelector } from "react-redux";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function CreatePost() {
  const currentUser = useSelector((state) => state.user?.currentUser || {});
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [content, setContent] = useState("");
  const [featured, setFeatured] = useState(false);
  const [premium, setPremium] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Fetch categories on mount and filter based on the search query
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `/api/post?userRole=${currentUser.role}&userId=${currentUser._id}&general=true&fetchType=categories`
        );
        const data = await response.json();
        if (response.ok) {
          setAllCategories(data.categories);
          setFilteredCategories(data.categories); // Initialize filtered categories
        } else {
          toast.error("Failed to fetch categories.");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("An error occurred while fetching categories.");
      }
    };

    if (currentUser._id) fetchCategories();
  }, [currentUser._id, currentUser.role]);

  useEffect(() => {
    // Filter categories based on search
    const filtered = allCategories.filter((category) =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categorySearch, allCategories]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    try {
      fileChecker(file);
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      let imageUrl = "";
      if (image) imageUrl = await uploadImage(image);
  
      const payload = {
        userRole: currentUser.role,
        createdBy: currentUser._id,
        title,
        subtitle,
        categories: selectedCategories,
        content,
        isFeatured: featured,
        isPremium: premium,
        imageUrl,
      };
  
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      // Check if the response is ok (status code 2xx)
      if (response.ok) {
        toast.success("Post created successfully!");
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to create post: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setSelectedCategories([]);
    setContent("");
    setFeatured(false);
    setPremium(false);
    setImage(null);
    setImagePreview(null);
    setCategorySearch("");
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold mb-4">Create Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" value="Post Title" />
            <TextInput
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <Label htmlFor="subtitle" value="Subtitle" />
            <TextInput
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter post subtitle"
            />
          </div>

          <div>
            <Label value="Search Categories" />
            <TextInput
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {filteredCategories.map((category) => (
                <Button
                  key={category._id}
                  type="button"
                  color={
                    selectedCategories.includes(category._id)
                      ? "success"
                      : "gray"
                  }
                  onClick={() => handleCategoryChange(category._id)}
                  className="text-sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="content" value="Content" />
            <ReactQuill
              theme="snow"
              placeholder="Write something..."
              className="h-72 mb-12"
              value={content}
              onChange={setContent}
              modules={{
                toolbar: [
                  [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'align': [] }],
                  ['link'],
                  ['blockquote', 'code-block'],
                  [{ 'color': [] }, { 'background': [] }],
                  ['clean']
                ]
              }}
              required
            />
          </div>


          <div>
            <Label htmlFor="image" value="Upload Image" />
            <FileInput
              id="image"
              onChange={handleImageChange}
              helperText="PNG, JPG, JPEG (Max: 5MB)"
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto rounded"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-5">
            <Checkbox
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <Label htmlFor="featured">Featured Post</Label>
            <Checkbox
              id="premium"
              checked={premium}
              onChange={(e) => setPremium(e.target.checked)}
            />
            <Label htmlFor="premium">Premium Post</Label>
          </div>
          <div className="flex space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Post"}
            </Button>
            <Button type="button" color="gray" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
      <AdSpaceContainer />
    </>
  );
}
