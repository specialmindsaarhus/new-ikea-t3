"use client";

import { FC } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

const MyGuidesClient: FC = () => {
  const { data: guides, isLoading, error } = api.guide.getAll.useQuery();

  if (isLoading) return <div>Loading guides...</div>;
  if (error) return <div>Error loading guides: {error.message}</div>;

  return (
    <div>
      {guides && guides.length > 0 ? (
        <ul className="space-y-4">
          {guides.map((guide) => (
            <li key={guide.id} className="rounded-lg bg-white p-4 shadow">
              <Link
                href={`/guides/${guide.id}`}
                className="text-xl font-semibold text-blue-600 hover:underline"
              >
                {guide.title}
              </Link>
              {guide.description && (
                <p className="mt-2 text-gray-600">{guide.description}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Created at: {new Date(guide.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No guides found. Create your first guide!</p>
      )}
    </div>
  );
};

export default MyGuidesClient;
