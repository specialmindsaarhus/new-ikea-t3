import Link from "next/link";
import MyGuidesClient from "./MyGuidesClient";

export default function MyGuidesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Guides</h1>
        <Link
          href="/create-guide"
          className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Create New Guide
        </Link>
      </div>
      <MyGuidesClient />
    </div>
  );
}
