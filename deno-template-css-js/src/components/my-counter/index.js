import css from "./style.css?inline";

export default class MyCounter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <button disabled class="decrement" type="button" onclick="this.getRootNode().host.count--">-</button>
      <span>count is ${this.count}</span>
      <button class="increment" type="button" onclick="this.getRootNode().host.count++">+</button>
      <style>${css}</style>
    `;
    this.span = this.shadowRoot.querySelector("span");
  }

  get count() {
    return this.getAttribute("count");
  }

  set count(count) {
    if (+count <= 0) {
      count = 0;
      this.shadowRoot.querySelector(".decrement").setAttribute("disabled", "");
    } else {
      this.shadowRoot.querySelector(".decrement").removeAttribute("disabled");
    }
    this.setAttribute("count", count);
    this.span.innerHTML = `count is ${count}`;
  }
}

customElements.define("my-counter", MyCounter);
