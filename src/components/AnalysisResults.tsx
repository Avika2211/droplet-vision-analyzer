
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AnalysisResultsProps {
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
}

export const AnalysisResults = (results: AnalysisResultsProps) => {
  // Helper function to format numbers to 2 decimal places
  const formatNumber = (num: number) => Number(num.toFixed(2));

  const generatePDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    
    doc.setFontSize(20);
    doc.text("DROPCHECK BY AGRITRONIIX INDIA", 20, 20);
    
    doc.setFontSize(12);
    doc.text("Analysis Report", 20, 30);
    doc.text(`Generated on: ${timestamp}`, 20, 40);
    
    const tableData = [
      ["Parameter", "Value"],
      ["Droplets/cm²", `${formatNumber(results.dropletsPerCm2)}`],
      ["Coverage (%)", `${formatNumber(results.coverage)}%`],
      ["NMD (µm)", `${formatNumber(results.nmd)}`],
      ["VMD01 (µm)", `${formatNumber(results.vmd01)}`],
      ["VMD (µm)", `${formatNumber(results.vmd)}`],
      ["VMD09 (µm)", `${formatNumber(results.vmd09)}`],
      ["Relative Span", `${formatNumber(results.relativeSpan)}`],
      ["VMD/NMD Ratio", `${formatNumber(results.vmdNmdRatio)}`],
      ["Biggest Droplet (µm)", `${formatNumber(results.biggestDroplet)}`],
      ["Smallest Droplet (µm)", `${formatNumber(results.smallestDroplet)}`],
      ["Flow Rate (L/ha)", `${formatNumber(results.flowRate)}`],
      ["Analysed Area (cm²)", `${formatNumber(results.analysedArea)}`],
      ["Drift Potential (%)", `${formatNumber(results.driftPotential)}`],
    ];

    autoTable(doc, {
      head: [tableData[0]],
      body: tableData.slice(1),
      startY: 50,
      theme: 'grid',
    });

    doc.setFontSize(10);
    doc.text("Contact:", 20, doc.internal.pageSize.height - 30);
    doc.text("Phone: +91 8383075398", 20, doc.internal.pageSize.height - 25);
    doc.text("Email: spray@agritroniix.in", 20, doc.internal.pageSize.height - 20);

    doc.save("dropcheck-analysis-report.pdf");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto mt-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#568eff] text-white rounded-lg p-6 shadow-sm">
          <div className="text-sm font-medium mb-2">Coverage</div>
          <div className="text-3xl font-semibold">{formatNumber(results.coverage)}%</div>
        </div>
        <div className="bg-[#cef00f] text-gray-800 rounded-lg p-6 shadow-sm">
          <div className="text-sm font-medium mb-2">Droplets/cm²</div>
          <div className="text-3xl font-semibold">{formatNumber(results.dropletsPerCm2)}</div>
        </div>
        <div className="bg-[#568eff] text-white rounded-lg p-6 shadow-sm">
          <div className="text-sm font-medium mb-2">Drift Potential</div>
          <div className="text-3xl font-semibold">{formatNumber(results.driftPotential)}%</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Detailed Analysis</h3>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#568eff] text-white rounded-lg hover:bg-[#568eff]/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500">NMD</div>
            <div className="text-lg font-semibold">{formatNumber(results.nmd)} µm</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500">VMD</div>
            <div className="text-lg font-semibold">{formatNumber(results.vmd)} µm</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500">VMD/NMD Ratio</div>
            <div className="text-lg font-semibold">{formatNumber(results.vmdNmdRatio)}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Relative Span</div>
            <div className="text-lg font-semibold">{formatNumber(results.relativeSpan)}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Flow Rate</div>
            <div className="text-lg font-semibold">{formatNumber(results.flowRate)} L/ha</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-500">Analysed Area</div>
            <div className="text-lg font-semibold">{formatNumber(results.analysedArea)} cm²</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
