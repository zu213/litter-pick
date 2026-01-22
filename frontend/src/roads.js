import { selectRoadCard } from "./sidebar.js"
import { roadSelectedStyle, roadStyle, roadHoverStyle } from "./util/styles.js"

const roadById = new Map()
var selectedRoad = null

export async function getRoadJSON(coords) {
  return (fetch('http://127.0.0.1:8080/roads/', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer`,
    },
    body: JSON.stringify(
      coords,
    ),
  })).then(response => {
    if(response.ok) return response.json()
  }).then(roadsJSON => {
    roadsJSON['features'] = roadsJSON['features'].map((feature) => {
      if(!feature['id']) feature['id'] = crypto.randomUUID()
      return feature
    })
    return roadsJSON
  }) 
}

export function addRoadsToMap(roadsJSON, map) {
  // Add roads
  L.geoJSON(roadsJSON, {
    onEachFeature: (feature, layer) => {
      roadById.set(feature.id, layer);

      layer.on('click', (e) => {
        const roadCardElement = document.getElementById(feature['id'])
        selectRoad(roadCardElement, e.target)

      })

      layer.on('mouseover', (e) => {
        if(e.target != selectedRoad) {
          e.target.setStyle(roadHoverStyle)
        }
      })

      layer.on('mouseout', (e) => {
        if(e.target != selectedRoad) {
          e.target.setStyle(roadStyle)
        }
      });
    },
    style: roadStyle
  }).addTo(map)
}

export function selectRoadFromId(roadId) {
  const roadObj = roadById.get(roadId);
  if (!roadObj) return;

  selectedRoad?.setStyle(roadStyle);
  roadObj.setStyle(roadSelectedStyle);
  selectedRoad = roadObj;
}

const selectRoad = (roadCardElement, roadElement) => {
  selectRoadCard(roadCardElement)
  
  selectedRoad?.setStyle(roadStyle)
  roadElement.setStyle(roadSelectedStyle)
  selectedRoad = roadElement
}