"use client";

import { useState } from "react";
import { Button, TextInput, Card, Label, FileInput, Checkbox } from "flowbite-react";
import dynamic from "next/dynamic";
import AdSpaceContainer from "@/app/component/AdSense";
import { toast } from "sonner";
import "react-quill-new/dist/quill.snow.css";

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

export default function UpdatePost() {
  // Simulated existing data
  const [title, setTitle] = useState("Existing Post Title");
  const [subtitle, setSubtitle] = useState("Existing Subtitle");
  const [selectedCategories, setSelectedCategories] = useState(["Technology", "Development"]);
  const [content, setContent] = useState("<p>This is the existing content.</p>");
  const [featured, setFeatured] = useState(true);
  const [premium, setPremium] = useState(false);
  const [imageUrl, setImageUrl] = useState("https://via.placeholder.com/300");
  const [categorySearch, setCategorySearch] = useState("");
  const [loading, setLoading] = useState(false);

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
      // Placeholder for API integration
      const payload = {
        title,
        subtitle,
        categories: selectedCategories,
        content,
        featured,
        premium,
        imageUrl,
      };
      console.log("Updated Post Payload:", payload);

      toast.success("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-3xl mx-auto p-6 space-y-6">
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
            <Label htmlFor="category-search" value="Search Categories" />
            <TextInput
              id="category-search"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value.toLowerCase())}
              placeholder="Search categories"
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {categories
                .filter((category) => category.toLowerCase().includes(categorySearch))
                .map((category) => (
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
                  [{ header: "1" }, { header: "2" }, { font: [] }],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["bold", "italic", "underline", "strike"],
                  [{ align: [] }],
                  ["link"],
                  ["blockquote", "code-block"],
                  [{ color: [] }, { background: [] }],
                  ["clean"],
                ],
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
            <Label htmlFor="image" value="Image URL" />
            <TextInput
              id="image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-4 w-full h-64 object-cover rounded-lg"
              />
            )}
          </div>

          <div className="flex space-x-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Updating..." : "Update Post"}
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
