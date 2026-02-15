import { fetchToken } from "./bridge.js"

export function login(username, password, successAction, failAction) {
   if(!username || !password) return false
  
  return fetchToken(username, password).then(success => {
    if(success) {
      successAction()
      document.dispatchEvent(
        new CustomEvent("auth:login-success")
      )
      return true
    } else {
      failAction()
      return false
    }
  }).catch(_ => false)
}