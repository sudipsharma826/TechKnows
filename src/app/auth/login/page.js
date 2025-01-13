"use client";
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { FiEdit } from 'react-icons/fi';
import AdSpaceContainer from '@/app/component/AdSense';
import { useRouter } from 'next/navigation';

const SignInPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);  // For loading state
  const [errorMessage, setErrorMessage] = useState("");  // Error message state

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill all the fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),  // Send the form data as JSON
      });

      if (response.ok) {
        const { user } = await response.json(); // user is extracted here
        router.push('/');

        console.log('User signed in successfully', user); // log the user object
      } else {
        setErrorMessage("Invalid email or password");
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setErrorMessage("An error occurred. Please try again.");
      console.error(error);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      setShowError(true);
      const timeout = setTimeout(() => {
        setShowError(false);
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Side  */}
            <div className="md:w-1/2 p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-8">
                    <FiEdit className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">TechKnow</h1>
                  </div>
                  <p className="text-xl font-semibold mb-4">Welcome Back!</p>
                  <p className="text-gray-100 mb-8">
                    "Technology is best when it brings people together. Join our community of tech enthusiasts and share your knowledge with the world."
                  </p>
                </div>
                <div className="text-center">
                  <AdSpaceContainer />
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Sign in to your account
              </h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label className="text-gray-700 dark:text-gray-200" value="Email address" />
                  <TextInput
                    type="email"
                    id="email"
                    placeholder="info@sudipsharma.com.np"
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-200" value="Password" />
                  <TextInput
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  gradientDuoTone="purpleToBlue"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span className="ml-2">Signing in...</span>
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>
              </form>

              {showError && errorMessage && (
                <Alert className="mt-4" color="failure">
                  {errorMessage}
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
