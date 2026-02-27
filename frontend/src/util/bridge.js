const API_BASE = "http://localhost:8080"

let userToken = localStorage.getItem('userToken')
let currentUserId = null


async function wrapFetchRequest(endpoint, options, auth, contentType="application/json") {
  const headers = {
    "Content-Type": contentType,
    ...(options.headers || {})
  }

  if (auth) {
    if (!await validateToken()) return false
    headers["Authorization"] = `Bearer ${userToken}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options, headers
  })
  if(!response.ok) return false
  return await response.json()
}

// Token handling
export function getCurrentUserId() {
  return currentUserId
}

export function unsetToken() {
  userToken = null
  currentUserId = null
  localStorage.removeItem("userToken")
}

export async function fetchToken(username, password) {
  const result = await fetch(`${API_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ username, password })
  })

  if (!result.ok) return false

  const json = await result.json()
  userToken = json.access_token
  localStorage.setItem("userToken", userToken)

  await validateToken()
  return true
}

export async function validateToken() {
  if (!userToken) return false

  try {
    const response = await fetch(`${API_BASE}/token/validate`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${userToken}`,
        "Content-Type": "application/json",
      }
    })

    if (!response.ok) {
      unsetToken()
      return false
    }

    const json = await response.json()
    currentUserId = json.id
    return true

  } catch (err) {
    unsetToken()
    return false
  }
}

// User requests
export function getUser(id) {
  return wrapFetchRequest(`/user/${id}`, { method: "GET" })
}

export async function getCurrentUser() {
  if (!await validateToken()) return null
  return wrapFetchRequest(`/user/${currentUserId}`, { method: "GET" }, true)
}

export function registerUser(username, password) {
  return wrapFetchRequest("/user/", {
    method: "POST",
    body: JSON.stringify({ username, password })
  })
}

// Roads requests
export function getArea(id) {
  return wrapFetchRequest(`/roads/${id}`, { method: "GET" })
}

export function joinArea(areaId) {
  return wrapFetchRequest(`/roads/${areaId}`, { method: "POST" }, true)
}

export function leaveArea(areaId) {
  return wrapFetchRequest(`/roads/${areaId}/leave`, { method: "POST" }, true)
}

export function markAsPicked(areaId) {
  return wrapFetchRequest(`/roads/${areaId}/picked`, { method: "PATCH" }, true)
}

export async function getAreaJSON(coords) {
  const roadsJSON = await wrapFetchRequest("/roads/", {
    method: "POST",
    body: JSON.stringify(coords)
  })

  if (!roadsJSON) return false

  roadsJSON.features = roadsJSON.features.map(feature => {
    if (!feature.id) feature.id = crypto.randomUUID()
    return feature
  })

  return roadsJSON
}