const quoteElement = document.getElementById('quote');
const authorElement = document.getElementById('author');
const wallpaper = document.getElementById('wallpaper');
const newQuoteBtn = document.getElementById('new-quote-btn');
const newImageBtn = document.getElementById('new-image-btn');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');

// ---- FETCH QUOTE FROM FREE API ----
async function fetchQuote() {
  // dummyjson.com: free, no API key, CORS-friendly
  // Response shape: { id, quote, author }
  const response = await fetch('https://dummyjson.com/quotes/random');
  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  return { text: data.quote, author: data.author };
}

// ---- LOAD RANDOM BACKGROUND IMAGE + QUOTE TOGETHER ----
async function getNewImage() {
  // 1. Load a new background image from picsum (reliable, no API key)
  const randomId = Math.floor(Math.random() * 1000);
  const imageUrl = `https://picsum.photos/seed/${randomId}/1920/1080`;
  wallpaper.style.backgroundImage = `url(${imageUrl})`;

  // 2. Fetch a random quote from the API, fall back to local array on error
  try {
    const data = await fetchQuote();
    quoteElement.textContent = `"${data.text}"`;
    authorElement.textContent = `— ${data.author}`;
  } catch (error) {
    console.warn('Quote API failed, using fallback:', error);
    const random = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    quoteElement.textContent = `"${random.text}"`;
    authorElement.textContent = `— ${random.author}`;
  }
}

// ---- DOWNLOAD AS PNG ----
function downloadWallpaper() {
  // Get the current background image URL from the wallpaper element
  const bgStyle = wallpaper.style.backgroundImage; // e.g. url("https://...")
  const imageUrl = bgStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.crossOrigin = 'anonymous'; // needed so canvas can export cross-origin images
  img.onload = function () {
    // 1. Draw the background photo
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 2. Draw the dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Draw the frosted card background
    const cardW = 1200;
    const cardH = 320;
    const cardX = (canvas.width - cardW) / 2;
    const cardY = (canvas.height - cardH) / 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 24);

    // 4. Draw the quote text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'italic 52px Georgia, serif';
    wrapText(ctx, quoteElement.textContent, canvas.width / 2, cardY + 110, cardW - 100, 72);

    // 5. Draw the author
    ctx.font = '500 30px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(authorElement.textContent.toUpperCase(), canvas.width / 2, cardY + cardH - 45);

    // 6. Trigger download
    const link = document.createElement('a');
    link.download = 'quote-wallpaper.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  img.onerror = function () {
    alert('Could not load image for download. Try generating a new image first.');
  };
  img.src = imageUrl;
}

// Helper: draw text with word-wrap
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

// Helper: draw a rounded rectangle
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// ---- TWEET QUOTE ----
function shareOnTwitter() {
  const quoteText = quoteElement.textContent;
  const authorText = authorElement.textContent;
  const fullQuote = `${quoteText} ${authorText}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullQuote)}`;
  window.open(twitterUrl, '_blank');
}

// ---- CLOCK ----
function updateClock() {
  const now = new Date();

  // Time: HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock-time').textContent = `${hours}:${minutes}:${seconds}`;

  // Date: Wednesday, February 25
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  document.getElementById('clock-date').textContent = dateStr;
}

updateClock(); // run immediately so there's no blank flash
setInterval(updateClock, 1000); // update every second

// ---- LOAD ON PAGE START ----
getNewImage();

// ---- BUTTON LISTENERS ----
newImageBtn.addEventListener('click', getNewImage);
downloadBtn.addEventListener('click', downloadWallpaper);
shareBtn.addEventListener('click', shareOnTwitter);
