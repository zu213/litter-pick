import { fetchToken } from "./bridge.js"

export function login(username, password, successAction, failAction) {
   if(!username) return false
  
  return fetchToken(username, password).then(success => {
    if(success.ok) {
      successAction()
      document.dispatchEvent(
        new CustomEvent("auth:login-success")
      )
      return true
    } else {
      failAction(success?.json?.detail ?? 'Unknown error')
      return false
    }
  }).catch(_ => false)
}