"use client";
import { useEffect, useState } from "react";
import { Clock, Calendar, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";

function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content?.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/post`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "guest",
            userRole: "guest",
            postId: id,
          }),
        });

        const data = await response.json();
        setPost(data[0]);
        console.log(data[0]);  

      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  if (loading) {
    return <PostSkeleton />;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  const readTime = calculateReadTime(post?.content?.replace(/<\/?[^>]+(>|$)/g, "") || "");

  return (
    <article className="container max-w-4xl mx-auto px-4 py-12 mt-10">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{post?.title}</h1>
          <p className="text-xl text-muted-foreground">{post?.subtitle}</p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post?.createdBy?.displayName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{readTime} min read</span>
            </div>
          </div>

          {post?.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post?.categories?.map((category) => (
                <Badge key={category.id} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {category?.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {post.imageUrl && (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="post-content prose prose-lg dark:prose-invert max-w-none">
          {post?.content?.replace(/<\/?[^>]+(>|$)/g, "")}
        </div>

        <Card className="p-6 mt-12">
          <div className="flex items-start gap-4">
            {post?.createdBy?.profilePicture && (
              <img
                src={post.createdBy.profilePicture}
                alt={post.createdBy.displayName}
                className="rounded-full w-12 h-12 object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold">{post?.createdBy?.displayName}</h3>
              <p className="text-sm text-muted-foreground">{post?.createdBy?.email}</p>
            </div>
          </div>
        </Card>
      </div>
    </article>
  );
}

function PostSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-2/3" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
