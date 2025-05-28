import React, { useEffect, useRef, useState } from "react";
import { Upload, X, File, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageDocument } from "@/types/chat";
import { removeDocument, uploadDocument } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onClose: () => void;
  onFileUpload: (file: MessageDocument) => void;
  onFileRemove: (documentId: string) => void;
  initialFiles?: MessageDocument[];
  sessionId: string | null;
}

const FILE_SIZE_LIMIT = 10485760;

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

interface FileCardProps {
  onRemove?: () => void;
  file: { sizeText: string; name: String; isOverSize?: boolean };
}

const FileCard: React.FC<FileCardProps> = ({ file, onRemove }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
        file.isOverSize ? "border-2 border-red-600" : ""
      }`}
    >
      <div className="flex items-center space-x-3">
        <File className="h-5 w-5 text-gray-500" />
        <div>
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">{file.sizeText}</p>
        </div>
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove()}
          className="text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onClose,
  onFileUpload,
  onFileRemove,
  sessionId = "",
  initialFiles = [],
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<MessageDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setUploadedFiles(initialFiles);
  }, [setUploadedFiles, initialFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(
      (file) => file.type === "application/pdf" || file.type === "text/plain"
    );

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    if (uploading) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploadedFile = async (documentId: string) => {
    if (uploading) return;
    setUploadedFiles((prev) => prev.filter((file) => file.id !== documentId));
    await removeDocument(documentId);
    onFileRemove(documentId);
  };

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return;

    setUploading(true);
    setUploadProgress(0);

    const updatedFiles = [...files]; // copy to mutate safely

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];

      try {
        const sizeText = formatFileSize(file.size);

        const response = await uploadDocument({
          file,
          sessionId: sessionId || "",
          fileInfo: {
            sizeText,
            name: file.name,
            type: file.type,
          },
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setFiles((prev) => prev.filter((f) => f !== file));
        const uploadedFile = {
          sizeText,
          id: response.documentId,
          name: file.name,
          type: file.type,
        };

        setUploadedFiles((prev) => [
          ...prev,
          { ...uploadedFile, size: file.size },
        ]);
        onFileUpload(uploadedFile);
        const progress = Math.round(((i + 1) / files.length) * 100);
        setUploadProgress(progress);
      } catch (error: any) {
        console.error("Error uploading file:", error.message);
        toast({
          title: "Error in uploading files",
          description: `Failed to upload "${file.name}": ${error.message}`,
        });
        setUploading(false);
        return;
      }
    }

    await new Promise(() => setTimeout(onClose, 1000));
    setUploading(false);
  };

  const hasOverSizedFile = files.some((file) => file.size > FILE_SIZE_LIMIT);
  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Upload Documents
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop your documents here
        </p>
        <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
        <input
          type="file"
          multiple
          accept=".pdf,.txt"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          ref={fileInputRef}
        />
        <label htmlFor="file-upload">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Files
          </Button>
        </label>
        <p className="text-xs text-gray-400 mt-2">
          Supported formats: PDF, TXT (Max {formatFileSize(FILE_SIZE_LIMIT)}
          each)
        </p>
      </div>

      {/* File List */}
      {(files.length > 0 || uploadedFiles.length > 0) && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <FileCard
                key={index}
                file={{
                  ...file,
                  isOverSize: file.size > FILE_SIZE_LIMIT,
                  sizeText: formatFileSize(file.size),
                }}
                onRemove={() => removeSelectedFile(index)}
              />
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            {uploadedFiles.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                onRemove={() => removeUploadedFile(file.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">
              Uploading...
            </span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading || hasOverSizedFile}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Upload {files.length} File{files.length !== 1 ? "s" : ""}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
