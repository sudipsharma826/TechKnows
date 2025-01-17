'use client';

import { AiFillGoogleCircle } from 'react-icons/ai';
import { FaGithub } from 'react-icons/fa';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseApp } from '../config/fireBase/fireBaseConfig';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../../lib/slices/userSlice';
import { toast, Toaster } from 'sonner';
import { useState } from 'react';

const OAuth = () => {
  const router = useRouter();
  const currentUser = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const auth = getAuth(firebaseApp);
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = async (providerType) => {
    let provider;

    if (providerType === 'google') {
      provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
    } else if (providerType === 'github') {
      provider = new GithubAuthProvider();
      provider.setCustomParameters({
        allow_signup: 'true',
        scope: 'user:email',
      });
    } else {
      toast.error('Invalid OAuth provider.');
      return;
    }

    setLoading(true);
    toast.loading('Please wait... Logging you in!', { id: 'auth' });

    try {
      const result = await signInWithPopup(auth, provider);
      const { displayName, email, photoURL, phoneNumber, providerId } = result.user.providerData[0];

      // Send data to the backend
      const response = await fetch(`/api/auth/oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.currentToken || ''}`,
        },
        body: JSON.stringify({ displayName, email, photoURL, phoneNumber, providerId }),
        credentials: 'include',
      });

      // Check if response is valid JSON
      if (!response.ok) {
        const errorText = await response.text(); // Read the response body as text
        console.error('Backend error response:', errorText);
        toast.error('Failed to authenticate the user with backend.');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      dispatch(setUser(data.user));
      toast.success(`Welcome back, ${data.user.displayName}!`);
      router.push('/');
    } catch (error) {
      console.error(`${providerType} authentication error:`, error.message);
      toast.error(`Authentication failed: ${error.message}`);
      dispatch(clearUser());
    } finally {
      setLoading(false);
      toast.dismiss('auth');
    }
  };

  return (
    <div className="flex flex-col space-y-2 max-w-xs mx-auto">
      <Toaster richColors position="top-center" />
      <>
        {/* Google Login */}
        <button
          onClick={() => handleOAuthLogin('google')}
          className="flex items-center justify-start w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition duration-200"
          disabled={loading}
        >
          <AiFillGoogleCircle className="w-6 h-6 text-red-500" />
          <span className="ml-3 text-sm font-semibold">Sign in with Google</span>
        </button>

        {/* GitHub Login */}
        <button
          onClick={() => handleOAuthLogin('github')}
          className="flex items-center justify-start w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition duration-200"
          disabled={loading}
        >
          <FaGithub className="w-6 h-6 text-gray-800 dark:text-white" />
          <span className="ml-3 text-sm font-semibold">Sign in with GitHub</span>
        </button>
      </>
    </div>
  );
};

export default OAuth;
