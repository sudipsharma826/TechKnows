"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AllPosts({ posts, categories }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Debugging incoming data
  useEffect(() => {
    console.log("Posts:", posts);
    console.log("Categories:", categories);
  }, [posts, categories]);

  useEffect(() => {
    // Simulate data fetching delay
    const timer = setTimeout(() => setLoading(false), 5500);
    return () => clearTimeout(timer);
  }, []);

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) =>
          post?.categories?.some((cat) => cat === activeCategory)
        );

  return (
    <section className="py-12 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter mb-8">All Posts</h2>
        <Tabs defaultValue="All" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent">
            <TabsTrigger
              value="All"
              onClick={() => setActiveCategory("All")}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger
                key={category?._id}
                value={category?.name}
                onClick={() => setActiveCategory(category?.name)}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category?.name || "Unnamed Category"}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="All" className="mt-6">
            {loading ? (
              <SkeletonGrid />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.slice(0, 10).map((post) => (
                  <PostCard key={post?._id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category?._id} value={category?.name} className="mt-6">
              {activeCategory === category?.name &&
                (loading ? (
                  <SkeletonGrid />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <PostCard key={post?._id} post={post} />
                    ))}
                  </div>
                ))}
            </TabsContent>
          ))}

          {filteredPosts.length > 10 && (
            <div className="mt-8 text-center">
              <Link href="/posts">
                <Button variant="outline">Show More Posts</Button>
              </Link>
            </div>
          )}
        </Tabs>
      </div>
    </section>
  );
}

// Loading Skeleton Grid
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Post Card Component
function PostCard({ post }) {
  console.log("Post:", post);
  if (!post) return null; // Safeguard for undefined post object

  return (
    <Link href={`/posts/${post?.slug || ""}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="relative w-full h-48 mb-4">
            <Image
              src={post?.imageUrl || "/placeholder.jpg"} // Use a placeholder image if imageUrl is undefined
              alt={post?.title || "Post Image"}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {post?.categories?.map((category, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-secondary rounded-full"
              >
                {category || "Unknown Category"}
              </span>
            ))}
          </div>
          <h3 className="text-xl font-semibold mb-2 line-clamp-1">
            {post?.title || "Untitled Post"}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {post?.content
              ? post.content.replace(/<\/?[^>]+(>|$)/g, "")
              : "No content available."}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={post?.createdBy?.profilePicture || "/default-avatar.jpg"}
                  alt={post?.createdBy?.displayName || "Author"}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-sm font-medium">
                {post?.createdBy?.displayName || "Unknown Author"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {post?.createdAt
                ? new Date(post.createdAt).toLocaleDateString()
                : "Unknown Date"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
