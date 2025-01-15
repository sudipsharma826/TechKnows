"use client";
import { SignIn, useUser } from '@clerk/nextjs';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../lib/slices/userSlice';  // Update the path if necessary
import { useEffect } from 'react';

export default function SignInPage() {
  const { user } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      // Dispatch the setUser action to store user data in Redux
      dispatch(setUser(user));
    }
  }, [user, dispatch]);

  return (
    <div className='flex items-center justify-center p-3'>
      <SignIn />
    </div>
  );
}
