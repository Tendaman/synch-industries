//src\components\Navbar.tsx

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">Synch Industries</h1>
      <div className="space-x-4">
        <Link href="/admin/Dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/admin/GenCodepage" className="hover:underline">Generate Code</Link>
        <Link href="/admin/Stats" className="hover:underline">Stats</Link>
      </div>
    </nav>
  );
}
