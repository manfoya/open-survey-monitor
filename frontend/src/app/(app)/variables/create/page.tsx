import CreateVariableForm from "@/features/variables/components/create-variable-form/index";

export default function CreateVariablePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Créer une nouvelle variable</h1>
      <CreateVariableForm />
    </div>
  );
}