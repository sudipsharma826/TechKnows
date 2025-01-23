import { useState, useEffect } from "react";
import { Button, TextInput, Card, Label, FileInput, Checkbox } from "flowbite-react";
import dynamic from "next/dynamic";
import AdSpaceContainer from "@/app/component/AdSense";
import { fileChecker } from "../../../component/FileChecker";
import { uploadImage } from "@/app/config/cloudinary/cloudinary";
import { toast } from "sonner";
import 'react-quill-new/dist/quill.snow.css';
import { useSelector } from "react-redux";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function CreatePost() {
  const currentUser = useSelector((state) => state.user?.currentUser || {});

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]); // Initialize as an empty array
  const [content, setContent] = useState("");
  const [featured, setFeatured] = useState(false);
  const [premium, setPremium] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);  // For image preview
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Fetch categories from the backend on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/post?userRole=${currentUser.role}&userId=${currentUser._id}&general=true&fetchType=categories
`, {
          method: "GET",
        });
        const data = await response.json();
        console.log("Data from categories ",data)
        if (response.ok) {
          setFilteredCategories(data.categories); // Set categories from backend
        } else {
          toast.error("Failed to fetch categories.");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        toast.error("An error occurred while fetching categories.");
      }
    };

    if (currentUser._id) {
      fetchCategories();
    }
  }, [currentUser._id, currentUser.role]);

  // Handle search functionality for categories
  const handleCategorySearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setCategorySearch(searchValue);
    // Filter categories based on search
    setFilteredCategories((prevCategories) =>
      prevCategories.filter((category) =>
        category.name.toLowerCase().includes(searchValue) // Assuming categories have a `name` property
      )
    );
  };

  // Handle category selection/deselection
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category._id)
        ? prev.filter((c) => c !== category._id)
        : [...prev, category._id]
    );
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    try {
      fileChecker(file);
      setImage(file);

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = "";

      if (image) {
        imageUrl = await uploadImage(image);
      }

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

      if (response.ok) {
        toast.success("Post created successfully!");
        setTitle("");
        setSubtitle("");
        setSelectedCategories([]);
        setContent("");
        setFeatured(false);
        setPremium(false);
        setImage(null);
        setImagePreview(null);
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
              onChange={handleCategorySearch}
            />
            <Label value="Categories" className="mt-2" />
            <div className="flex flex-wrap gap-2 mt-2">
              {filteredCategories.map((category) => (
                <Button
                  key={category._id} // Assuming each category has a unique _id
                  type="button"
                  color={selectedCategories.includes(category._id) ? "success" : "gray"}
                  onClick={() => handleCategoryChange(category)}
                  className="text-sm"
                >
                  {category.name} {/* Assuming category has a 'name' property */}
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

          <div>
            <Label htmlFor="image" value="Upload Image" />
            <FileInput
              id="image"
              onChange={handleImageChange}
              helperText="PNG, JPG, JPEG (Max: 5MB)"
            />
            {/* Display Image Preview */}
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Image Preview" className="w-full h-auto rounded" />
              </div>
            )}
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
