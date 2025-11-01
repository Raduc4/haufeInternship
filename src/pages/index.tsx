import { useState } from "react";

import { Code2, Sparkles } from "lucide-react";
import { CodeSuggestion, FileNode } from "@/types/project";
import { FileTree } from "../components/FileTree";
import { CodeViewer } from "../components/CodeViewer";
import { useToast } from "../hooks/use-toase";
import { AIReviewPanel } from "../components/AIPreviewPanel";
import { flattenFiles, processFiles } from "../utils/fileProcessor";
import { FileUpload } from "../components/FileUpload";

const Index = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [projectName, setProjectName] = useState("");
  const { toast } = useToast();

  const handleFilesSelect = async (fileList: FileList) => {
    try {
      const processed = await processFiles(fileList);
      setFiles(processed);

      const firstFile = fileList[0];
      const pathParts = firstFile.webkitRelativePath.split("/");
      setProjectName(pathParts[0] || "Untitled Project");

      toast({
        title: "Project Loaded",
        description: `Successfully loaded ${flattenFiles(processed).length} files`,
      });
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process files",
      });
    }
  };

  const handleCodeSelect = (code: string) => {
    setSelectedCode(code);
    toast({
      title: "Code Selected",
      description: "Ready for targeted AI review",
    });
  };

  const handleReviewComplete = (suggestions: CodeSuggestion[]) => {
    console.log("Review complete:", suggestions);
  };

  if (files.length === 0) {
    return <FileUpload onFilesSelect={handleFilesSelect} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3">
        <Code2 className="w-6 h-6 text-primary" />
        <h1 className="text-lg font-semibold">{projectName}</h1>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>AI Code Review</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r border-border bg-sidebar-bg overflow-auto">
          <FileTree
            nodes={files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
          />
        </aside>

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {selectedFile ? (
              <>
                <CodeViewer file={selectedFile} onCodeSelect={handleCodeSelect} />
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <Code2 className="w-12 h-12 mx-auto opacity-50" />
                  <p>Select a file to view</p>
                </div>
              </div>
            )}
          </div>

          <aside className="w-96 border-l border-border bg-card overflow-hidden">
            <AIReviewPanel
              projectFiles={flattenFiles(files)}
              selectedCode={selectedCode}
              onReviewComplete={handleReviewComplete}
            />
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Index;