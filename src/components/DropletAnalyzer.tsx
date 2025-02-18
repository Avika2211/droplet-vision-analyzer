
import { useState } from "react";
import { ImageDropzone } from "./ImageDropzone";
import { AnalysisResults } from "./AnalysisResults";
import { motion } from "framer-motion";

export const DropletAnalyzer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    coverage: number;
    dropletCount: number;
    averageSize: number;
  } | null>(null);

  const handleImageUpload = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setAnalyzing(true);

    // Simulate analysis (replace with actual analysis logic)
    setTimeout(() => {
      setResults({
        coverage: 85,
        dropletCount: 250,
        averageSize: 120,
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="text-sm font-medium text-primary mb-2">Analysis Tool</div>
        <h1 className="text-4xl font-bold mb-4">Droplet Vision Analyzer</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Upload your water-sensitive paper image to analyze droplet distribution and coverage patterns.
        </p>
      </motion.div>

      <ImageDropzone onImageUpload={handleImageUpload} />

      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-sm border border-gray-100">
            <img src={image} alt="Uploaded WSP" className="w-full h-auto" />
            {analyzing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <div className="loading-spinner" />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {results && <AnalysisResults {...results} />}
    </div>
  );
};
