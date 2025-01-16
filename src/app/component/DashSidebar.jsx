'use client';

import { Sidebar } from 'flowbite-react';
import { HiAcademicCap,  HiInbox } from 'react-icons/hi';
import Link from 'next/link';

export function DashSideBar() {
  return (
    <Sidebar aria-label="Sidebar with logo branding example">
      {/* Sidebar Logo */}
      <Sidebar.Logo>
        <div className="px-4 py-2 flex items-center">
          <HiAcademicCap className="h-6 w-6 text-purple-600" />
          <span className="ml-2 font-bold text-lg">TechKnows</span>
        </div>
      </Sidebar.Logo>
      
      

      {/* Sidebar Items */}
      <Sidebar.Items>
        <Sidebar.ItemGroup>
        <Link href="/page/dashboard?tab=requests" passHref>
        <Sidebar.Item href="/page/dashboard?tab=requests" icon={HiInbox}>
        Requests
          </Sidebar.Item>
          </Link>
          <Link href="/page/dashboard?tab=adminrequest" passHref>
          <Sidebar.Item href="#" icon={HiAcademicCap}>
           Request Admin
          </Sidebar.Item>
          </Link>
          {/* You can add more sidebar links here for other pages */}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
