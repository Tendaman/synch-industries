//src\app\admin\Dashboard\page.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
      setTotalUsers(data.length);
    }

    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <Card className="inline-block bg-gray-200 border-green-300">
        <div className="flex">
          <p className="m-2 text-lg">Total Registered Users: </p>
          <p className="m-2 mr-3 text-lg">{totalUsers}</p>
        </div>
      </Card>

      <Card className="mt-6 p4">
        <Table>
          <TableHeader>
            <TableRow >
              <TableHead className="border p-1 text-center">Name</TableHead>
              <TableHead className="border p-1 text-center">Email</TableHead>
              <TableHead className="border p-1 text-center">Generated Code</TableHead>
              <TableHead className="border p-1 text-center">Winner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id} className="text-center">
                <TableCell className="border p-1">{user.name}</TableCell>
                <TableCell className="border p-1">{user.email}</TableCell>
                <TableCell className="border p-1">{user.generatedCode || "N/A"}</TableCell>
                <TableCell className="border p-1">
                  {user.result}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
