const { Jimp } = require('jimp');

async function main() {
  const img = await Jimp.read('public/numbers.png');
  const width = img.bitmap.width;
  const height = img.bitmap.height;

  // We know there are 2 rows.
  // Let's divide height in 2.
  const row1 = { y1: 0, y2: Math.floor(height/2) };
  const row2 = { y1: Math.floor(height/2), y2: height };

  function getCols(y1, y2) {
    const cols = [];
    let inComponent = false;
    let startX = 0;
    
    for (let x = 0; x < width; x++) {
      let hasPixel = false;
      for (let y = y1; y < y2; y++) {
        const idx = (y * width + x) * 4;
        if (img.bitmap.data[idx+3] > 0) { // not transparent
          hasPixel = true;
          break;
        }
      }
      
      if (hasPixel && !inComponent) {
        inComponent = true;
        startX = x;
      } else if (!hasPixel && inComponent) {
        inComponent = false;
        cols.push({ x1: startX, x2: x });
      }
    }
    if (inComponent) cols.push({ x1: startX, x2: width });
    return cols;
  }

  const r1Cols = getCols(row1.y1, row1.y2);
  const r2Cols = getCols(row2.y1, row2.y2);

  console.log("Row 1 cols:", r1Cols);
  console.log("Row 2 cols:", r2Cols);
}
main();
