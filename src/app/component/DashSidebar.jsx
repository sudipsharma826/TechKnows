"use client";

import { Badge, Sidebar } from 'flowbite-react';
import { HiShoppingBag, HiOutlinePlusCircle, HiDocumentText, HiViewGrid, HiClipboardList, HiPencil } from 'react-icons/hi';
import { FiEdit } from 'react-icons/fi';
import Link from 'next/link';
import { useSelector } from 'react-redux';

export function DashSideBar() {
  const currentUser = useSelector((state) => state.user?.currentUser || {});

  return (
    <Sidebar aria-label="Sidebar with logo branding example" className="w-full md:w-56">
      {/* Sidebar Logo */}
      <div className="px-4 py-2 flex items-center mt-8 sm:mt-0">
        <FiEdit className="h-6 w-6 text-blue-600" />
        <span className="ml-2 font-bold text-lg text-blue-600">TechKnows</span>
      </div>

      {/* Sidebar Items */}
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          {/* Superadmin Section */}
          {currentUser?.role === 'superadmin' && (
            <>
              <Sidebar.Item icon={HiViewGrid}>
                <Link href="/page/dashboard?tab=requests">Requests</Link>
              </Sidebar.Item>
              <Sidebar.Item icon={HiShoppingBag}>
                <Link href="/page/dashboard?tab=categories">Categories</Link>
              </Sidebar.Item>
              <Sidebar.Collapse icon={HiOutlinePlusCircle} label="Add">
                <Sidebar.Item icon={HiClipboardList}>
                  <Link href="/page/dashboard?tab=addcategories">Add Category</Link>
                </Sidebar.Item>
                <Sidebar.Item icon={HiPencil}>
                  <Link href="/page/dashboard?tab=createpost">Create Post</Link>
                </Sidebar.Item>
              </Sidebar.Collapse>
            </>
          )}

          {/* Admin and User Collapsible Section */}
          {['user', 'admin'].includes(currentUser?.role) && (
            <Sidebar.Collapse icon={HiShoppingBag} label="Requests">
              {/* User Request Section */}
              {currentUser?.role === 'user' && (
                <Sidebar.Item icon={HiOutlinePlusCircle}>
                  <Link href="/page/dashboard?tab=adminrequest">Request Admin</Link>
                </Sidebar.Item>
              )}

              {/* Admin Add Category Section */}
              {currentUser?.role === 'admin' && (
                <Sidebar.Item icon={HiOutlinePlusCircle}>
                  <Link href="/page/dashboard?tab=addrequestcategory">Add Category</Link>
                </Sidebar.Item>
              )}
            </Sidebar.Collapse>
          )}

          {/* Shared Section for Admin and Superadmin */}
          {['superadmin', 'admin'].includes(currentUser?.role) && (
            <>
              <Sidebar.Item icon={HiDocumentText}>
                <Link href="/page/dashboard?tab=getpost">Posts</Link>
              </Sidebar.Item>
            </>
          )}
        </Sidebar.ItemGroup>
      </Sidebar.Items>

      {/* Sidebar CTA Section */}
      <Sidebar.CTA>
        <div className="mb-3 flex items-center">
          <Badge color="warning">Developing</Badge>
          <button
            aria-label="Close"
            className="-m-1.5 ml-auto inline-flex h-6 w-6 rounded-lg bg-gray-100 p-1 text-cyan-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
            type="button"
          >
            <svg
              aria-hidden
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="mb-3 text-sm text-cyan-900 dark:text-gray-400">
          Development Going On, New Features Coming Soon
        </div>
        <a
          className="text-sm text-cyan-900 underline hover:text-cyan-800 dark:text-gray-400 dark:hover:text-gray-300"
          href="/"
        >
          Stay Tuned for Updates
        </a>
      </Sidebar.CTA>
    </Sidebar>
  );
}
