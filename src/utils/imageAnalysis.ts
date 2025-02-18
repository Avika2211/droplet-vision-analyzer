
export interface DropletData {
  diameter: number;
  area: number;
  volume: number;
}

export const analyzeImage = async (imageFile: File): Promise<{
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
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Convert to grayscale and detect droplets
      const droplets: DropletData[] = [];
      const visited = new Set<number>();
      const threshold = 100; // Adjust based on WSP paper characteristics
      
      // Calculate real area (assuming standard WSP card size)
      const cardWidth = 76; // mm
      const cardHeight = 26; // mm
      const analysedArea = (cardWidth * cardHeight) / 100; // convert to cm²
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          
          if (!visited.has(idx)) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            // Convert to grayscale
            const gray = (r + g + b) / 3;
            
            if (gray < threshold) {
              // Flood fill to find droplet
              const dropletPixels = floodFill(data, canvas.width, canvas.height, x, y, visited);
              
              // Calculate droplet properties
              const diameter = Math.sqrt(dropletPixels.size * 4 / Math.PI);
              const area = dropletPixels.size;
              const volume = (4/3) * Math.PI * Math.pow(diameter/2, 3);
              
              droplets.push({ diameter, area, volume });
            }
          }
        }
      }
      
      // Calculate analysis results
      const totalPixels = canvas.width * canvas.height;
      const coverage = (droplets.reduce((sum, d) => sum + d.area, 0) / totalPixels) * 100;
      
      const diameters = droplets.map(d => d.diameter).sort((a, b) => a - b);
      const volumes = droplets.map(d => d.volume).sort((a, b) => a - b);
      
      const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
      const driftVolume = volumes.filter(v => {
        const diameter = Math.pow((v * 3)/(4 * Math.PI), 1/3) * 2;
        return diameter < 150;
      }).reduce((sum, v) => sum + v, 0);
      
      // Calculate VMD (DV0.5) - diameter where 50% of volume is in smaller droplets
      let volumeSum = 0;
      let vmd = 0;
      let vmd01 = 0;
      let vmd09 = 0;
      
      for (let i = 0; i < volumes.length; i++) {
        volumeSum += volumes[i];
        if (!vmd01 && volumeSum >= totalVolume * 0.1) vmd01 = diameters[i];
        if (!vmd && volumeSum >= totalVolume * 0.5) vmd = diameters[i];
        if (!vmd09 && volumeSum >= totalVolume * 0.9) vmd09 = diameters[i];
      }
      
      // Calculate NMD (number median diameter)
      const nmd = diameters[Math.floor(diameters.length / 2)];
      
      // Calculate relative span
      const relativeSpan = (vmd09 - vmd01) / vmd;
      
      // Calculate drift potential
      const driftPotential = (driftVolume / totalVolume) * 100;
      
      // Droplets per square centimeter
      const dropletsPerCm2 = droplets.length / analysedArea;
      
      resolve({
        coverage,
        dropletCount: droplets.length,
        averageSize: diameters.reduce((sum, d) => sum + d, 0) / diameters.length,
        nmd,
        vmd01,
        vmd,
        vmd09,
        relativeSpan,
        vmdNmdRatio: vmd / nmd,
        biggestDroplet: Math.max(...diameters),
        smallestDroplet: Math.min(...diameters),
        flowRate: coverage * 0.5, // This is an approximation, should be calibrated
        analysedArea,
        driftPotential,
        dropletsPerCm2
      });
    };
    
    img.src = URL.createObjectURL(imageFile);
  });
};

// Helper function for flood fill algorithm
function floodFill(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  visited: Set<number>
): Set<number> {
  const pixels = new Set<number>();
  const threshold = 100;
  const stack: [number, number][] = [[startX, startY]];
  
  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const idx = (y * width + x) * 4;
    
    if (
      x < 0 || x >= width || y < 0 || y >= height || 
      visited.has(idx)
    ) {
      continue;
    }
    
    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    if (gray >= threshold) {
      continue;
    }
    
    visited.add(idx);
    pixels.add(idx);
    
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  
  return pixels;
}
