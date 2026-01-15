import { startLoginFlow } from "./login.js"

var sidebarElement = null
var selectedRoadCardElement = null
var loggedIn = false
var unnamedCounter = 0

export async function startSidebarFlow(features) {
  const tpl = document.getElementById("sidebar-template");
  const node = tpl.content.cloneNode(true);

  const cardHolderElement = node.getElementById('area-cards')
  
  for(const feature of features) {
  
    const cardElement = document.createElement('div')
    cardElement.id = feature['id'] 
    cardElement.className = 'area-card'
    cardElement.addEventListener('click', () => startAreaCardFlow(feature))

    cardElement.innerHTML = `<div>Area: ${feature['properties']['name'] ?? `Unnamed area`}</div>`
    cardHolderElement.appendChild(cardElement)
  }

  document.body.appendChild(cardHolderElement)
  sidebarElement = cardHolderElement
}

export function selectRoadCard(roadCardElement) {
  selectedRoadCardElement?.classList.remove('selected')

  // format area cards
  const areaCardElement = document.getElementById('area-cards')
  areaCardElement.classList.add('visible')
  roadCardElement.scrollIntoView()
  roadCardElement.classList.add('selected')
  selectedRoadCardElement = roadCardElement
}

function startAreaCardFlow(feature) {

  const tpl = document.getElementById("detailed-card-template");
  const node = tpl.content.cloneNode(true);

  const cardElement = node.querySelector('.detailed-card')

  console.log(cardElement)

  cardElement.querySelector('#area-volunteers').innerText = `Volunteers: ${feature['volunteers'] ?? 'No volunteers for area found'}`
  cardElement.querySelector('#area-title').innerText = `Area: ${feature['properties']['name'] ?? `Unnamed area`}`

  const button = document.createElement('button');
  if(loggedIn) {
    button.innerText = 'Join'
    button.addEventListener('click', () => joinArea(feature))
  } else {
    button.innerText = 'Login to Join'
    button.addEventListener('click', () => startLoginFlow())
  }

  cardElement.appendChild(button)

  document.body.appendChild(cardElement)
}

const fetchToken = async () => {
    const res = await fetch("http://localhost:8080/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: 'johndoe',
      password: 'secret',
    }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const json =await res.json()

  const res2 = await fetch("http://localhost:8080/token", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${json['access_token']}`,
      "Content-Type": "application/json",
    }
  })

  console.log(await res2.json())
}