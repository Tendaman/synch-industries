//src\components\Navbar.tsx

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-200 text-white p-4 flex justify-between">
      <div className="flex items-center gap-6 mt-2 mb-2 h-[50px]">
        {/* First Logo - Links to Synch Industries */}
        <span className="flex">
          <a target="_blank" rel="noopener noreferrer">
            <img src="/logo1.svg" alt="Logo 1" className="h-20 w-auto"/>
          </a>
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/admin/Dashboard" className="hover:underline text-lg text-black-200">Dashboard</Link>
        <Link href="/admin/GenCodepage" className="hover:underline text-lg text-black-200">Code Manager</Link>
        <Link href="/admin/Stats" className="hover:underline text-lg text-black-200">Stats</Link>
      </div>
    </nav>
  );
}
