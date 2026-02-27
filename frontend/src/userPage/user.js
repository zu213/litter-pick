import { getUser } from "./util/bridge.js"

// Profile stuff
async function startProfileFlow() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const userId = urlParams.get('user')

  if(!userId) {
    window.location.href = "/frontend/public/index.html"
    return
  }

  const user = await getUser(userId)

  const tpl = document.getElementById("profile-template")
  const node = tpl.content.cloneNode(true)
  const profileMenuElement = node.querySelector('.profile-menu')

  const usernameHolder = profileMenuElement.querySelector('.user-name')
  usernameHolder.innerText = `Username: ${user.username}`

  const roadDetailsHolder = profileMenuElement.querySelector('.user-areas')
  roadDetailsHolder.innerHTML = `Roads: ${processRoadsToNames(user.roads)}`

  document.body.appendChild(profileMenuElement)
}

function processRoadsToNames(unprocessed) {
  if(!unprocessed) window.location.href = "/frontend/public/index.html"

  return unprocessed.map(road => {
    const parsedDetails = JSON.parse(road.details)
    return `<span><a href="/frontend/public/index.html?road=${road['id']}">${parsedDetails['properties']['name'] ?? 'Unnamed area'}</a></span>`
  })
}

await startProfileFlow()