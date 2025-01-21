"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

const VerifyPage = ({ params }) => {
  const router = useRouter();
  const { token } = params; // Access the `token` from the URL
  console.log("Token:", token);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyAccount(token);
    }
  }, [token]);

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
       router.push("/auth/login");// Redirect to login
      } else {
        setMessage(data.error || "Failed to verify your account.");
        toast.error(data.error || "Failed to verify your account.");
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
      <div className="p-6 bg-white shadow-lg rounded-lg text-center">
        {loading ? (
          <p>Verifying account...</p>
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
