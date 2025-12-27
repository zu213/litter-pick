
const roadsJSON = await(await fetch('./geojson.json')).json()

// Map bounds
const bounds = L.latLngBounds(
  [51.754, -0.574], // SW corner
  [51.768, -0.560]  // NE corner
)

// Setup map
const map = L.map('map', {
  worldCopyJump: false,
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
  minZoom: 15,
  maxZoom: 18
}).setView([51.7605, -0.566], 16)

map.fitBounds(bounds)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

const roadStyle = {
  'color': '#ff7800',
  'weight': 5,
  'opacity': 0.65
}

const roadHoverStyle = {
  color: '#00ffff',
  weight: 7,
  opacity: 1
};

// Add roads
L.geoJSON(roadsJSON, {
  onEachFeature: (feature, layer) => {
    layer.on('click', (e) => {
      console.log('test123')
    })

    layer.on('mouseover', (e) => {
      e.target.setStyle(roadHoverStyle);
    })

    layer.on('mouseout', (e) => {
      e.target.setStyle(roadStyle);
    });
  },
  style: roadStyle
}).addTo(map)