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
  const [authMessage, setAuthMessage] = useState('');
  const [isAuthInProgress, setIsAuthInProgress] = useState(false);

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
        scope: 'user:email', // Make sure we request the right GitHub permissions
      });
    } else {
      toast.error('Invalid OAuth provider.');
      return;
    }

    setLoading(true);
    setAuthMessage('Please wait... We are logging you in!');
    setIsAuthInProgress(true);

    toast.loading('Please wait... Logging you in!', { id: 'auth' }); // Show a toast for the wait time

    try {
      const result = await signInWithPopup(auth, provider);
      const { displayName, email, photoURL, phoneNumber, providerId } = result.user.providerData[0];

      const response = await fetch(`/api/auth/oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.currentToken}`,
        },
        body: JSON.stringify({ displayName, email, photoURL, phoneNumber, providerId }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(setUser(data.user));
        toast.success(`Welcome back, ${data.user.displayName}!`);
        router.push('/');
      } else {
        console.error('Failed to authenticate the user with backend.');
        toast.error('Backend authentication failed.');
      }
    } catch (error) {
      console.error(`${providerType} authentication error:`, error.code, error.message);
      setAuthMessage(`Authentication failed: ${error.message}`);
      toast.error(`Authentication failed: ${error.message}`);
      dispatch(clearUser());
    } finally {
      setLoading(false);
      toast.dismiss('auth'); // Dismiss the loading toast once done
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
            <span className="ml-3 text-sm font-semibold">
              Sign in with Google
            </span>
          </button>

          {/* GitHub Login */}
          <button
            onClick={() => handleOAuthLogin('github')}
            className="flex items-center justify-start w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition duration-200"
            disabled={loading}
          >
            <FaGithub className="w-6 h-6 text-gray-800 dark:text-white" />
            <span className="ml-3 text-sm font-semibold">
              Sign in with GitHub
            </span>
          </button>
        </>
    </div>
  );
};

export default OAuth;
