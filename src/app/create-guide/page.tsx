import { CreateGuideForm } from "~/components/CreateGuideForm";

export default function CreateGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Create a New Guide</h1>
      <CreateGuideForm />
    </div>
  );
}
