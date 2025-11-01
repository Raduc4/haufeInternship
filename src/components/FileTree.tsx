// components/FileTree.tsx
import React from "react";
import { FileNode } from "@/types/project";
import { Folder, File } from "lucide-react";

interface FileTreeProps {
  nodes: FileNode[];
  selectedFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  selectedFile,
  onFileSelect,
}) => {
  const renderNode = (node: FileNode) => {
    if (node.type === "folder") {
      return (
        <details key={node.name} open className="ml-2">
          <summary className="flex items-center gap-2 cursor-pointer">
            <Folder className="w-4 h-4 text-yellow-500" />
            {node.name}
          </summary>
          <div className="ml-4">{node.children?.map(renderNode)}</div>
        </details>
      );
    }

    return (
      <div
        key={node.name}
        className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-muted ${selectedFile?.name === node.name ? "bg-muted text-primary" : ""
          }`}
        onClick={() => onFileSelect(node)}
      >
        <File className="w-4 h-4 text-blue-500" />
        {node.name}
      </div>
    );
  };

  return <div className="p-2">{nodes.map(renderNode)}</div>;
};
