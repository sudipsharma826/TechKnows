"use client";

import React, { useEffect, useState } from "react";
import HeroSection from "./component/HeroSection";
import FeaturedPosts from "./component/FeaturedPosts";
import AllPosts from "./component/AllPosts";
import PostSlider from "./component/PostSlider";
import PostsPage from "../app/posts/page"; 

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/post?userRole=guest&userId=guest&general=true&fetchType=all`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setPosts(data.posts || []);
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching posts and categories:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedPosts posts={posts} />
      {/* <AllPosts posts={posts} categories={categories} /> */}
      <PostSlider posts={posts} />
    </main>
  );
}
