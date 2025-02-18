
import { motion } from "framer-motion";

interface AnalysisResultsProps {
  coverage: number;
  dropletCount: number;
  averageSize: number;
}

export const AnalysisResults = ({ coverage, dropletCount, averageSize }: AnalysisResultsProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mx-auto mt-8"
    >
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="text-sm font-medium text-gray-500 mb-2">Coverage</div>
        <div className="text-3xl font-semibold">{coverage}%</div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="text-sm font-medium text-gray-500 mb-2">Droplet Count</div>
        <div className="text-3xl font-semibold">{dropletCount}</div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="text-sm font-medium text-gray-500 mb-2">Average Size</div>
        <div className="text-3xl font-semibold">{averageSize}μm</div>
      </div>
    </motion.div>
  );
};
