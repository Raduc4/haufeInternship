import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CodeSuggestion } from "@/types/project";
import { useToast } from "../hooks/use-toase";

interface AIReviewPanelProps {
  projectFiles: any[];
  selectedCode?: string;
  onReviewComplete: (suggestions: CodeSuggestion[]) => void;
}

const MODELS = [
  { value: "tinyllama-1.1b-chat-v1.0.Q4_K_M", label: "tinyllama-1.1b" },
  { value: "openai/gpt-5", label: "GPT-5" },
];

export const AIReviewPanel = ({
  projectFiles,
  selectedCode,
}: AIReviewPanelProps) => {
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);
  const [isReviewing, setIsReviewing] = useState(false);
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const { toast } = useToast();
  const [userMessage, setUserMessage] = useState("");


  const handleReview = async () => {
    setIsReviewing(true);
    setSuggestions([]);

    try {
      const codeToReview = selectedCode || JSON.stringify(projectFiles, null, 2);

      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Here is some code:\n\n${codeToReview}\n\nUser message:\n${userMessage}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      console.log("Data", data.text)

      // Handle both array or single suggestion formats
      setSuggestions(data.text)

      // const parsedSuggestions: CodeSuggestion[] = rawSuggestions.map((s: any) => ({
      //   id: crypto.randomUUID(),
      //   file: s.file || (s?.name ?? "unknown"),
      //   line: s.line ?? 0,
      //   type: s.type || "style",
      //   description: s.description || "No description provided",
      //   originalCode: s.originalCode || "",
      //   suggestedCode: s.suggestedCode || "",
      //   status: "pending",
      // }));

      // setSuggestions(parsedSuggestions);

      toast({
        title: "Review Complete",
        description: `Found suggestion`,
      });
    } catch (error: any) {
      console.error("Review error:", error);
      toast({
        variant: "destructive",
        title: "Review Failed",
        description: error.message || "Failed to complete code review",
      });
    } finally {
      setIsReviewing(false);
    }
  };


  // const handleSuggestionAction = (id: string, action: "accept" | "reject") => {
  //   setSuggestions((prev) =>
  //     prev.map((s) => (s.id === id ? { ...s, status: action === "accept" ? "accepted" : "rejected" } : s))
  //   );

  //   toast({
  //     title: action === "accept" ? "Suggestion Accepted" : "Suggestion Rejected",
  //     description: `The suggestion has been ${action}ed`,
  //   });
  // };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select AI Model
            </label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Add a message for the AI
            </label>
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="E.g., Focus on performance issues or check security vulnerabilities"
              className="w-full border rounded-md p-2 text-black text-sm resize-none"
              rows={3}
            />
          </div>

          <Button
            onClick={handleReview}
            disabled={isReviewing}
            className="w-full gap-2"
            size="lg"
          >
            {isReviewing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Code...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {selectedCode ? "Review Selection" : "Review Full Project"}
              </>
            )}
          </Button>

          {selectedCode && (
            <p className="text-xs text-muted-foreground text-center">
              Reviewing {selectedCode.split("\n").length} lines of selected code
            </p>
          )}
        </div>
      </Card>

      {/* <div className="flex-1 overflow-auto space-y-4">
        {suggestions.map((suggestion) => (
          <Card
            key={suggestion.id}
            className="p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${suggestion.type === "bug"
                        ? "bg-destructive/20 text-destructive"
                        : suggestion.type === "security"
                          ? "bg-destructive/20 text-destructive"
                          : suggestion.type === "performance"
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-secondary-foreground"
                      }`}
                  >
                    {suggestion.type}
                  </span>
                  {suggestion.status !== "pending" && (
                    <span
                      className={`text-xs font-medium ${suggestion.status === "accepted"
                          ? "text-green-500"
                          : "text-destructive"
                        }`}
                    >
                      {suggestion.status}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-2">{suggestion.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {suggestion.file} • Line {suggestion.line}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium mb-1 text-muted-foreground">
                  Current:
                </p>
                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: "0.5rem",
                    fontSize: "0.75rem",
                    borderRadius: "0.375rem",
                  }}
                >
                  {suggestion.originalCode}
                </SyntaxHighlighter>
              </div>

              <div>
                <p className="text-xs font-medium mb-1 text-muted-foreground">
                  Suggested:
                </p>
                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: "0.5rem",
                    fontSize: "0.75rem",
                    borderRadius: "0.375rem",
                  }}
                >
                  {suggestion.suggestedCode}
                </SyntaxHighlighter>
              </div>
            </div>

            {suggestion.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSuggestionAction(suggestion.id, "accept")}
                  className="flex-1 gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleSuggestionAction(suggestion.id, "reject")}
                  className="flex-1 gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div> */}

      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col p-4 space-y-3">
          <div className="text-xs font-medium mb-1 text-muted-foreground">
            Suggested:
          </div>

          <div className="flex-1 overflow-y-auto rounded-md border border-border">
            <SyntaxHighlighter
              wrapLongLines
              language="typescript"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "0.75rem",
                fontSize: "0.75rem",
                minHeight: "100%",
              }}
            >
              {suggestions as any}
            </SyntaxHighlighter>
          </div>
        </Card>
      </div>

    </div>
  );
};
