"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import Link from "next/link";
import EditGuideForm from "~/components/EditGuideForm";

export default function GuidePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const utils = api.useUtils();

  const {
    data: guide,
    isLoading,
    error,
    refetch,
  } = api.guide.getById.useQuery({ id }, { refetchInterval: 0 });

  const deleteGuide = api.guide.delete.useMutation({
    onSuccess: () => {
      // Invalidate the cache for the list of guides
      utils.guide.getAll.invalidate();
      router.push("/my-guides");
    },
  });

  if (isLoading) return <div>Loading guide...</div>;
  if (error) return <div>Error loading guide: {error.message}</div>;
  if (!guide) return <div>Guide not found</div>;

  const handleEditComplete = async () => {
    setIsEditing(false);
    await refetch();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this guide?")) {
      setIsDeleting(true);
      try {
        await deleteGuide.mutateAsync({ id });
      } catch (error) {
        console.error("Error deleting guide:", error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/my-guides"
        className="mb-4 inline-block text-blue-500 hover:underline"
      >
        ← Back to My Guides
      </Link>
      {isEditing ? (
        <EditGuideForm
          guide={guide}
          onCancel={() => setIsEditing(false)}
          onEditComplete={handleEditComplete}
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">{guide.title}</h1>
            <div>
              <button
                onClick={() => setIsEditing(true)}
                className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Edit Guide
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Guide"}
              </button>
            </div>
          </div>
          {guide.description && (
            <p className="mb-6 text-gray-600">{guide.description}</p>
          )}
          <p className="text-sm text-gray-500">
            Created at: {new Date(guide.createdAt).toLocaleDateString()}
          </p>
        </>
      )}
    </div>
  );
}
