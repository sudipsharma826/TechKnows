"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

const VerifyPage = () => {
  const router = useRouter();
  const { token } = router.query; // Access the `token` from the URL

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!router.isReady) return; // Wait until the router is ready
    if (token) {
      verifyAccount(token);
    }
  }, [router.isReady, token]);

  const verifyAccount = async (verificationToken) => {
    try {
      const response = await fetch(`/api/auth/login`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationToken }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        toast.success(data.message); // Show success notification
        setTimeout(() => router.push("/auth/login"), 3000); // Redirect to login
      } else {
        setMessage(data.error);
        toast.error(data.error); // Show error notification
      }
    } catch (error) {
      console.error("Verification error:", error);
      setMessage("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster />
      <div className="p-6 bg-white shadow-lg rounded-lg text-center">
        {loading ? (
          <p>Verifying your account...</p>
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
