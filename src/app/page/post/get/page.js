"use client";

import { Button, Modal, Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';  // Importing the toast notification library

export default function GetPost() {
    const { currentUser } = useSelector((state) => state.user || {}); // Get current user from Redux store
    const [userPosts, setUserPosts] = useState([]); // State for storing user posts
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const [postIdToDelete, setPostIdToDelete] = useState(''); // State for the post to delete

    // Fetch posts based on the user's ID and role
    useEffect(() => {
        const fetchPosts = async () => {
            if (!currentUser) return; // Ensure the currentUser exists

            try {
                // Fetch posts from the API
                const response = await fetch(
                    `/api/post?userRole=${currentUser.role}&userId=${currentUser._id}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }

                const posts = await response.json();
                console.log('Posts:', posts);
                setUserPosts(posts); // Update state with the fetched posts
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, [currentUser]);

    // Handle post deletion
    const handleDeletePost = async () => {
        try {
            // Make a DELETE request to the API to delete the post
            const deletePost = await fetch(`/api/post/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postID: postIdToDelete, userID: currentUser._id }),
            });

            if (deletePost.ok) {
                toast.success('Post deleted successfully!');
                setShowModal(false);
                setUserPosts((prevPosts) =>
                    prevPosts.filter((post) => post._id !== postIdToDelete)
                );
                setPostIdToDelete(''); // Reset postIdToDelete
            } else {
                throw new Error('Failed to delete the post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Error deleting post.');
        }
    };

    return (
        <div className="mt-10 table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
            {userPosts.length > 0 ? (
                <Table hoverable className="shadow-md">
                    <Table.Head>
                        <Table.HeadCell>Date updated</Table.HeadCell>
                        <Table.HeadCell>Post image</Table.HeadCell>
                        <Table.HeadCell>Post title</Table.HeadCell>
                        <Table.HeadCell>Categories</Table.HeadCell>
                        <Table.HeadCell>Delete</Table.HeadCell>
                        <Table.HeadCell>Edit</Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                        {userPosts.map((post) => (
                            <Table.Row
                                className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                key={post._id}
                            >
                                <Table.Cell>
                                    {new Date(post.updatedAt).toLocaleDateString()}
                                </Table.Cell>
                                <Table.Cell>
                                    <Link href={`/post/${post.slug}`}>
                                        <img
                                            src={post.imageUrl || '/placeholder.png'}
                                            alt={post.title}
                                            className="w-20 h-10 object-cover bg-gray-500"
                                        />
                                    </Link>
                                </Table.Cell>
                                <Table.Cell>
                                    <Link
                                        className="font-medium text-gray-900 dark:text-white"
                                        href={`/post/${post.slug}`}
                                    >
                                        {post.title}
                                    </Link>
                                </Table.Cell>
                                <Table.Cell>
                                    {post.categories?.join(', ') || 'Uncategorized'}
                                </Table.Cell>
                                <Table.Cell>
                                    <span
                                        className="font-medium text-red-500 hover:underline cursor-pointer"
                                        onClick={() => {
                                            setShowModal(true);
                                            setPostIdToDelete(post._id);
                                        }}
                                    >
                                        Delete
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <Link
                                        className="text-teal-500 hover:underline"
                                        href={`/page/post/update/${post._id}`}
                                    >
                                        <span>Edit</span>
                                    </Link>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            ) : (
                <p>You have no posts yet!</p>
            )}

            {/* Confirmation Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
                        <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this post?
                        </h3>
                        <div className="flex justify-center gap-4">
                            <Button color="failure" onClick={handleDeletePost}>
                                Yes, I&apos;m sure
                            </Button>
                            <Button color="gray" onClick={() => setShowModal(false)}>
                                No, cancel
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
