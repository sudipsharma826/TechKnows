"use client";

import { useState, useEffect } from "react";
import { Button, TextInput, Card, Label, Checkbox, FileInput, Spinner } from "flowbite-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import "react-quill-new/dist/quill.snow.css";
import { useSelector } from "react-redux";
import { uploadImage } from "../../../../config/cloudinary/cloudinary";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const categories = [
  "Technology",
  "Design",
  "Development",
  "Business",
  "Marketing",
  "Lifestyle",
  "Photography",
  "Writing",
];

export default function UpdatePost({ params }) {
  const currentUser = useSelector((state) => state.user?.currentUser || {});
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [content, setContent] = useState("");
  const [featured, setFeatured] = useState(false);
  const [premium, setPremium] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // For new image preview
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const postId = params.postId;

  useEffect(() => {
    if (postId) {
      fetchPostData(postId);
    }
  }, [postId]);

  const fetchPostData = async (id) => {
    try {
      const response = await fetch(`/api/post/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: id, userId: currentUser._id, userRole: currentUser.role }),
      });
      const data = await response.json();

      if (response.ok) {
        setTitle(data.title);
        setSubtitle(data.subtitle);
        setSelectedCategories(data.categories.filter((category) => categories.includes(category)));
        setContent(data.content);
        setImageUrl(data.imageUrl);
        setFeatured(data.isFeatured);
        setPremium(data.isPremium);
      } else {
        toast.error("Failed to load post data.");
      }
    } catch (error) {
      console.error("Error fetching post data:", error);
      toast.error("Failed to load post data.");
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
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
        body: JSON.stringify({
          payload,
          userRole: currentUser.role,
          userId: currentUser._id,
          postId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const slug = title
          .toLowerCase()
          .split(' ')
          .join('-')
          .replace(/[^a-zA-Z0-9-]/g, '');
          
          console.log("Post Slug:", slug);
        toast.success("Post updated successfully!");
        router.push(`/post/${slug}`);
      } else {
        toast.error("Failed to update post.");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);

    // Generate a preview of the new image
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 space-y-6 mt-15">
      <h2 className="text-2xl font-bold mb-4">Update Post</h2>
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
          <Label htmlFor="content" value="Content" />
          <ReactQuill
            theme="snow"
            placeholder="Write something..."
            className="h-72 mb-12"
            value={content}
            onChange={setContent}
            required
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-3xl">
          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <Label htmlFor="featured">Featured Post</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="premium"
              checked={premium}
              onChange={(e) => setPremium(e.target.checked)}
            />
            <Label htmlFor="premium">Premium Post</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="image-upload" value="Upload New Image" />
          <FileInput id="image-upload" onChange={handleImageChange} />
          {previewImage ? (
            <div className="mt-4">
              <img src={previewImage} alt="New Preview" className="w-full h-64 object-cover rounded-lg" />
            </div>
          ) : imageUrl ? (
            <div className="mt-4">
              <img src={imageUrl} alt="Current Preview" className="w-full h-64 object-cover rounded-lg" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((category) => (
            <Button
              key={category}
              type="button"
              color={selectedCategories.includes(category) ? "success" : "gray"}
              onClick={() => handleCategoryChange(category)}
              className="text-sm"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="flex justify-between space-x-4">
          <Button
            type="button"
            onClick={() => router.push("/")}
            color="failure"
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            className="w-full flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            {loading ? "Updating..." : "Update Post"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
