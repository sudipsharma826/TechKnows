'use client';

import { useEffect, useState } from 'react';
import { Spinner, Table } from 'flowbite-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { FaCheck, FaTimes, FaClock } from 'react-icons/fa';

export default function PaymentTable() {
  const currentUser = useSelector((state) => state.user?.currentUser || {});
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?._id) {
      toast.error("User not found");
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        const response = await fetch(`/api/payment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser._id }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }

        const data = await response.json();

        setPayments(data?.data || []);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to fetch payments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Spinner className="mx-auto" />
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <FaCheck className="text-green-500" />;
      case 'Pending':
        return <FaClock className="text-yellow-500" />;
      case 'Rejected':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4 mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">Payment History</h1>

      <Table hoverable={true} className="shadow-lg rounded-lg">
        <Table.Head>
          <Table.HeadCell>User Name</Table.HeadCell>
          <Table.HeadCell>Payment Date</Table.HeadCell>
          <Table.HeadCell>Payment Method</Table.HeadCell>
          <Table.HeadCell>Package Name</Table.HeadCell>
          <Table.HeadCell>Expiry Date</Table.HeadCell>
          <Table.HeadCell>Amount (Rs)</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {payments?.map((payment) => (
            <Table.Row key={payment._id} className="hover:bg-gray-100">
              <Table.Cell>{payment.userId?.displayName || 'N/A'}</Table.Cell>
              <Table.Cell>{new Date(payment.createdAt).toLocaleDateString()}</Table.Cell>
              <Table.Cell>{payment.paymentMethod}</Table.Cell>
              <Table.Cell>{payment.packageId?.name || 'N/A'}</Table.Cell>
              <Table.Cell>{
                payment.packageId?.expiryTime
                  ? `${payment.packageId.expiryTime} days`
                  : 'N/A'
              }</Table.Cell>
              <Table.Cell className="font-semibold">{payment.amount}</Table.Cell>
              <Table.Cell>{getStatusIcon(payment.status)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
