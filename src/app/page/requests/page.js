"use client";

import { useState, useEffect } from "react";
import { Table, Button, Spinner } from "flowbite-react";
import { useSelector } from "react-redux"; // Assuming you are using Redux for user roles
import { HiClock, HiDocumentRemove, HiOutlineCheck } from "react-icons/hi";
import { toast } from "sonner"; // Assuming you are using toast notifications

export function Requests() {
  const [requests, setRequests] = useState([]); // To store fetched requests data
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error handling
  const [actionLoading, setActionLoading] = useState(false); // For request action state

  // Assuming role is stored in Redux (e.g., 'user', 'admin', 'superadmin')
  const role = useSelector((state) => state.user.currentUser.role);

  // Fetch requests on component mount
  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        const response = await fetch("/api/request", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.requests)) {
            setRequests(data.requests);
          } else {
            throw new Error("Invalid data format from API.");
          }
        } else {
          throw new Error(`Failed to fetch requests: ${response.statusText}`);
        }
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  // Handle Approve, Reject, Disable, or Toggle actions
  async function handleRequestAction(requestId, action) {
    try {
      setActionLoading(true);
      const response = await fetch("/api/request/adminrequest", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req._id === updatedRequest._id ? updatedRequest : req
          )
        );
        toast.success(`Request ${action}ed successfully.`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update request.");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred while updating the request.");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="overflow-x-auto mt-9 ml-1">
      {/* Loading or Error handling messages */}
      {loading && (
        <div className="flex justify-center items-center">
          <Spinner />
          <span>Loading...</span>
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}

      {/* Render data if requests are fetched */}
      {!loading && requests.length > 0 && (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Requested Date</Table.HeadCell>
            <Table.HeadCell>Request Type</Table.HeadCell>
            <Table.HeadCell>Requested By</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            {role === "superadmin" && <Table.HeadCell>Actions</Table.HeadCell>}
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
                  {/* Show status with icons */}
                  {request.status === "approved" ? (
                    <HiOutlineCheck className="h-6 w-6 text-green-500" />
                  ) : request.status === "rejected" ? (
                    <HiDocumentRemove className="h-6 w-6 text-red-500" />
                  ) : (
                    <HiClock className="h-6 w-6 text-yellow-500" />
                  )}
                </Table.Cell>
                {role === "superadmin" && (
                  <Table.Cell>
                    <div className="flex gap-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            color="success"
                            size="xs"
                            onClick={() =>
                              handleRequestAction(request._id, "approved")
                            }
                            disabled={actionLoading}
                          >
                            Approve
                          </Button>
                          <Button
                            color="failure"
                            size="xs"
                            onClick={() =>
                              handleRequestAction(request._id, "rejected")
                            }
                            disabled={actionLoading}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {request.status === "approved" && request.admin.isActive === true && (
                        <Button
                          color="warning"
                          size="xs"
                          onClick={() =>
                            handleRequestAction(request._id, "disable")
                          }
                          disabled={actionLoading}
                        >
                          Disable
                        </Button>
                      )}
                      {request.status === "approved" && request.admin.isActive === false && (
                        <Button
                          color="success"
                          size="xs"
                          onClick={() =>
                            handleRequestAction(request._id, "enable")
                          }
                          disabled={actionLoading}
                        >
                          Enable
                        </Button>
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
