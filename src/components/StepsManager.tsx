"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { generateImage } from "~/app/actions/generateImage";

interface Step {
  id: string;
  orderNumber: number;
  description: string;
  imageUrl?: string | null;
}

interface StepsManagerProps {
  guideId: string;
}

export default function StepsManager({ guideId }: StepsManagerProps) {
  const [newStepDescription, setNewStepDescription] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const utils = api.useUtils();

  const { data: steps, isLoading } = api.guide.getSteps.useQuery({ guideId });

  const addStep = api.guide.addStep.useMutation({
    onSuccess: () => {
      utils.guide.getSteps.invalidate({ guideId });
      setNewStepDescription("");
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
    if (!newStepDescription.trim()) return;

    setIsGeneratingImage(true);
    try {
      const result = await addStep.mutateAsync({
        guideId,
        description: newStepDescription,
      });
      console.log("Step added:", result);
      if (!result.imageUrl) {
        console.warn("Step added without an image");
      }
    } catch (error) {
      console.error("Failed to add step:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleUpdateStep = async (
    step: Step,
    field: "description" | "imageUrl",
    value: string,
  ) => {
    const updatedStep = {
      ...step,
      [field]: value,
    };

    if (field === "description") {
      setIsGeneratingImage(true);
      try {
        const { imageUrl, error } = await generateImage(value);
        if (error) {
          console.error("Failed to generate image:", error);
          // You might want to show an error message to the user here
        }
        updatedStep.imageUrl = imageUrl || updatedStep.imageUrl;
      } catch (error) {
        console.error("Failed to generate image:", error);
      } finally {
        setIsGeneratingImage(false);
      }
    }

    await updateStep.mutateAsync({
      id: step.id,
      description: updatedStep.description,
      imageUrl: updatedStep.imageUrl || null,
    });
  };

  const handleDeleteStep = async (stepId: string) => {
    if (window.confirm("Are you sure you want to delete this step?")) {
      await deleteStep.mutateAsync({ id: stepId });
    }
  };

  const handleRegenerateImage = async (step: Step) => {
    setIsGeneratingImage(true);
    try {
      const { imageUrl, error } = await generateImage(step.description);
      if (error) {
        console.error("Failed to regenerate image:", error);
        // You might want to show an error message to the user here
        return;
      }
      await updateStep.mutateAsync({
        id: step.id,
        description: step.description,
        imageUrl: imageUrl || null,
      });
    } catch (error) {
      console.error("Failed to regenerate image:", error);
    } finally {
      setIsGeneratingImage(false);
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
            <div className="flex-grow space-y-2">
              <input
                type="text"
                value={step.description}
                onChange={(e) =>
                  handleUpdateStep(step, "description", e.target.value)
                }
                className="w-full rounded border p-2"
              />
              {step.imageUrl && (
                <img
                  src={step.imageUrl}
                  alt={step.description}
                  className="max-w-xs"
                />
              )}
              <button
                onClick={() => handleRegenerateImage(step)}
                className="rounded bg-green-500 px-2 py-1 text-white hover:bg-green-600"
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? "Regenerating..." : "Regenerate Image"}
              </button>
            </div>
            <button
              onClick={() => handleDeleteStep(step.id)}
              className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddStep} className="mt-4 space-y-2">
        <input
          type="text"
          value={newStepDescription}
          onChange={(e) => setNewStepDescription(e.target.value)}
          placeholder="New step description"
          className="w-full rounded border p-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          disabled={isGeneratingImage || addStep.isLoading}
        >
          {isGeneratingImage
            ? "Generating Image..."
            : addStep.isLoading
              ? "Adding Step..."
              : "Add Step"}
        </button>
      </form>
    </div>
  );
}
