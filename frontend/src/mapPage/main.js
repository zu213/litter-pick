import { startSidebarFlow } from './sidebar.js'
import { addRoadsToMap } from './roads.js'
import { getAreaJSON } from '../util/bridge.js'

const coords = {s: 51.748, w: -0.606, n: 51.780, e: -0.515}

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

const roadsJSON = await getAreaJSON(coords)

if(roadsJSON.error) {
  alert(`Error ${roadsJSON.error}, please refresh`)
  document.querySelector('.loading-spinner').classList.add('hidden')
} else {
  const features = structuredClone(roadsJSON['features'])

  startSidebarFlow(features)
  addRoadsToMap(roadsJSON, map)
}



