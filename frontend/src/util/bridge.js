var userToken = localStorage.getItem('token')

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

function validateToken(){
  return fetch("http://localhost:8080/token", {
    method: "HEAD",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json",
    }
  }).then(res => {
    if(res.ok) return true
    return false
  })
}

export async function getUser() {
  if(!await validateToken()) return null

  const res = await fetch("http://localhost:8080/token", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json",
    }
  })

  const user = await res.json()
  console.log(user)

  return user 
}