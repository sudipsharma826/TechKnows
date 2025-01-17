'use client';

import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState, useEffect, useRef } from "react";
import { FiEdit } from "react-icons/fi";
import AdSpaceContainer from "@/app/component/AdSense";
import { useRouter } from "next/navigation"; // For navigation
import { Toaster, toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { setUser, clearUser } from "../../../lib/slices/userSlice";
import { uploadImage } from "@/app/config/cloudinary/cloudinary";
import OAuth from "../../component/GoogleOAuth";

const SignInPage = () => {
  const router = useRouter(); // Move this to the top

  useEffect(() => {
    // Check if redirected
    if (router.query) {
      toast.info("To access this route, you must log in first.");
    }
  }, [router.query]); // Now this works since router is initialized

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    profilePic: null,
  });
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user?.currentUser);

  useEffect(() => {
    if (currentUser) {
      router.push("/"); // Redirect to home if the user is already logged in
    }
  }, [currentUser, router]);

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "profilePic" && files) {
      const file = files[0];
      if (file) {
        const validTypes = ["image/png", "image/jpeg"];
        if (!validTypes.includes(file.type)) {
          toast.error("Only .png or .jpg files are allowed.");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size must be less than 5 MB.");
          return;
        }
        setFormData({ ...formData, profilePic: file });
      }
    } else {
      setFormData({ ...formData, [id]: value.trim() });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill all the fields");
      setShowError(true);
      return;
    }

    try {
      setLoading(true);

      let profilePicURL = "";

      if (formData.profilePic) {
        profilePicURL = await uploadImage(formData.profilePic); // Upload the profile picture
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          profilePic: profilePicURL,
        }),
      });

      if (response.ok) {
        const { user } = await response.json();
        dispatch(setUser(user)); // Save user details to Redux
        router.push("/"); // Redirect after successful login
        toast.success(`Welcome, ${user.firstName}!`);
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      dispatch(clearUser());
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <Toaster richColors position="top-center" />
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-8">
                    <FiEdit className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">TechKnow</h1>
                  </div>
                  <p className="text-xl font-semibold mb-4">Welcome Back!</p>
                  <p className="text-gray-100 mb-8">
                    "Technology is best when it brings people together. Join our
                    community of tech enthusiasts and share your knowledge with
                    the world."
                  </p>
                </div>
                <div className="text-center">
                  <AdSpaceContainer />
                </div>
              </div>
            </div>

            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Sign in to your account
              </h2>

              <OAuth />

              <div className="relative flex justify-center text-sm mt-4">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 mb-7">
                  Or continue with
                </span>
              </div>
              <form
                className="space-y-6"
                onSubmit={handleSubmit}
                encType="multipart/form-data"
              >
                <div>
                  <Label className="text-gray-700 dark:text-gray-200" value="Email address" />
                  <TextInput
                    type="email"
                    id="email"
                    placeholder="info@example.com"
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
                <div className="mt-6">
                  <Label
                    className="text-gray-700 dark:text-gray-200"
                    value="Profile Picture (Optional)"
                  />
                  <div className="flex flex-col items-center justify-center mt-4 relative">
                    <div
                      className="w-32 h-32 border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center overflow-hidden group cursor-pointer hover:border-blue-500 transition duration-300 ease-in-out"
                      onClick={handleEditClick}
                    >
                      {formData.profilePic ? (
                        <img
                          src={URL.createObjectURL(formData.profilePic)}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="text-gray-500 dark:text-gray-300 group-hover:text-blue-500">
                          <FiEdit className="w-6 h-6" />
                        </div>
                      )}
                      <input
                        type="file"
                        id="profilePic"
                        ref={fileInputRef}
                        onChange={handleChange}
                        accept="image/png, image/jpeg"
                        className="hidden"
                      />
                    </div>
                    <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Choose a profile picture
                    </span>
                  </div>
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
                    "Sign in"
                  )}
                </Button>

                {showError && errorMessage && (
                  <Alert className="mt-4" color="failure">
                    {errorMessage}
                  </Alert>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
