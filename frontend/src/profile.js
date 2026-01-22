import { getUser } from "./util/bridge.js";

const user = await getUser()

if(user) {
  startProfileFlow()
} else {
  startProfileLoginFlow()
}

function startProfileFlow() {
  
}

function startProfileLoginFlow() {
  const tpl = document.getElementById("login-form-template");
  const node = tpl.content.cloneNode(true);

  const loginMenuElement = node.querySelector('.login-menu')

  document.body.appendChild(loginMenuElement)
}