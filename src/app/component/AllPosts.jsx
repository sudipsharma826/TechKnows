"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function AllPosts({ posts, categories }) {
  const [activeCategory, setActiveCategory] = useState("All");

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
                {category?.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.slice(0, 10).map((post) => (
                <Link key={post?._id} href={`/posts/${post?.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={post?.imageUrl}
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
                            {category}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 line-clamp-1">
                        {post?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {post?.content?.replace(/<\/?[^>]+(>|$)/g, "")}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={post?.createdBy?.profilePicture}
                              alt={post?.createdBy?.displayName || "Author"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {post?.createdBy?.displayName}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(post?.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {filteredPosts.length > 10 && (
              <div className="mt-8 text-center">
                <Link href="/posts">
                  <Button variant="outline">Show More Posts</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
