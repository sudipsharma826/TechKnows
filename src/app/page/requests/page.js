
"use client";

import { Table } from "flowbite-react";

export function Requests() {

  //Import the Requests With UserId
  return (
    <div className="overflow-x-auto mt-9 ml-1">
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Requested Date</Table.HeadCell>
          <Table.HeadCell>Requested For</Table.HeadCell>
          <Table.HeadCell>Requested By</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Approved By</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
            <Table.Cell className="whitespace-nowrap font-medium dark:text-white">
            </Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell> 
            <Table.Cell></Table.Cell>
          </Table.Row>
          
        </Table.Body>
      </Table>
    </div>
  );
}
