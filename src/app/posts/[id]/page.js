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
  const [showModal, setShowModal] = useState(false);

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

  const handleProceedToPayment = () => {
    setShowModal(false);
    // Navigate to package selection or payment page
    router.push("/payment"); // Adjust this path as per your routing
  };

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

        <div className={`post-content prose prose-lg dark:prose-invert max-w-none ${post?.isPremium ? "blur-sm" : ""}`}>
          {post?.content?.replace(/<\/?[^>]+(>|$)/g, "")}
        </div>

        {post?.isPremium && (
          <div className="text-center mt-6">
            <p className="text-lg font-semibold text-muted-foreground">
              This is premium content. To view it, you need to make a payment.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Proceed to Payment
            </button>
          </div>
        )}

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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Premium Content</h2>
            <p className="text-sm text-muted-foreground mb-6">
              To view this content, you need to purchase a package. Click the button below to proceed.
            </p>
            <button
              onClick={handleProceedToPayment}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
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
