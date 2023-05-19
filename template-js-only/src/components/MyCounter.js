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
      <style>
        button {
          border-radius: 8px;
          border: 1px solid transparent;
          padding: 1em;
          font-size: 1.2em;
          font-weight: 500;
          font-family: inherit;
          background-color: #1a1a1a;
          cursor: pointer;
          transition: border-color 0.25s;
          width: 2em;
          height: 2em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        button:hover {
          border-color: #646cff;
        }

        button:disabled:hover {
          border-color: transparent;
        }

        button:focus,
        button:focus-visible {
          outline: 4px auto -webkit-focus-ring-color;
        }

        span {
          display: inline-block;
          width: 6em;
        }

        button:disabled {
          cursor: not-allowed;
        }

        button:disabled:focus,
        button:disabled:focus-visible {
          outline: none;
        }

        @media (prefers-color-scheme: light) {
          button {
            background-color: #ececec;
          }
        }
      </style>
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
