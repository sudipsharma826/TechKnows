"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// Variables to hold posts and categories
let posts = [];
let categories = [];

// Function to remove HTML tags from a string
const stripHTMLTags = (htmlContent) => {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlContent;
  return tempElement.textContent || tempElement.innerText || "";
};

// Function to fetch posts and categories
const fetchData = async (user) => {
  try {
    const response = await fetch(
      `/api/page?userRole=${user.role}&userId=${user._id}&general=true&fetchType=all`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Clean the content of each post to remove HTML tags
    posts = (data.posts || []).map((post) => ({
      ...post,
      content: stripHTMLTags(post.content), // Cleaned content
    }));

    categories = data.categories || [];
  } catch (error) {
    console.error("Error fetching posts and categories:", error);
    toast.error("Failed to fetch posts and categories. Please try again.");
    posts = [];
    categories = [];
  }
};

// Page component to trigger data fetching
export default function Post() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const user = currentUser || { role: "guest", _id: "guest" };

  useEffect(() => {
    const fetchAndSetData = async () => {
      await fetchData(user);
    };

    fetchAndSetData();
  }, [user]);

  return null; // No UI rendering here
}

// Export posts and categories for use in other components
export { posts, categories };
