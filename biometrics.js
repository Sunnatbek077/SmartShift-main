// ============================================================
// EduAI Platform — Biometrics Helper (Yuz va Ovoz Tahlili)
// ============================================================

// 1. Skin detection formula to identify face pixels in RGB
export function isSkinPixel(r, g, b) {
  return (
    r > 95 && g > 40 && b > 20 &&
    (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
    Math.abs(r - g) > 15 && r > g && r > b
  );
}

// 2. Extract face signature and bounding box from canvas containing video frame
export function extractFaceSignature(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { success: false, error: "Canvas context not found" };

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let minX = width, maxX = 0, minY = height, maxY = 0;
  let skinPixelCount = 0;
  let sumX = 0, sumY = 0;

  // Scan pixels (step 2 for speed)
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (isSkinPixel(r, g, b)) {
        skinPixelCount++;
        sumX += x;
        sumY += y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const totalScanned = (width * height) / 4;
  const skinRatio = skinPixelCount / totalScanned;

  // Face must occupy a reasonable portion of the screen (at least 2%)
  if (skinRatio < 0.02 || skinPixelCount < 100) {
    return { success: false, error: "Yuz aniqlanmadi. Kameraga yaqinroq va to'g'ri boqing." };
  }

  // Padding around skin bounding box
  const pad = 10;
  minX = Math.max(0, minX - pad);
  maxX = Math.min(width, maxX + pad);
  minY = Math.max(0, minY - pad);
  maxY = Math.min(height, maxY + pad);

  const faceW = maxX - minX;
  const faceH = maxY - minY;

  // Face aspect ratio check (typically face height is 1.1x to 1.6x of width)
  const aspect = faceH / Math.max(faceW, 1);
  if (aspect < 0.6 || aspect > 2.2) {
    return { success: false, error: "Yuz konturi mos kelmadi. Yaxshiroq yoritilgan joyda urinib ko'ring." };
  }

  // Calculate rough eye and mouth coordinates from the bounding box
  const centerX = minX + faceW / 2;
  const centerY = minY + faceH / 2;
  
  // Landmark estimations:
  const leftEye = { x: Math.round(minX + faceW * 0.35), y: Math.round(minY + faceH * 0.4) };
  const rightEye = { x: Math.round(minX + faceW * 0.65), y: Math.round(minY + faceH * 0.4) };
  const mouth = { x: Math.round(centerX), y: Math.round(minY + faceH * 0.75) };

  // Generate 8x8 normalized grayscale grid embedding from face bounding box
  // Create a temporary canvas to resize the cropped face to 8x8
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 8;
  tempCanvas.height = 8;
  const tempCtx = tempCanvas.getContext("2d");
  
  if (tempCtx) {
    // Crop face and draw it to 8x8 canvas
    tempCtx.drawImage(canvas, minX, minY, faceW, faceH, 0, 0, 8, 8);
    const faceData = tempCtx.getImageData(0, 0, 8, 8).data;
    const grayscale = [];
    
    let sum = 0;
    for (let i = 0; i < faceData.length; i += 4) {
      // Grayscale conversion formula (Luma)
      const gray = 0.299 * faceData[i] + 0.587 * faceData[i + 1] + 0.114 * faceData[i + 2];
      grayscale.push(gray);
      sum += gray;
    }

    const mean = sum / 64;
    
    let varianceSum = 0;
    for (let i = 0; i < 64; i++) {
      varianceSum += Math.pow(grayscale[i] - mean, 2);
    }
    const stdDev = Math.sqrt(varianceSum / 64) || 1;

    // Normalize: (value - mean) / stdDev
    const signature = grayscale.map(val => (val - mean) / stdDev);

    return {
      success: true,
      box: { x: minX, y: minY, w: faceW, h: faceH },
      landmarks: { leftEye, rightEye, mouth },
      signature
    };
  }

  return { success: false, error: "Tizim xatosi" };
}

// 3. Compare two face signatures using Cosine Similarity
export function compareFaceSignatures(sig1, sig2) {
  if (!sig1 || !sig2 || sig1.length !== sig2.length) return 0;
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < sig1.length; i++) {
    dotProduct += sig1[i] * sig2[i];
    magnitudeA += sig1[i] * sig1[i];
    magnitudeB += sig2[i] * sig2[i];
  }
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  const cosSim = dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
  
  // Map similarity from [-1, 1] range to [0, 1] range
  const normalizedSim = (cosSim + 1) / 2;
  return normalizedSim;
}

// 4. Voice spectrum features calculation
// Bins represent frequency ranges from low bass to high pitch (10 bands)
export function getAverageSpectrum(analyserNode) {
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteFrequencyData(dataArray);

  // Group FFT spectrum into 10 bands
  const bandsCount = 10;
  const bandSize = Math.floor(bufferLength / bandsCount);
  const bands = new Array(bandsCount).fill(0);

  for (let i = 0; i < bandsCount; i++) {
    let sum = 0;
    for (let j = 0; j < bandSize; j++) {
      sum += dataArray[i * bandSize + j];
    }
    bands[i] = sum / bandSize;
  }
  
  return bands;
}

// 5. Compare two voice profiles
export function compareVoiceProfiles(prof1, prof2) {
  if (!prof1 || !prof2 || prof1.length !== prof2.length) return 0;

  // Calculate Euclidean distance & Cosine Similarity
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < prof1.length; i++) {
    dotProduct += prof1[i] * prof2[i];
    magA += prof1[i] * prof1[i];
    magB += prof2[i] * prof2[i];
  }

  if (magA === 0 || magB === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
  
  return (similarity + 1) / 2;
}
