"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface StepsManagerProps {
  guideId: string;
}

export default function StepsManager({ guideId }: StepsManagerProps) {
  const { data: steps, isLoading } = api.guide.getSteps.useQuery({ guideId });

  if (isLoading) return <div>Loading steps...</div>;

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">Steps</h2>
      <ul className="space-y-4">
        {steps?.map((step) => (
          <li key={step.id} className="flex content-start space-x-2">
            <img src={step.imageUrl} alt="" srcset="" className="w-40" />
            <div className="!ml-6">
              <span>{step.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
