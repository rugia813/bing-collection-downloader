console.log('Bing Collection Download loaded')
const btnAll = document.createElement('button')

let totalImages
// We will use failedHtmlData array to track failures for HTML output.

window.onload = () => {
  attachDownloadBtn()
  attachCollectionBtn()
  observeShowMoreClick()

  fetchCollection()
}

// Fixed: Replaced deprecated 'unload' with 'pagehide'
window.addEventListener('pagehide', () => {
  btnAll.removeEventListener('click', downloadAll)
})

// --- Download All Images ---
async function downloadAll() {
  const res = await fetchCollection()
  extractedData = extractMediaInfo(res);

  // NEW: Sort by date modified (newest first)
  extractedData.sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime());

  totalImages = extractedData.length;
  console.log(extractedData);
  downloadImagesAsZip(extractedData)
}

// create & attach btn dom
function attachDownloadBtn() {
  btnAll.style.width = '204px'
  btnAll.style.paddingTop = '12px'
  btnAll.style.paddingBottom = '12px'
  btnAll.style.marginTop = '24px'
  btnAll.style.borderRadius = '32px'
  btnAll.style.border = 'transparent solid 1px'
  btnAll.style.cursor = 'pointer'
  btnAll.classList.add('primary_btn_shp_clr')

  btnAll.innerText = 'Download All Images'
  btnAll.addEventListener('click', downloadAll)
  document.querySelector('.nav-panel__nav').prepend(btnAll)
}
// ---

// --- Download Single Collection ---
function attachCollectionBtn() {
  const list = document.querySelectorAll('.collection')
  const hoverClass = 'collection__download_btn'
  const style = document.createElement('style')
  style.innerHTML = `
    .${hoverClass} {
      cursor: pointer;
      background-color: transparent;
      border-radius: 50%;
      border: none;
      width: 24px;
      height: 24px;
      padding: 0;
      margin-right: 3px;
      color: white;
    }
    .${hoverClass}:hover {
      background-color: #296eeb;
    }
  `
  document.head.appendChild(style)

  for (const i in list) {
    if (!list.hasOwnProperty(i)) continue
    if (i == 0 || i == list.length - 1) continue
    const item = list[i]
    if (item.getElementsByClassName('collection__download_btn').length) continue
    try {
      const name = item.getElementsByClassName('collection_title')?.[0]?.textContent
      const btn = document.createElement('button')
      btn.innerHTML = '<svg width="16px" height="16px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path d="M12.5535 16.5061C12.4114 16.6615 12.2106 16.75 12 16.75C11.7894 16.75 11.5886 16.6615 11.4465 16.5061L7.44648 12.1311C7.16698 11.8254 7.18822 11.351 7.49392 11.0715C7.79963 10.792 8.27402 10.8132 8.55352 11.1189L11.25 14.0682V3C11.25 2.58579 11.5858 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V14.0682L15.4465 11.1189C15.726 10.8132 16.2004 10.792 16.5061 11.0715C16.8118 11.351 16.833 11.8254 16.5535 12.1311L12.5535 16.5061Z" fill="currentColor"/> <path d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z" fill="currentColor"/> </svg>'
      btn.classList.add('collection__download_btn')
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        downloadCollection(name)
      })
      item.append(btn)
    } catch (error) {
      console.log('error', error, item)
    }
  }
}

async function downloadCollection(collectionName) {
  const res = await fetchCollection()
  res.collections = res.collections.filter(({title}) => title === collectionName)
  extractedData = extractMediaInfo(res);

  // NEW: Sort by date modified (newest first)
  extractedData.sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime());

  totalImages = extractedData.length;
  console.log(extractedData);
  downloadImagesAsZip(extractedData, collectionName)
}

function observeShowMoreClick() {
  const collectionBtns = document.getElementsByClassName('collection')
  const showMoreBtn = collectionBtns[collectionBtns.length - 1]
  if (showMoreBtn.textContent === 'Show more') {
    showMoreBtn.addEventListener('click', () => {
      setTimeout(() => {
        attachCollectionBtn()
      }, 500)
    })
  }
}
// ---

// --- Api ---
async function fetchCollection() {
  const cookie = document.cookie.split('; ').find(e => e.startsWith('_U='))
  const res = await fetch('https://www.bing.com/mysaves/collections/get?sid=0', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "cookie": cookie,
        "sid": 0
    },
    body: JSON.stringify({
        "collectionItemType":"all",
        "maxItemsToFetch":9999,
        "shouldFetchMetadata":true
    })
  })

  const data = await res.json()
  console.log(data);
  return data
}
// ---

// --- Filename Sanitization Helper ---
const sanitizeTitle = (text) => {
    if (!text) return "";
    // 1. Remove trailing "Image X of Y"
    let cleanText = text.replace(/\.?\s*Image\s+\d+\s+of\s+\d+\s*$/i, '').trim();
    // 2. Sanitize illegal filename characters (Replaces \ / : * ? " < > | with a hyphen (-))
    cleanText = cleanText.replace(/[\\/:*?"<>|]/g, '-').trim();
    return cleanText;
};
// ------------------------------------


// Function to extract media info from the response
function extractMediaInfo(data) {
  const extractedInfo = [];

  if (data && data.collections && Array.isArray(data.collections)) {
    data.collections.forEach(collection => {
      if (collection.collectionPage && collection.collectionPage.items && Array.isArray(collection.collectionPage.items)) {
        collection.collectionPage.items.forEach(item => {
          if (item.content && item.content.url && item.content.title && item.content.contentId) {

            // CLEAN AND SANITIZE TITLE
            const rawTitle = item.content.title || "";
            const cleanAndSafeTitle = sanitizeTitle(rawTitle);

            const mediaInfo = {
              url: JSON.parse(item.content.customData).MediaUrl,
              title: cleanAndSafeTitle,
              prompt: cleanAndSafeTitle,
              contentId: item.content.contentId,
              thumbnails: item.content.thumbnails,
              // Extract date modified and convert to Date object for sorting
              dateModified: new Date(item.dateModified),
            };
            extractedInfo.push(mediaInfo);
          }
        });
      }
    });
  }

  return extractedInfo;
}

// === HTML Generation Function ===
// Now accepts two sets of data: successful downloads and failed prompts
function generateHtmlFile(successData, failureData) {
    let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bing Collection Prompts & Images</title>
    <style>
        body { font-family: sans-serif; margin: 20px; background-color: #f4f4f4; }
        .image-container, .failure-container {
            background-color: white;
            border: 1px solid #ddd;
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .image-container h2 { color: #0078d4; margin-top: 0; }
        .failure-container { border-left: 5px solid #ff4444; background-color: #ffe6e6; }
        .failure-container h2 { color: #ff4444; margin-top: 0; }
        .image-container p, .failure-container p { white-space: pre-wrap; word-wrap: break-word; font-style: italic; color: #333; }
        .image-container img { max-width: 100%; height: auto; display: block; margin-top: 10px; border-radius: 4px; }
        hr { border: 0; height: 1px; background-color: #ccc; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Bing Collection Download - Prompts & Images</h1>
    <p>Note: This HTML file and all image files must be in the same folder after extracting the ZIP for the images to display correctly.</p>
    <hr>

    <h2>✅ Successful Downloads (${successData.length} Total)</h2>`;

    // --- 1. Successful Downloads ---
    successData.forEach((item, index) => {
        const rawFilename = item.filename;
        const encodedFilename = encodeURIComponent(rawFilename);

        const safePrompt = item.prompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        htmlContent += `
    <div class="image-container">
        <h2>Image ${index + 1}</h2>
        <p>${safePrompt}</p>
        <img src="${encodedFilename}" alt="${safePrompt}">
    </div>`;
    });

    htmlContent += `<hr>`;

    // --- 2. Failed Downloads ---
    if (failureData.length > 0) {
        htmlContent += `
    <h2>❌ Failed Downloads (${failureData.length} Total)</h2>
    <p>The following prompts failed to download (primary image and all thumbnails failed):</p>`;

        failureData.forEach((item, index) => {
            const safePrompt = item.prompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            htmlContent += `
    <div class="failure-container">
        <h2>Failed Prompt ${index + 1}</h2>
        <p>${safePrompt}</p>
    </div>`;
        });
    }


    htmlContent += `
</body>
</html>`;

    return htmlContent;
}

// ===

// Function to download images and save as a zip file (RESTRUCTURED)
async function downloadImagesAsZip(extractedData, fileName = 'bing-images') {
  if (typeof JSZip === 'undefined') {
    console.error('JSZip library is required. Please include it in your project.');
    return;
  }

  const zip = new JSZip();
  const finalHtmlData = []; // Collects {prompt, filename} for successful downloads
  const failedHtmlData = []; // NEW: Collects {prompt} for failed downloads
  let totalDownloadsAttempted = extractedData.length;

  // --- Helper to perform download attempts (New Structure) ---
  async function performDownloadAndZip(item, num) {
    const shortFileName = item.title.slice(0, 155);
    const comment = item.prompt;
    let downloadSuccess = false;

    // 1. Try Primary URL
    try {
      let response = await fetch(item.url);
      if (response.ok) {
        const blob = await response.blob();
        const filename = `${num} ${shortFileName}.jpg`;
        zip.file(filename, blob, { comment, date: item.dateModified });
        finalHtmlData.push({ prompt: item.prompt, filename: filename });
        downloadSuccess = true;
      }
    } catch (error) {
        // console.warn(`Primary download failed for ${item.title}. Trying thumbnails...`);
    }

    if (downloadSuccess) return true;

    // 2. Try Thumbnail Fallback
    for (let i = 0; i < item.thumbnails.length; i++) {
        const { thumbnailUrl } = item.thumbnails[i];
        try {
            let response = await fetch(thumbnailUrl);
            if (response.ok) {
                const blob = await response.blob();
                const filename = `${num}-${i} ${shortFileName}.jpg`; // Thumbnail filename format
                zip.file(filename, blob, { comment, date: item.dateModified });
                finalHtmlData.push({ prompt: item.prompt, filename: filename });
                downloadSuccess = true;
                break; // Stop looking for thumbnails once one succeeds
            }
        } catch (error) {
            // console.warn(`Thumbnail ${i} failed for ${item.title}.`);
        }
    }

    // 3. Complete Failure
    if (!downloadSuccess) {
        failedHtmlData.push({ prompt: item.prompt }); // NEW: Track failed prompt for HTML
        return false;
    }
    return true;
  }
  // -------------------------------------------------------------

  // Run all downloads in parallel and await completion
  const downloadPromises = extractedData.map((item, i) => performDownloadAndZip(item, i));
  await Promise.all(downloadPromises);

  // --- HTML FILE GENERATION ---
  // Pass both successful and failed data
  const htmlContent = generateHtmlFile(finalHtmlData, failedHtmlData);
  zip.file("index.html", htmlContent);
  // ----------------------------

  // Create a Set to store unique prompts
  const uniquePrompts = new Set();
  finalHtmlData.forEach(item => { // Use finalHtmlData for accurate prompts
      if (item.prompt) {
          uniquePrompts.add(item.prompt);
      }
  });

  // Add the prompts text file to the zip
  if (uniquePrompts.size > 0) {
      const promptsContent = Array.from(uniquePrompts).join('\r\n\r\n');
      zip.file("prompts.txt", promptsContent);
  }

  // Generate the zip file
  const content = await zip.generateAsync({ type: 'blob' })
    .then(blob => {
      const sucImages = finalHtmlData.length;
      const failedCount = failedHtmlData.length;
      console.log('Downloaded', sucImages, 'full images');
      failedCount > 0 && console.log('Failed to download', failedCount, ' images. Prompts listed in index.html.');

      const zipFileName = `${fileName}(${sucImages}) ${+new Date()}.zip`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = zipFileName;
      link.click();
    });
}