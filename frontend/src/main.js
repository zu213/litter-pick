import { startSidebarFlow } from "./sidebar.js"
import { addRoadsToMap, getRoadJSON } from "./roads.js"

const coords = {s: 51.748, w: -0.606, n: 51.780, e: -0.530}

// Map bounds
const bounds = L.latLngBounds(
  [coords.s, coords.w], // SW corner
  [coords.n, coords.e]  // NE corner
)

// Setup map
const map = L.map('map', {
  worldCopyJump: false,
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
  minZoom: 14,
  maxZoom: 18
}).setView([51.7605, -0.566], 16)

map.fitBounds(bounds)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)


const roadsJSON = await getRoadJSON(coords)
const features = structuredClone(roadsJSON['features']);

// KEEP PLEASE
// Clean up any dirtying of json I perform - not needed for now
// roadsJSON['features'] = roadsJSON['features'].map(feature => {
//   delete feature['id']
//   return feature
// })

startSidebarFlow(features)
addRoadsToMap(roadsJSON, map)



