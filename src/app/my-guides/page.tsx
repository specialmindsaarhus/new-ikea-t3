import Link from "next/link";
import MyGuidesClient from "./MyGuidesClient";

export default function MyGuidesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Guides</h1>
      <MyGuidesClient />
      <Link
        href="/create-guide"
        className="mt-6 inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Create New Guide
      </Link>
    </div>
  );
}
