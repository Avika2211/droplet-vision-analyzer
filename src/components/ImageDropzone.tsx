
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface ImageDropzoneProps {
  onImageUpload: (file: File) => void;
}

export const ImageDropzone = ({ onImageUpload }: ImageDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith("image/")) {
        onImageUpload(file);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Please upload an image file");
      }
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`
        w-full max-w-2xl mx-auto p-8 rounded-lg border-2 border-dashed
        transition-all duration-200 ease-in-out
        ${isDragging 
          ? "border-primary bg-primary/5 scale-[1.02]" 
          : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"}
        cursor-pointer animate-fadeIn
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <Upload className={`w-12 h-12 ${isDragging ? "text-primary" : "text-gray-400"}`} />
        <div className="text-center">
          <p className="text-lg font-medium mb-1">
            Drop your image here, or <span className="text-primary">browse</span>
          </p>
          <p className="text-sm text-gray-500">Supports PNG, JPG or JPEG files</p>
        </div>
      </div>
    </div>
  );
};
