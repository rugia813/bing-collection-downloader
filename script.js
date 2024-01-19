console.log('Bing Collection Download loaded')
const btnAll = document.createElement('button')

let totalImages, failedImages = []

window.onload = () => {
  attachDownloadBtn()
  attachCollectionBtn()

  fetchCollection()
}
window.onunload = () => {
	btnAll.removeEventListener('click', downloadAll)
}


// === Download All Images

// on all btn click
async function downloadAll() {
	const res = await fetchCollection()
  extractedData = extractMediaInfo(res);
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

// ===


// === Download Single Collection

function attachCollectionBtn() {
  const list = document.querySelectorAll('.collection')
  // define btn hover style class
  const hoverClass = 'collection__download_btn'
  // insert css class
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
    try {
      const name = item.getElementsByClassName('collection_title')?.[0]?.textContent
      // create a button with a download icon
      const btn = document.createElement('button')
      btn.innerHTML = '<svg width="16px" height="16px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path d="M12.5535 16.5061C12.4114 16.6615 12.2106 16.75 12 16.75C11.7894 16.75 11.5886 16.6615 11.4465 16.5061L7.44648 12.1311C7.16698 11.8254 7.18822 11.351 7.49392 11.0715C7.79963 10.792 8.27402 10.8132 8.55352 11.1189L11.25 14.0682V3C11.25 2.58579 11.5858 2.25 12 2.25C12.4142 2.25 12.75 2.58579 12.75 3V14.0682L15.4465 11.1189C15.726 10.8132 16.2004 10.792 16.5061 11.0715C16.8118 11.351 16.833 11.8254 16.5535 12.1311L12.5535 16.5061Z" fill="currentColor"/> <path d="M3.75 15C3.75 14.5858 3.41422 14.25 3 14.25C2.58579 14.25 2.25 14.5858 2.25 15V15.0549C2.24998 16.4225 2.24996 17.5248 2.36652 18.3918C2.48754 19.2919 2.74643 20.0497 3.34835 20.6516C3.95027 21.2536 4.70814 21.5125 5.60825 21.6335C6.47522 21.75 7.57754 21.75 8.94513 21.75H15.0549C16.4225 21.75 17.5248 21.75 18.3918 21.6335C19.2919 21.5125 20.0497 21.2536 20.6517 20.6516C21.2536 20.0497 21.5125 19.2919 21.6335 18.3918C21.75 17.5248 21.75 16.4225 21.75 15.0549V15C21.75 14.5858 21.4142 14.25 21 14.25C20.5858 14.25 20.25 14.5858 20.25 15C20.25 16.4354 20.2484 17.4365 20.1469 18.1919C20.0482 18.9257 19.8678 19.3142 19.591 19.591C19.3142 19.8678 18.9257 20.0482 18.1919 20.1469C17.4365 20.2484 16.4354 20.25 15 20.25H9C7.56459 20.25 6.56347 20.2484 5.80812 20.1469C5.07435 20.0482 4.68577 19.8678 4.40901 19.591C4.13225 19.3142 3.9518 18.9257 3.85315 18.1919C3.75159 17.4365 3.75 16.4354 3.75 15Z" fill="currentColor"/> </svg>'
      btn.classList.add('collection__download_btn')
      btn.addEventListener('click', () => downloadCollection(name))
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
  totalImages = extractedData.length;
  console.log(extractedData);
  downloadImagesAsZip(extractedData, collectionName)
}

// ===


// === Api

// call collection list api
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

// Function to extract media info from the response
function extractMediaInfo(data) {
  const extractedInfo = [];

  if (data && data.collections && Array.isArray(data.collections)) {
    data.collections.forEach(collection => {
      if (collection.collectionPage && collection.collectionPage.items && Array.isArray(collection.collectionPage.items)) {
        collection.collectionPage.items.forEach(item => {
          if (item.content && item.content.url && item.content.title && item.content.contentId) {
            const mediaInfo = {
              url: JSON.parse(item.content.customData).MediaUrl,
              title: item.content.title,
              contentId: item.content.contentId,
							thumbnails: item.content.thumbnails,
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

// Function to download images and save as a zip file
async function downloadImagesAsZip(extractedData, fileName = 'bing-images') {
  // Check if JSZip library is available
  if (typeof JSZip === 'undefined') {
    console.error('JSZip library is required. Please include it in your project.');
    return;
  }

  // Create a new instance of JSZip
  const zip = new JSZip();

  // Function to download an image and add it to the zip file
  async function downloadAndAddToZip({url, title, thumbnails, dateModified}, num) {
    const fileName = title
    const shortFileName = fileName.slice(0, 155);
    try {
      const response = await fetch(url);

      // Check if the response is successful (status code 200)
      if (response.ok) {
        const blob = await response.blob();

        // Embed title in comment
        const comment = title;

        // Add the image file to the zip with contentId as the file name
        zip.file(`${num} ${shortFileName}.jpg`, blob, { comment, date: dateModified });
			} else {
				console.warn(`Failed to download image: ${title}`);
				thumbnails.forEach(async ({thumbnailUrl}, i) => {
					const response = await fetch(thumbnailUrl);
					// Check if the response is successful (status code 200)
					if (response.ok) {
						const blob = await response.blob();

						// Embed title in comment
            const comment = title;

						// Add the image file to the zip with contentId as the file name
						zip.file(`${num}-${i} ${shortFileName}.jpg`, blob, { comment, date: dateModified });
					} else {
            failedImages.push(fileName);
            console.warn(`Failed to download thumbnail: ${title}`);
          }
				})
			}
    } catch (error) {
      console.error(`Failed to download image with contentId: ${fileName}`, error);
    }
  }

  // Download each image and add it to the zip file
  const downloadPromises = extractedData.map((item, i) =>
    downloadAndAddToZip(item, i)
  );

  // Wait for all download promises to complete
  await Promise.all(downloadPromises);

  // Generate the zip file
  const content = await zip.generateAsync({ type: 'blob' })
		.then(blob => {
      const sucImages = totalImages - failedImages.length;
      console.log('Downloaded', sucImages, 'full images');
      failedImages.length && console.log('Failed to download', failedImages.length, ' images', failedImages)
			const zipFileName = `${fileName}(${totalImages}) ${+new Date()}.zip`;
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = zipFileName;
			link.click();
		});
}

