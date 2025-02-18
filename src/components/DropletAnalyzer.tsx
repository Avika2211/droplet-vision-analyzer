
import { useState } from "react";
import { ImageDropzone } from "./ImageDropzone";
import { AnalysisResults } from "./AnalysisResults";
import { motion } from "framer-motion";
import { analyzeImage } from "@/utils/imageAnalysis";
import { toast } from "sonner";

export const DropletAnalyzer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    coverage: number;
    dropletCount: number;
    averageSize: number;
    nmd: number;
    vmd01: number;
    vmd: number;
    vmd09: number;
    relativeSpan: number;
    vmdNmdRatio: number;
    biggestDroplet: number;
    smallestDroplet: number;
    flowRate: number;
    analysedArea: number;
    driftPotential: number;
    dropletsPerCm2: number;
  } | null>(null);

  const handleImageUpload = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setAnalyzing(true);

    try {
      const analysisResults = await analyzeImage(file);
      setResults(analysisResults);
      toast.success("Analysis completed successfully");
    } catch (error) {
      toast.error("Error analyzing image");
      console.error("Analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 text-[#568eff]">DROPCHECK BY AGRITRONIIX INDIA</h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-4">
          Upload your water-sensitive paper image to analyze droplet distribution and coverage patterns.
        </p>
        <div className="text-sm text-gray-500">
          Contact: <a href="tel:+918383075398" className="text-[#568eff]">+91 8383075398</a> | 
          <a href="mailto:spray@agritroniix.in" className="text-[#568eff] ml-1">spray@agritroniix.in</a>
        </div>
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
