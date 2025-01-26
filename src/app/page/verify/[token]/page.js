"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

const VerifyPage = ({ params }) => {
  const router = useRouter();
  const { token } = params; // Extract the `token` from the URL
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
      setLoading(true); // Start loading state

      const response = await fetch(`/api/auth/login`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        toast.success(data.message); // Display success notification
        router.push("/auth/login"); // Redirect to the login page
      } else {
        const errorMessage = data.error || "Failed to verify your account.";
        setMessage(errorMessage);
        toast.error(errorMessage); // Display error notification
      }
    } catch (error) {
      console.error("Verification error:", error);
      setMessage("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred."); // Display error notification
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster position="top-center" /> {/* For toast notifications */}
      <div className="p-6 bg-white shadow-lg rounded-lg text-center">
        {loading ? (
          <p className="text-gray-700">Verifying account...</p>
        ) : (
          <p className="text-gray-800">{message}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
