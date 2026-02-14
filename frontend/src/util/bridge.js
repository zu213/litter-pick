var userToken = localStorage.getItem('userToken')

var currentUserId = null

export function getCurrentUserId() {
  return currentUserId
}

function presetToken() {
  if (!userToken) userToken = localStorage.getItem('userToken')
}

export async function fetchToken(username, password) {
  const res = await fetch("http://localhost:8080/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username,
      password,
    }),
  })

  if (!res.ok) {
    return false
  }

  const json = await res.json()
  userToken = json['access_token']
  localStorage.setItem('userToken', userToken)
  return true
  
}

// Always updates current user id
export function validateToken(){
  presetToken()
  if (!userToken) return Promise.resolve(false)
  return fetch("http://localhost:8080/token/validate", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json",
    }
  }).then(res => {
    if(res.ok){
      return res.json().then(json => {
        currentUserId = json.id
        return true
      })
    }
    return false
  })
}

export async function getCurrentUser() {
  if(!await validateToken()) return null

  const res = await fetch(`http://localhost:8080/user/${getCurrentUserId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json",
    }
  })

  const user = await res.json()

  return user 
}

export async function registerUser(username, password) {

  const res = await fetch("http://localhost:8080/user/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })

  const user = await res.json()

  return user 
}

export async function getArea(id) {
  const res = await fetch(`http://localhost:8080/roads/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer`,
      "Content-Type": "application/json",
    }
  })

  const road = await res.json()

  return road 
}


export async function joinArea(areaId, userId) {
   if(!await validateToken()) return false

  const res = await fetch(`http://localhost:8080/roads/${areaId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: new URLSearchParams({
      userId,
    }),
  })

  const json = await res.json()

  if(json) {
    return json
  } else {
    return false
  }
}