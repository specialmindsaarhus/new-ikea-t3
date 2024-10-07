"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface EditGuideFormProps {
  guide: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
  };
  onCancel: () => void;
  onEditComplete: () => void;
}

export default function EditGuideForm({
  guide,
  onCancel,
  onEditComplete,
}: EditGuideFormProps) {
  const [title, setTitle] = useState(guide.title);
  const [description, setDescription] = useState(guide.description || "");
  const [imageUrl, setImageUrl] = useState(guide.imageUrl || "");

  const utils = api.useUtils();

  const updateGuide = api.guide.update.useMutation({
    onSuccess: () => {
      utils.guide.getById.invalidate({ id: guide.id });
      utils.guide.getAll.invalidate();
      onEditComplete();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGuide.mutateAsync({
        id: guide.id,
        title,
        description,
        imageUrl,
      });
    } catch (error) {
      console.error("Error updating guide:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        ></textarea>
      </div>
      <div>
        <label
          htmlFor="imageUrl"
          className="block text-sm font-medium text-gray-700"
        >
          Image URL
        </label>
        <input
          type="text"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          disabled={updateGuide.isPending}
        >
          {updateGuide.isPending ? "Updating..." : "Update Guide"}
        </button>
      </div>
    </form>
  );
}
