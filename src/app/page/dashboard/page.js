"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // Updated import
import { useSelector } from "react-redux";
import { DashSideBar } from "../../component/DashSidebar";
import AdminRequestForm from "../adminrequest/page";
import {Requests } from "../requests/page";

export default function Dashboard() {
  const searchParams = useSearchParams(); // Use for query parameters
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState(""); // Track the current tab

  useEffect(() => {
    const tabParam = searchParams.get("tab"); // Get 'tab' query parameter
    if (tabParam) {
      setTab(tabParam);
    }
  }, [searchParams]);

  console.log("Current tab",tab); // Debugging tab value

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        {/* Sidebar remains static */}
        <DashSideBar />
      </div>
      <div className="w-full p-6 ml-2">
        {/* Dynamically render the page based on the current 'tab' query */}
        {tab === "adminrequest" && <AdminRequestForm />}
        {tab === "requests" && <Requests />}

      </div>
    </div>
  );
}
