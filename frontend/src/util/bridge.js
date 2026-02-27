var userToken = localStorage.getItem('userToken')
var currentUserId = null


async function wrapFetchRequest(url, obj) {
  const response = await fetch(url, obj)

  if(!response.ok) {
    return false
  }

  const json = await response.json()
  return json
}

export function getCurrentUserId() {
  return currentUserId
}

function presetToken() {
  if (!userToken) userToken = localStorage.getItem('userToken')
}

export function unsetToken() {
  userToken = null
  localStorage.removeItem('userToken')
}

export async function fetchToken(username, password) {
  const result = await wrapFetchRequest("http://localhost:8080/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username,
      password,
    }),
  })

  if(!result) return false
  localStorage.setItem('userToken', result['access_token'])
  await validateToken()
  return true
}

// Always updates current user id
export function validateToken(){
  presetToken()
  if (!userToken) return Promise.resolve(false)
  return wrapFetchRequest('http://localhost:8080/token/validate', {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json",
    }
  }).then(json => {
    if(!json) return false
    currentUserId = json.id
    return true
  })
}

export async function getCurrentUser() {
  const currentUser = getCurrentUserId()
  if(!currentUser || !await validateToken()) return null

  return wrapFetchRequest(`http://localhost:8080/user/${currentUser}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json",
    }
  })
}

export async function getUser(id) {
  return await wrapFetchRequest(`http://localhost:8080/user/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  })
}

export async function registerUser(username, password) {
  return await wrapFetchRequest("http://localhost:8080/user/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
}

export async function getArea(id) {
  return await wrapFetchRequest(`http://localhost:8080/roads/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer`,
      "Content-Type": "application/json",
    }
  })
}


export async function joinArea(areaId) {
   if(!await validateToken()) return false

  return await wrapFetchRequest(`http://localhost:8080/roads/${areaId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
  })
}

export async function leaveArea(areaId) {
   if(!await validateToken()) return false

  return await wrapFetchRequest(`http://localhost:8080/roads/${areaId}/leave`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
  })
}

export async function getAreaJSON(coords) {
  return (wrapFetchRequest('http://127.0.0.1:8080/roads/', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer`,
    },
    body: JSON.stringify(
      coords,
    ),
  })).then(roadsJSON => {
    roadsJSON['features'] = roadsJSON['features'].map((feature) => {
      if(!feature['id']) feature['id'] = crypto.randomUUID()
      return feature
    })
    return roadsJSON
  }) 
}

export async function markAsPicked(areaId){
  if(!await validateToken()) return false

  return await wrapFetchRequest(`http://localhost:8080/roads/${areaId}/picked`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
  })
}