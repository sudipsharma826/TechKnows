"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostsPage() {
  const [posts, setPosts] = useState([]);

  // Fetch posts
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          "/api/post?userRole=guest&userId=guest&general=true&fetchType=all"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);


  return (
    <div className="container mx-auto px-4 py-12 mt-5">
      <div className="space-y-8">
        {/* Header */}
        <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>

        {/* Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                {post.imageUrl && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  {post?.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category) =>
                        typeof category === "object" ? (
                          <Badge key={category._id} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {category?.name}
                          </Badge>
                        ) : (
                          <Badge key={category} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {category}
                          </Badge>
                        )
                      )}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                    <p className="text-muted-foreground line-clamp-2">
                      {post.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{calculateReadTime(post.content)} min read</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
