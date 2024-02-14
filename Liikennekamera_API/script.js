let globalCameras = [];

const graphqlEndpoint = 'https://api.oulunliikenne.fi/proxy/graphql';
const query = `
  query GetAllCameras {
    cameras {
      cameraId
      name
      lat
      lon
      presets {
        presetId
        presentationName
        imageUrl
        measuredTime
      }
    }
  }`;

// Datan haku GraphQL-endpointista
fetch(graphqlEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
})
    .then(response => response.json())
    .then(data => {
        globalCameras = data.data.cameras; // Tallenna haetut kamerat globaaliin muuttujaan
        displayCameras(globalCameras); // Näytä kamerat valikossa
        initializeMap(globalCameras); // Alusta kartta ja lisää markerit
    })
    .catch(error => console.error('Error fetching camera data:', error));

function displayCameras(cameras) {
    const cameraList = document.getElementById('cameraList');
    cameras.forEach(camera => {
        const cameraOption = document.createElement('option');
        cameraOption.value = camera.cameraId;
        cameraOption.textContent = camera.name;
        cameraList.appendChild(cameraOption);
    });

    cameraList.addEventListener('change', function () {
        const selectedCamera = cameras.find(camera => camera.cameraId === this.value);
        showCameraImages(selectedCamera.presets);
    });
}

//kuvien käsittelyä
function showCameraImages(presets) {
    const imagesContainer = document.getElementById('imagesContainer');
    imagesContainer.innerHTML = '';

    presets.forEach(preset => {
        const img = document.createElement('img');
        img.src = preset.imageUrl;
        img.alt = `${preset.presentationName}, kuva otettu: ${preset.measuredTime}`;
        img.style.width = '100%';
        img.style.maxWidth = '600px';
        imagesContainer.appendChild(img);
    });
}

//kameroiden sijoittelu kartalle koordinaateilla
function initializeMap(cameras) {
    var map = L.map('map').setView([65.0121, 25.4651], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    cameras.forEach(camera => {
        var marker = L.marker([camera.lat, camera.lon]).addTo(map);
        marker.on('click', function () {
            showCameraImages(camera.presets);
        });
    });
}