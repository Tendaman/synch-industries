// src\app\admin\Dashboard\components\download.tsx

"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { writeFile, utils } from "xlsx";

async function downloadUserData() {
  try {
    const res = await fetch("/api/users?download=true");
    const users = await res.json();

    if (!res.ok) {
      throw new Error(users.message || "Failed to fetch user data");
    }

    const worksheet = utils.json_to_sheet(users);

    // Auto-adjust column widths based on content
    const colWidths = users.length
      ? Object.keys(users[0]).map((key) => ({
          wch: Math.max(
            key.length,
            ...users.map((user: any) => String(user[key]).length)
          ),
        }))
      : [];

    worksheet["!cols"] = colWidths;

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Users");

    writeFile(workbook, "users_data.xlsx");
  } catch (error) {
    console.error("Error downloading user data:", error);
  }
}

export default function DownloadButton() {
  return (
    <Button
      title="Download"
      onClick={downloadUserData}
      className="bg-black hover:bg-gray-800 rounded-xl border border-purple-600"
    >
      <DownloadIcon size={24} />
    </Button>
  );
}
