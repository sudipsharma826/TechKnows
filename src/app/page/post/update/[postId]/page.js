"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  TextInput,
  Card,
  Label,
  Checkbox,
  FileInput,
  Spinner,
} from "flowbite-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import "react-quill-new/dist/quill.snow.css";
import { useSelector } from "react-redux";
import { uploadImage } from "../../../../config/cloudinary/cloudinary";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function UpdatePost() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.postId;

  const currentUser = useSelector((state) => state.user?.currentUser || {});

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [content, setContent] = useState("");
  const [featured, setFeatured] = useState(false);
  const [premium, setPremium] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch post data and categories
  useEffect(() => {
    if (postId && currentUser._id) {
      fetchPostData(postId);
      fetchCategories();
    }
  }, [postId, currentUser._id]);

  const fetchPostData = async (id) => {
    try {
      const response = await fetch(`/api/post`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser._id,
          userRole: currentUser.role,
          postId: id,
        }),
      });

      if (!response.ok) throw new Error("Failed to load post data.");

      const data = await response.json();
      setTitle(data.title || "");
      setSubtitle(data.subtitle || "");
      setSelectedCategories(data.categories || []);
      setContent(data.content || "");
      setImageUrl(data.imageUrl || "");
      setFeatured(data.isFeatured || false);
      setPremium(data.isPremium || false);
    } catch (error) {
      console.error("Error fetching post data:", error);
      toast.error("Failed to load post data.");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `/api/post?userRole=${currentUser.role}&userId=${currentUser._id}&general=true&fetchType=categories`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to fetch categories.");

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories.");
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPreviewImage(event.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updatedImageUrl = imageUrl;

      if (newImage) {
        updatedImageUrl = await uploadImage(newImage);
      }

      const payload = {
        title,
        subtitle,
        categories: selectedCategories,
        content,
        isFeatured: featured,
        isPremium: premium,
        imageUrl: updatedImageUrl,
      };

      const response = await fetch(`/api/post`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload,
          userRole: currentUser.role,
          userId: currentUser._id,
          postId,
        }),
      });

      if (!response.ok) throw new Error("Failed to update post.");

      const slug = title
        .toLowerCase()
        .split(" ")
        .join("-")
        .replace(/[^a-zA-Z0-9-]/g, "");

      toast.success("Post updated successfully!");
      router.push(`/posts/${slug}`);
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 space-y-6 mt-15">
      <h2 className="text-2xl font-bold mb-4">Update Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="title"
          label="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
          required
        />
        <TextInput
          id="subtitle"
          label="Subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Enter post subtitle"
        />
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="h-72"
          required
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
          placeholder="Write content..."
        />
        

        <FileInput id="image-upload" onChange={handleImageChange} />
        {previewImage ? (
          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-64 object-cover mt-4 rounded-lg"
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Current Preview"
            className="w-full h-64 object-cover mt-4 rounded-lg"
          />
        ) : null}
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((category) => (
            <Button
              key={category._id}
              type="button"
              color={selectedCategories.includes(category._id) ? "success" : "gray"}
              onClick={() => handleCategoryChange(category._id)}
              className="text-sm"
            >
              {category.name}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-5">
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
        <div className="flex justify-between mt-4">
          <Button type="button" onClick={() => router.push("/")} color="failure">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} color="success">
            {loading ? <Spinner size="xl" className="mr-2" /> : null}
            {loading ? "Updating..." : "Update Post"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
