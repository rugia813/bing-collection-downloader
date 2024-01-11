console.log('Bing Collection Download loaded')
const btn = document.createElement('button')

window.onload = () => {
	// create a btn and then attach
	btn.style.width = '204px'
	btn.style.paddingTop = '12px'
	btn.style.paddingBottom = '12px'
	btn.style.marginTop = '24px'
	btn.style.borderRadius = '32px'
	btn.style.border = 'transparent solid 1px'
	btn.style.cursor = 'pointer'
	btn.classList.add('primary_btn_shp_clr')

	btn.innerText = 'Download All Images'
	btn.addEventListener('click', handleClick)
	document.querySelector('.nav-panel__nav').prepend(btn)
}
window.onunload = () => {
	btn.removeEventListener('click', handleClick)
}

function handleClick() {
	const cookie = document.cookie.split('; ').find(e => e.startsWith('_U='))
	fetch('https://www.bing.com/mysaves/collections/get?sid=0', {
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
	.then(e => e.json())
	.then(res => {
		console.log(res);
		extractedData = extractMediaInfo(res);
		console.log(extractedData);
		downloadImagesAsZip(extractedData)
	})
}

// Function to extract media info from the response
function extractMediaInfo(data) {
  const extractedInfo = [];

  if (data && data.collections && Array.isArray(data.collections)) {
    data.collections.forEach(collection => {
      if (collection.collectionPage && collection.collectionPage.items && Array.isArray(collection.collectionPage.items)) {
        collection.collectionPage.items.forEach(item => {
          if (item.content && item.content.url && item.content.title && item.content.contentId) {
            const mediaInfo = {
              MediaUrl: JSON.parse(item.content.customData).MediaUrl,
              title: item.content.title,
              contentId: item.content.contentId,
							thumbnails: item.content.thumbnails,
            };
            extractedInfo.push(mediaInfo);
          }
        });
      }
    });
  }

  return extractedInfo;
}

// Function to download images and save as a zip file
async function downloadImagesAsZip(extractedData) {
  // Check if JSZip library is available
  if (typeof JSZip === 'undefined') {
    console.error('JSZip library is required. Please include it in your project.');
    return;
  }

  // Create a new instance of JSZip
  const zip = new JSZip();

  // Function to download an image and add it to the zip file
  async function downloadAndAddToZip(url, fileName, title, thumbnails, num) {
    const shortFileName = fileName.slice(0, 176);
    try {
      const response = await fetch(url);

      // Check if the response is successful (status code 200)
      if (response.ok) {
        const blob = await response.blob();

        // Embed title in metadata
        const metadata = { title };

        // Add the image file to the zip with contentId as the file name
        zip.file(`${num} ${shortFileName}.jpg`, blob, { metadata });
			} else {
				console.warn(`Failed to download image: ${title}`);
				thumbnails.forEach(async ({thumbnailUrl}, i) => {
					const response = await fetch(thumbnailUrl);
					// Check if the response is successful (status code 200)
					if (response.ok) {
						const blob = await response.blob();

						// Embed title in metadata
						const metadata = { title };

						// Add the image file to the zip with contentId as the file name
						zip.file(`${num}-${i} ${shortFileName}.jpg`, blob, { metadata });
					}
				})
			}
    } catch (error) {
      console.error(`Failed to download image with contentId: ${fileName}`, error);
    }
  }

  // Download each image and add it to the zip file
  const downloadPromises = extractedData.map((item, i) =>
    downloadAndAddToZip(item.MediaUrl, item.title, item.title, item.thumbnails, i)
  );

  // Wait for all download promises to complete
  await Promise.all(downloadPromises);

  // Generate the zip file
  const content = await zip.generateAsync({ type: 'blob' })
		.then(blob => {
			const zipFileName = `bing-images ${+new Date()}.zip`;
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = zipFileName;
			link.click();
		});
}

