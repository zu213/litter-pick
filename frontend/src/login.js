var loginElement = null

export async function startLoginFlow() {
  const tpl = document.getElementById("login-template")
  const node = tpl.content.cloneNode(true)

  const loginEl = node.querySelector('.login-mask')
  loginEl.addEventListener('click', (e) => dismissLogin(e))
  loginEl.querySelector('.login-menu').addEventListener('click', (e) => e.stopPropagation())

  requestAnimationFrame(() => {
    loginEl.classList.add("is-open")
  })

  document.body.appendChild(loginEl)
  loginElement = loginEl
}


const dismissLogin = (e) => {
  e.stopPropagation()
  if(!loginElement) return

  loginElement.classList.remove("is-open")

  loginElement.addEventListener(
    "transitionend",
    () => {
      document.body.removeChild(loginElement)
      loginElement = null
    },
    { once: true }
  )
}