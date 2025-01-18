"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { DashSideBar } from "../../component/DashSidebar";
import AdminRequestForm from "../adminrequest/page";
import { Requests } from "../requests/page";
import CreatePost from "../post/create/page";
import { toast, Toaster } from "sonner";
import { HiMenu, HiX } from "react-icons/hi";
import UpdatePost from "../post/update/page";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const currentUser = useSelector((state) => state.user?.currentUser || {});
  const [tab, setTab] = useState(""); // Track the current tab
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Control sidebar visibility

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Show a welcome toast when the user lands on the page
    toast.success(`Welcome back, ${currentUser.displayName || "User"}!`);
  }, [currentUser]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Toaster richColors position="top-center" />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white z-50 transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <button
          className="absolute top-4 right-4 text-xl text-white p-2 hover:bg-gray-700 rounded-full"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close Sidebar"
        >
          <HiX />
        </button>
        <DashSideBar />
      </div>

      {/* Toggle Button for Mobile */}
      <button
        className={`fixed top-4 left-4 z-50 text-xl p-2 rounded-full shadow-md transition-colors ${
          isSidebarOpen ? "bg-blue-500 text-white" : "bg-gray-800 text-white"
        } md:hidden`}
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? "Close Menu" : "Open Menu"}
      >
        {isSidebarOpen ? <HiX /> : <HiMenu />}
      </button>

      {/* Static Sidebar for Desktop */}
      <div className="hidden md:block md:w-56 bg-gray-800 text-white">
        <DashSideBar />
      </div>

      {/* Main Content */}
      <div className="flex-grow w-full p-6 ml-2 md:ml-0 mt-16 md:mt-0 rounded-lg shadow-md">
        {tab === "adminrequest" && <AdminRequestForm />}
        {tab === "requests" && <Requests />}
        {tab === "createpost" && <CreatePost />}
        {tab=== "updatepost" && <UpdatePost />}
        {!tab && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold">
              Welcome, {currentUser.displayName || "User"}!
            </h1>
            <p className="mt-2">Select a tab from the sidebar to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
