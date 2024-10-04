"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import Link from "next/link";

export default function GuidePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: guide, isLoading, error } = api.guide.getById.useQuery({ id });

  if (isLoading) return <div>Loading guide...</div>;
  if (error) return <div>Error loading guide: {error.message}</div>;
  if (!guide) return <div>Guide not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/my-guides"
        className="mb-4 inline-block text-blue-500 hover:underline"
      >
        ← Back to My Guides
      </Link>
      <h1 className="mb-4 text-3xl font-bold">{guide.title}</h1>
      {guide.description && (
        <p className="mb-6 text-gray-600">{guide.description}</p>
      )}
      <p className="text-sm text-gray-500">
        Created at: {new Date(guide.createdAt).toLocaleDateString()}
      </p>
      {/* Add more guide details and steps here */}
    </div>
  );
}
