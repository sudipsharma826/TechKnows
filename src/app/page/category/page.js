'use client';

import { useEffect, useState } from 'react';
import { Spinner, Table } from 'flowbite-react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch category data from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/request/categoryrequest', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Spinner className="mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>

      {/* Category Table */}
      <Table hoverable={true}>
        <Table.Head>
          <Table.HeadCell>Category Name</Table.HeadCell>
          <Table.HeadCell>Image</Table.HeadCell>
          <Table.HeadCell>Post Count</Table.HeadCell>
          <Table.HeadCell>Created Date</Table.HeadCell>
          <Table.HeadCell>Is Approved</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {categories?.map((category) => (
            <Table.Row key={category.name}>
              <Table.Cell>{category.name}</Table.Cell>
              <Table.Cell>
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-12 w-12 object-cover"
                />
              </Table.Cell>
              <Table.Cell>{category.postCount}</Table.Cell>
              <Table.Cell>{new Date(category.createdAt).toLocaleDateString()}</Table.Cell>
              <Table.Cell>
                {category.isApproved ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  <FaTimes className="text-red-500" />
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
