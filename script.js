const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");

const state = {
  current: "0",
  previous: null,
  operator: null,
  overwrite: false,
  error: false,
};

const OP_SYMBOLS = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

function formatNumber(value) {
  if (value === "Error") return "Error";
  const num = Number(value);
  if (!Number.isFinite(num)) return "Error";
  return String(Number(num.toPrecision(12)));
}

function render() {
  resultEl.textContent = state.current;
  if (state.previous !== null && state.operator) {
    expressionEl.textContent = `${state.previous} ${OP_SYMBOLS[state.operator]}`;
  } else {
    expressionEl.textContent = "";
  }
}

function resetAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.overwrite = false;
  state.error = false;
  render();
}

function inputDigit(digit) {
  if (state.error) resetAll();

  if (state.overwrite) {
    state.current = digit === "." ? "0." : digit;
    state.overwrite = false;
    render();
    return;
  }

  if (digit === ".") {
    if (!state.current.includes(".")) {
      state.current += ".";
    }
  } else if (state.current === "0") {
    state.current = digit;
  } else {
    state.current += digit;
  }
  render();
}

function compute(a, b, op) {
  const x = Number(a);
  const y = Number(b);
  switch (op) {
    case "+":
      return formatNumber(x + y);
    case "-":
      return formatNumber(x - y);
    case "*":
      return formatNumber(x * y);
    case "/":
      if (y === 0) return "Error";
      return formatNumber(x / y);
    default:
      return formatNumber(y);
  }
}

function chooseOperator(op) {
  if (state.error) return;

  if (state.operator && !state.overwrite && state.previous !== null) {
    const res = compute(state.previous, state.current, state.operator);
    if (res === "Error") {
      state.current = "Error";
      state.previous = null;
      state.operator = null;
      state.error = true;
      render();
      return;
    }
    state.current = res;
    state.previous = res;
  } else {
    state.previous = state.current;
  }

  state.operator = op;
  state.overwrite = true;
  render();
}

function evaluate() {
  if (state.error || state.operator === null || state.previous === null) return;

  const res = compute(state.previous, state.current, state.operator);
  expressionEl.textContent = `${state.previous} ${OP_SYMBOLS[state.operator]} ${state.current} =`;
  state.current = res;
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
  state.error = res === "Error";
  resultEl.textContent = state.current;
}

function backspace() {
  if (state.error || state.overwrite) {
    state.current = "0";
    state.overwrite = false;
    state.error = false;
    render();
    return;
  }
  state.current = state.current.length > 1 ? state.current.slice(0, -1) : "0";
  if (state.current === "-") state.current = "0";
  render();
}

function toggleSign() {
  if (state.error || state.current === "0") return;
  state.current = state.current.startsWith("-")
    ? state.current.slice(1)
    : `-${state.current}`;
  render();
}

function applyPercent() {
  if (state.error) return;
  state.current = formatNumber(Number(state.current) / 100);
  render();
}

document.querySelector(".keypad").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.num !== undefined) inputDigit(btn.dataset.num);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else if (btn.dataset.action === "clear") resetAll();
  else if (btn.dataset.action === "backspace") backspace();
  else if (btn.dataset.action === "percent") applyPercent();
  else if (btn.dataset.action === "toggle-sign") toggleSign();
  else if (btn.dataset.action === "equals") evaluate();
});

document.addEventListener("keydown", (e) => {
  if ((e.key >= "0" && e.key <= "9") || e.key === ".") {
    inputDigit(e.key);
  } else if (["+", "-", "*", "/"].includes(e.key)) {
    chooseOperator(e.key);
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    evaluate();
  } else if (e.key === "Backspace") {
    backspace();
  } else if (e.key === "Escape") {
    resetAll();
  } else if (e.key === "%") {
    applyPercent();
  }
});

render();
