var loginElement = null

export async function startLoginFlow() {
  const tpl = document.getElementById("login-template");
  const node = tpl.content.cloneNode(true);

  const loginEl = node.querySelector('.login-mask')
  console.log(loginEl)
  loginEl.addEventListener('click', () => dismissLogin())
  loginEl.querySelector('.login-menu').addEventListener('click', (e) => e.stopPropagation())


  document.body.appendChild(loginEl)
  loginElement = loginEl
}

const dismissLogin = () => {
  if(loginElement) document.body.removeChild(loginElement)
  loginElement = null
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