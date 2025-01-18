"use client";
import { useState } from "react";
import { Button, TextInput, Card, Label, FileInput, Checkbox } from "flowbite-react";
import dynamic from "next/dynamic";
import AdSpaceContainer from "@/app/component/AdSense";
import { fileChecker } from "../../../component/FileChecker";
import { uploadImage } from "@/app/config/cloudinary/cloudinary";
import { toast } from "sonner";
import 'react-quill-new/dist/quill.snow.css';
import { useSelector } from "react-redux";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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

export default function CreatePost() {
  const currentUser = useSelector((state) => state.user?.currentUser || {});

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [content, setContent] = useState("");
  const [featured, setFeatured] = useState(false);
  const [premium, setPremium] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    try {
      fileChecker(file); // Validate file
      setImage(file); // Update image state
    } catch (error) {
      toast.error(error.message); // Show error to the user
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      if (image) {
        imageUrl = await uploadImage(image); // Upload image to Cloudinary
      }

      // Prepare payload
      const payload = {
        userRole: currentUser.role,
        createdBy: currentUser._id,
        title,
        subtitle,
        categories: selectedCategories,
        content,
        featured,
        premium,
        imageUrl,
      };
      console.log(payload);

      // API call
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Post created successfully!");
        // Reset form after successful submission
        setTitle("");
        setSubtitle("");
        setSelectedCategories([]);
        setContent("");
        setFeatured(false);
        setPremium(false);
        setImage(null); // Clear the image file input
      } else {
        toast.error("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto p-6 space-y-6 mt-10">
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
            <Label value="Categories" />
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

          <div className="flex items-center gap-4">
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
            <Label htmlFor="image" value="Upload Image" />
            <FileInput
              id="image"
              onChange={handleImageChange}
              helperText="PNG, JPG, JPEG (Max: 5MB)"
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save Post"}
            </Button>
            <Button
              type="button"
              color="gray"
              className="flex-1"
              onClick={() => alert("Cancelled")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
      <AdSpaceContainer />
    </>
  );
}
