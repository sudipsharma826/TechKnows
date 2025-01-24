"use client";

import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "flowbite-react";
import { useSelector } from "react-redux";
import { HiClock, HiDocumentRemove, HiOutlineCheck } from "react-icons/hi";
import { toast } from "sonner";

export function Requests() {
  const [requests, setRequests] = useState([]); // Store fetched requests
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [actionLoading, setActionLoading] = useState(null); // Loading state for specific actions
  const [refreshKey, setRefreshKey] = useState(0); // Triggers data re-fetch

  const currentUser = useSelector((state) => state.user?.currentUser || {});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/request", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          setRequests(data.requests || []);
        } else {
          throw new Error(`Failed to fetch requests: ${response.statusText}`);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [refreshKey]);

  const handleRequestAction = async (requestId, action, requestType) => {
    try {
      setActionLoading(requestId); // Indicate loading for this request

      const apiMap = {
        Admin: "/api/request/adminrequest",
        Category: "/api/request/categoryrequest",
      };

      const apiUrl = apiMap[requestType];
      if (!apiUrl) throw new Error("Invalid request type");

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setRequests((prev) =>
          prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
        );
        setRefreshKey((prev) => prev + 1);
        toast.success(`Request ${action}ed successfully.`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update request.");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred while updating the request.");
      console.error("Error updating request:", err);
    } finally {
      setActionLoading(null); // Reset loading state
    }
  };

  return (
    <div className="overflow-x-auto md:mt-10">
      {/* Loading and error handling */}
      {loading && (
        <div className="flex justify-center items-center">
          <Spinner />
          <span>Loading...</span>
        </div>
      )}

      {error && <div className="text-red-500 text-center">{error}</div>}

      {/* Render requests table */}
      {!loading && requests.length > 0 && (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Requested Date</Table.HeadCell>
            <Table.HeadCell>Request Type</Table.HeadCell>
            <Table.HeadCell>Requested By</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            {currentUser.role === "superadmin" && <Table.HeadCell>Actions</Table.HeadCell>}
          </Table.Head>
          <Table.Body className="divide-y">
            {requests.map((request) => (
              <Table.Row
                key={request._id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell className="whitespace-nowrap font-medium dark:text-white">
                  {new Date(request.requestedDate).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>{request.requestType || "N/A"}</Table.Cell>
                <Table.Cell>{request.userName || "Unknown User"}</Table.Cell>
                <Table.Cell>
                  {request.status === "approved" ? (
                    <HiOutlineCheck className="h-6 w-6 text-green-500" />
                  ) : request.status === "rejected" ? (
                    <HiDocumentRemove className="h-6 w-6 text-red-500" />
                  ) : (
                    <HiClock className="h-6 w-6 text-yellow-500" />
                  )}
                </Table.Cell>
                {currentUser.role === "superadmin" && (
                  <Table.Cell>
                    <div className="flex gap-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            color="success"
                            size="xs"
                            onClick={() =>
                              handleRequestAction(request._id, "approved", request.requestType)
                            }
                            disabled={actionLoading === request._id}
                          >
                            {actionLoading === request._id ? <Spinner size="xs" /> : "Approve"}
                          </Button>
                          <Button
                            color="failure"
                            size="xs"
                            onClick={() =>
                              handleRequestAction(request._id, "rejected", request.requestType)
                            }
                            disabled={actionLoading === request._id}
                          >
                            {actionLoading === request._id ? <Spinner size="xs" /> : "Reject"}
                          </Button>
                        </>
                      )}
                    </div>
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {/* Show message when no requests are found */}
      {!loading && requests.length === 0 && <div>No requests found.</div>}
    </div>
  );
}
