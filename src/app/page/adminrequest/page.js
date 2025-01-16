'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Textarea, Card } from 'flowbite-react';
import { toast, Toaster } from 'sonner';
import AdSpaceContainer from '@/app/component/AdSense';
import { useRouter } from 'next/navigation';

export default function AdminRequestForm() {
  const { currentUser } = useSelector((state) => state.user);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page
    setLoading(true); // Start loading

    const requestData = {
      userId: currentUser._id,
      description,
      requestType: 'Admin',
    };

    try {
      const response = await fetch('/api/request/adminrequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setDescription(''); // Reset the description field after successful submission
        toast.success('Request sent successfully!', {
          duration: 5000,
          position: 'top-right',
        });

        // Use router.push() to navigate without a page refresh
        router.push('/dashboard?tab=request'); // Navigate to dashboard without refresh
      } else {
        toast.error('Failed to send request. Please try again.', {
          duration: 5000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Error sending request. Please try again.', {
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  const handleReset = () => {
    setDescription(''); // Reset the description field
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto p-6 space-y-36">
        <div className="flex items-center space-x-4">
          {console.log(currentUser.profilePicture)}
          {currentUser.profilePicture ? (
            <img
              src={currentUser.profilePicture}
              alt={currentUser.displayName}
              className="h-8 w-8 object-cover rounded-full"
            />
          ) : (
            <span className="text-white text-lg">{currentUser.displayName[0]}</span>
          )}
          <div>
            <h2 className="text-xl font-semibold">{currentUser.displayName}</h2>
            <p className="text-sm text-gray-500">ID: {currentUser._id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Why do you need admin control?
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please explain why you need admin access..."
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Processing your Request...' : 'Send Request'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>
      <AdSpaceContainer />
    </>
  );
}
