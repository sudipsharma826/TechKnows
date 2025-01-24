"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function PostSlider({ posts }) {
  return (
    <section className="py-12 bg-background">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter mb-8">Trending Posts</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {posts?.map((post) => (
              <CarouselItem key={post?._id} className="md:basis-1/2 lg:basis-1/3">
                <Link href={`/posts/${post?.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="relative w-full h-48 mb-4">
                        <Image
                          src={post?.imageUrl || "/placeholder-image.jpg"} // Fallback for missing image
                          alt={post?.title || "Post Image"}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 line-clamp-1">
                        {post?.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {post?.content?.replace(/<\/?[^>]+(>|$)/g, "") || "No content available."}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={
                                post?.createdBy?.profilePicture 
                              }
                              alt={post?.createdBy?.displayName || "Author"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {post?.createdBy?.displayName || "Anonymous"}
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
