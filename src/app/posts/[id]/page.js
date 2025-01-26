"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux"; // Assuming you are using Redux
import { toast } from "sonner";

function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content?.split(/\s+/).length || 0;
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

  const currentUser = useSelector((state) => state.user.currentUser);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [packages, setPackages] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [orderId, setOrderId] = useState(null);

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

        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }

        const data = await response.json();
        setPost(data[0]);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchPackages() {
      try {
        const response = await fetch("/api/packages");
        if (!response.ok) {
          throw new Error("Failed to fetch packages");
        }

        const data = await response.json();
        setPackages(data.packages);

        // Filter out packages the current user hasn't subscribed to
        const available = data.packages.filter(
          (pkg) =>
            Array.isArray(pkg.subscribedBy) &&
            !pkg.subscribedBy.includes(currentUser?._id)
        );
        setAvailablePackages(available);
      } catch (error) {
        console.error("Error loading packages:", error);
      }
    }

    fetchPost();
    fetchPackages();
  }, [currentUser, id]);

  const handleProceedToPayment = () => {
    if (!currentUser) {
      router.push("/auth/login");
    } else {
      setShowModal(true);
      setOrderId(createOrderId());
    }
  };

  const createOrderId = () => Math.floor(Math.random() * 1000000);

  const handlePackageSelect = (e) => {
    const packageId = e.target.value;
    const selected = availablePackages.find((pkg) => pkg._id === packageId);
    setSelectedPackage(selected);
  };

  const handleProceedToPaymentConfirm = async () => {
    if (!selectedPackage || !orderId) return;

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser?._id,
          packageId: selectedPackage._id,
          amount: selectedPackage.price,
          order_id: orderId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.paymentUrl;
        toast.info("Redirecting to payment gateway...");
      } else {
        toast.error("Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An error occurred while processing your payment.");
    }
  };

  if (loading) {
    return <PostSkeleton />;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  const isSubscribedToPremium = post?.isPremium
    ? packages.some((pkg) => pkg.subscribedBy.includes(currentUser?._id))
    : true;

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
              <span>{calculateReadTime(post.content)} min read</span>
            </div>
          </div>

          {post?.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <Badge key={category.id || category._id} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {category?.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {post?.imageUrl && (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div
          className={`post-content prose prose-lg dark:prose-invert max-w-none ${
            post?.isPremium && !isSubscribedToPremium ? "blur-sm" : ""
          }`}
        >
          {post?.content?.replace(/<\/?[^>]+(>|$)/g, "")}
        </div>

        {post?.isPremium && !isSubscribedToPremium && (
          <div className="text-center mt-6">
            <p className="text-lg font-semibold text-muted-foreground">
              This is premium content. To view it, you need to make a payment.
            </p>
            <button
              onClick={handleProceedToPayment}
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
              <p className="text-sm text-muted-foreground">
                {post?.createdBy?.email}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Select a Package</h2>

            <div>
              <select
                onChange={handlePackageSelect}
                className="w-full p-2 border rounded-md"
              >
                <option value="" disabled selected>
                  Select a Package
                </option>
                {availablePackages.map((pkg) => (
                  <option key={pkg._id} value={pkg._id}>
                    {pkg.name} - {pkg.price} NPR (Expiry: {pkg.expiryTime} days)
                  </option>
                ))}
              </select>
            </div>

            {selectedPackage && (
              <div className="mt-6">
                <h2 className="font-semibold">Billing Information</h2>
                <div className="mt-4">
                  <p>
                    <strong>Order Id:</strong> {orderId}
                  </p>
                  <p>
                    <strong>Package Name:</strong> {selectedPackage.name}
                  </p>
                  <p>
                    <strong>Price:</strong> {selectedPackage.price} NPR
                  </p>
                </div>

                <button
                  onClick={handleProceedToPaymentConfirm}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Proceed to Payment
                </button>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-300 text-black rounded-lg"
            >
              Close
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
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        <Skeleton className="h-96" />

        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
    </div>
  );
}
