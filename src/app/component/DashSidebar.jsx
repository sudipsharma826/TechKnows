'use client';

import { Sidebar } from 'flowbite-react';
import { HiAcademicCap, HiInbox, HiPencil, HiPencilAlt } from 'react-icons/hi';
import Link from 'next/link';
import { FiEdit } from 'react-icons/fi';
import { useSelector } from 'react-redux';

export function DashSideBar() {
  const currentUser = useSelector((state) => state.user?.currentUser || {});

  return (
    <Sidebar aria-label="Sidebar with logo branding example" className='w-full md:w-56'>
      {/* Sidebar Logo */}
      <div className="px-4 py-2 flex items-center mt-10">
        <FiEdit className="h-6 w-6 text-blue-600" />
        <span className="ml-2 font-bold text-lg text-blue-600">TechKnows</span>
      </div>

      {/* Sidebar Items */}
      <Sidebar.Items>
        <Sidebar.ItemGroup className='flex flex-col gap-1'>
          {/* Superadmin Sidebar Item */}
          {currentUser?.role === 'superadmin' && (
            <>
            <Link href="/page/dashboard?tab=requests" passHref>
              <Sidebar.Item icon={HiInbox}>Requests</Sidebar.Item>
            </Link>
            </>
          )}

          {/* Admin and User Sidebar Item */}
          {['user'].includes(currentUser?.role) && (
            <>
            <Link href="/page/dashboard?tab=adminrequest" passHref>
              <Sidebar.Item icon={HiAcademicCap}>Request Admin</Sidebar.Item>
            </Link>
            
          </>
          )}

          {/* Superadmin and Admin Sidebar  */}
          {['superadmin', 'admin'].includes(currentUser?.role) && (
            <>
            <Link href="/page/dashboard?tab=createpost" passHref>
              <Sidebar.Item icon={HiPencilAlt}>Create Post</Sidebar.Item>
            </Link>
            </>
          )}
          
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
