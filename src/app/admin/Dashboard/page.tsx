//src\app\admin\Dashboard\page.tsx

"use client";

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
      <p className="mb-4">Total Registered Users: {totalUsers}</p>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1">Name</th>
            <th className="border p-1">Email</th>
            <th className="border p-1">Generated Code</th>
            <th className="border p-1">Winner</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id} className="text-center">
              <td className="border p-1">{user.name}</td>
              <td className="border p-1">{user.email}</td>
              <td className="border p-1">{user.generatedCode || "N/A"}</td>
              <td className="border p-1">
                {user.result}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
