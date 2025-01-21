"use client";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

const VerifyPage = (params) => {
  const router = useRouter();
  const { token } = params;

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyAccount(token);
    }
  }, [token]);

  const verifyAccount = async (verificationToken) => {
    try {
      const response = await fetch(`/api/auth/login `,{
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({verificationToken}),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        toast.success(data.message);
        setTimeout(() => router.push('/login'), 3000); // Redirect to login after success
      } else {
        setMessage(data.error);
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster />
      <div className="p-6 bg-white shadow-lg rounded-lg text-center">
        {loading ? (
          <toast info="Verifying your account..." />
        ) : (
          <toast info={message} />
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
