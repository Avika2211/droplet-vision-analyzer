
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
      
      // Calculate pixel to mm conversion (assuming standard WSP card size)
      const cardWidth = 76; // mm
      const cardHeight = 26; // mm
      const pixelsPerMM = Math.min(canvas.width / cardWidth, canvas.height / cardHeight);
      
      // Convert to grayscale and detect droplets
      const droplets: DropletData[] = [];
      const visited = new Set<number>();
      const threshold = 128; // Adjusted threshold for better droplet detection
      
      // Calculate real area
      const analysedArea = (cardWidth * cardHeight) / 100; // convert to cm²
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          
          if (!visited.has(idx)) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            // Enhanced grayscale conversion using luminance weights
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            if (gray < threshold) {
              // Flood fill to find droplet
              const dropletPixels = floodFill(data, canvas.width, canvas.height, x, y, visited, threshold);
              
              if (dropletPixels.size > 4) { // Filter out noise
                // Convert pixel measurements to real-world units
                const areaMM2 = dropletPixels.size / (pixelsPerMM * pixelsPerMM);
                const diameterMM = Math.sqrt(areaMM2 * 4 / Math.PI);
                const diameterMicrons = diameterMM * 1000; // Convert to microns
                
                // Calculate spread factor correction
                const spreadFactor = 1.7; // Typical value for water on WSP
                const actualDiameter = diameterMicrons / spreadFactor;
                
                // Calculate volume in nL (assuming spherical droplets)
                const volume = (4/3) * Math.PI * Math.pow(actualDiameter/2000, 3) * 1e6;
                
                droplets.push({
                  diameter: actualDiameter,
                  area: areaMM2,
                  volume: volume
                });
              }
            }
          }
        }
      }
      
      // Calculate analysis results with improved accuracy
      const totalPixels = canvas.width * canvas.height;
      const coverage = (droplets.reduce((sum, d) => sum + d.area, 0) * 100) / analysedArea;
      
      const diameters = droplets.map(d => d.diameter).sort((a, b) => a - b);
      const volumes = droplets.map(d => d.volume).sort((a, b) => a - b);
      
      const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
      const driftVolume = volumes.filter((v, i) => diameters[i] < 150)
                                .reduce((sum, v) => sum + v, 0);
      
      // Calculate VMD (DV0.5) and other volume-based parameters
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
      
      // Calculate drift potential with improved accuracy
      const driftPotential = (driftVolume / totalVolume) * 100;
      
      // Calculate flow rate based on coverage and typical application parameters
      const applicationSpeed = 8; // km/h (typical ground speed)
      const swathWidth = 0.5; // meters (typical nozzle spacing)
      const flowRate = (coverage * applicationSpeed * swathWidth * 600) / 100; // L/ha
      
      resolve({
        coverage: Number(coverage.toFixed(2)),
        dropletCount: droplets.length,
        averageSize: Number((diameters.reduce((sum, d) => sum + d, 0) / diameters.length).toFixed(2)),
        nmd: Number(nmd.toFixed(2)),
        vmd01: Number(vmd01.toFixed(2)),
        vmd: Number(vmd.toFixed(2)),
        vmd09: Number(vmd09.toFixed(2)),
        relativeSpan: Number(relativeSpan.toFixed(2)),
        vmdNmdRatio: Number((vmd / nmd).toFixed(2)),
        biggestDroplet: Number(Math.max(...diameters).toFixed(2)),
        smallestDroplet: Number(Math.min(...diameters).toFixed(2)),
        flowRate: Number(flowRate.toFixed(2)),
        analysedArea: Number(analysedArea.toFixed(2)),
        driftPotential: Number(driftPotential.toFixed(2)),
        dropletsPerCm2: Number((droplets.length / analysedArea).toFixed(2))
      });
    };
    
    img.src = URL.createObjectURL(imageFile);
  });
};

// Enhanced flood fill algorithm with better threshold handling
function floodFill(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  visited: Set<number>,
  threshold: number
): Set<number> {
  const pixels = new Set<number>();
  const stack: [number, number][] = [[startX, startY]];
  const startIdx = (startY * width + startX) * 4;
  const startGray = (data[startIdx] + data[startIdx + 1] + data[startIdx + 2]) / 3;
  const tolerance = 20; // Threshold tolerance for color variation
  
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
    if (Math.abs(gray - startGray) > tolerance || gray >= threshold) {
      continue;
    }
    
    visited.add(idx);
    pixels.add(idx);
    
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  
  return pixels;
}
