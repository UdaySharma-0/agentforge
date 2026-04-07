import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import { useToast } from "../../components/ui/ToastProvider";

export default function ReviewAgent() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // abhi dummy data (STEP 24 me backend se aayega)
  const agent = {
    name: "Customer Support Bot",
    description: "Handles customer queries",
    purpose: "Answer FAQs and support questions",
    behavior: {
      tone: "friendly",
      language: "english",
      length: "medium",
    },
    knowledge: {
      website: "https://example.com",
      text: "",
    },
  };

  const handleSave = () => {
    console.log("Final Agent Data:", agent);
    showToast("Agent saved successfully.");
    navigate("/agents");
  };

  return (
    <div className="w-full">
      <h1 className="mb-6 text-2xl font-semibold text-[var(--color-text)]">
        Review & Save Agent
      </h1>

      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--color-text)]">
            <p>
              <span className="font-semibold">Name:</span> {agent.name}
            </p>
            <p>
              <span className="font-semibold">Description:</span> {agent.description}
            </p>
            <p>
              <span className="font-semibold">Purpose:</span> {agent.purpose}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Behavior</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--color-text)]">
            <p>
              <span className="font-semibold">Tone:</span> {agent.behavior.tone}
            </p>
            <p>
              <span className="font-semibold">Language:</span> {agent.behavior.language}
            </p>
            <p>
              <span className="font-semibold">Response Length:</span> {agent.behavior.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Knowledge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--color-text)]">
            {agent.knowledge.website ? (
              <p>
                <span className="font-semibold">Website:</span> {agent.knowledge.website}
              </p>
            ) : (
              <p className="text-[var(--color-muted)]">No website configured.</p>
            )}
            {agent.knowledge.text ? (
              <p>
                <span className="font-semibold">Manual Text:</span> Added
              </p>
            ) : (
              <p className="text-[var(--color-muted)]">No manual text added.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Agent</Button>
        </div>
      </div>
    </div>
  );
}
