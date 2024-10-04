"use client";

import { FC } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";

const MyGuidesClient: FC = () => {
  const {
    data: guides,
    isLoading,
    error,
  } = api.guide.getAll.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <div>Loading guides...</div>;
  if (error) return <div>Error loading guides: {error.message}</div>;

  return (
    <div>
      {guides && guides.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="overflow-hidden rounded-lg bg-white shadow-md"
            >
              <Link
                href={`/guides/${guide.id}`}
                className="block p-4 transition duration-150 ease-in-out hover:bg-gray-50"
              >
                <h2 className="mb-2 truncate text-xl font-semibold text-blue-600">
                  {guide.title}
                </h2>
                {guide.description && (
                  <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                    {guide.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Created: {new Date(guide.createdAt).toLocaleDateString()}
                </p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No guides found. Create your first guide!
        </p>
      )}
    </div>
  );
};

export default MyGuidesClient;
