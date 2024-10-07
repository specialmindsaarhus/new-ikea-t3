"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface Step {
  id: string;
  orderNumber: number;
  description: string;
  imageUrl?: string;
}

interface StepsManagerProps {
  guideId: string;
}

export default function StepsManager({ guideId }: StepsManagerProps) {
  const [newStepDescription, setNewStepDescription] = useState("");
  const [newStepImageUrl, setNewStepImageUrl] = useState("");
  const utils = api.useUtils();

  const { data: steps, isLoading } = api.guide.getSteps.useQuery({ guideId });

  const addStep = api.guide.addStep.useMutation({
    onSuccess: () => {
      utils.guide.getSteps.invalidate({ guideId });
      setNewStepDescription("");
      setNewStepImageUrl("");
    },
  });

  const updateStep = api.guide.updateStep.useMutation({
    onSuccess: () => utils.guide.getSteps.invalidate({ guideId }),
  });

  const deleteStep = api.guide.deleteStep.useMutation({
    onSuccess: () => utils.guide.getSteps.invalidate({ guideId }),
  });

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStepDescription.trim()) {
      await addStep.mutateAsync({
        guideId,
        description: newStepDescription.trim(),
        imageUrl: newStepImageUrl.trim() || undefined,
      });
    }
  };

  const handleUpdateStep = async (
    step: Step,
    newDescription: string,
    newImageUrl: string,
  ) => {
    await updateStep.mutateAsync({
      id: step.id,
      description: newDescription,
      imageUrl: newImageUrl || undefined,
    });
  };

  const handleDeleteStep = async (stepId: string) => {
    if (window.confirm("Are you sure you want to delete this step?")) {
      await deleteStep.mutateAsync({ id: stepId });
    }
  };

  if (isLoading) return <div>Loading steps...</div>;

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">Steps</h2>
      <ul className="space-y-4">
        {steps?.map((step) => (
          <li key={step.id} className="flex items-center space-x-2">
            <span className="font-bold">{step.orderNumber}.</span>
            <input
              type="text"
              value={step.description}
              onChange={(e) =>
                handleUpdateStep(step, e.target.value, step.imageUrl || "")
              }
              className="flex-grow rounded border p-2"
            />

            <button
              onClick={() => handleDeleteStep(step.id)}
              className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddStep} className="mt-4 flex space-x-2">
        <input
          type="text"
          value={newStepDescription}
          onChange={(e) => setNewStepDescription(e.target.value)}
          placeholder="New step description"
          className="flex-grow rounded border p-2"
        />

        <input
          type="text"
          value={newStepImageUrl}
          onChange={(e) => setNewStepImageUrl(e.target.value)}
          placeholder="Image URL"
          className="flex-grow rounded border p-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Add Step
        </button>
      </form>
    </div>
  );
}
