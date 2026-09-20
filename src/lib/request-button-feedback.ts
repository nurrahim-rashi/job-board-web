type ButtonCandidate = {
  button: HTMLButtonElement;
  wasDisabled: boolean;
};

const requestButtons = new WeakMap<object, ButtonCandidate>();
const activeRequests = new WeakMap<HTMLButtonElement, number>();
let candidate: ButtonCandidate | null = null;
let installed = false;

const loadingLabel = (button: HTMLButtonElement) => {
  if (button.dataset.loadingLabel) return button.dataset.loadingLabel;
  const label = (button.textContent || button.getAttribute("aria-label") || "")
    .trim()
    .toLowerCase();

  if (label.includes("sign in")) return "Signing in…";
  if (label.includes("sign out")) return "Signing out…";
  if (label.includes("resend") || label.includes("send")) return "Sending…";
  if (label.includes("save")) return "Saving…";
  if (label.includes("update")) return "Updating…";
  if (label.includes("delete") || label.includes("remove")) return "Removing…";
  if (label.includes("upload")) return "Uploading…";
  if (label.includes("generate")) return "Generating…";
  if (label.includes("apply")) return "Applying…";
  if (label.includes("subscribe") || label.includes("upgrade"))
    return "Processing…";
  if (label.includes("confirm") || label.includes("verify"))
    return "Confirming…";
  if (label.includes("create") || label.includes("post")) return "Creating…";
  return "Loading…";
};

function install() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  const rememberCandidate = (button: HTMLButtonElement) => {
    if (
      button.disabled ||
      button.dataset.noRequestLoading !== undefined ||
      // A switch flips in place. Swapping its knob for a "Loading…" label
      // makes the control look broken, so toggles never get this treatment.
      button.getAttribute("role") === "switch"
    )
      return;

    const current = { button, wasDisabled: button.disabled };
    candidate = current;
    window.setTimeout(() => {
      if (candidate === current) candidate = null;
    }, 0);
  };

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button");
      if (!(button instanceof HTMLButtonElement)) return;
      rememberCandidate(button);
    },
    true,
  );

  // Keyboard-submitted forms do not emit a click on their submit button.
  document.addEventListener(
    "submit",
    (event) => {
      if (!(event instanceof SubmitEvent)) return;
      const submitter = event.submitter;
      if (submitter instanceof HTMLButtonElement) rememberCandidate(submitter);
    },
    true,
  );
}

export function beginRequestButtonFeedback(config: object) {
  install();
  if (!candidate) return;

  const current = candidate;
  candidate = null;
  requestButtons.set(config, current);
  const count = activeRequests.get(current.button) ?? 0;
  activeRequests.set(current.button, count + 1);
  current.button.dataset.requestLoadingLabel = loadingLabel(current.button);
  current.button.style.setProperty(
    "--request-loading-color",
    window.getComputedStyle(current.button).color,
  );
  current.button.classList.add("is-request-loading");
  current.button.setAttribute("aria-busy", "true");
  current.button.disabled = true;
}

export function endRequestButtonFeedback(config?: object) {
  if (!config) return;
  const current = requestButtons.get(config);
  if (!current) return;
  requestButtons.delete(config);

  const remaining = Math.max(
    0,
    (activeRequests.get(current.button) ?? 1) - 1,
  );
  if (remaining > 0) {
    activeRequests.set(current.button, remaining);
    return;
  }

  activeRequests.delete(current.button);
  if (!current.button.isConnected) return;
  current.button.classList.remove("is-request-loading");
  current.button.removeAttribute("aria-busy");
  delete current.button.dataset.requestLoadingLabel;
  current.button.style.removeProperty("--request-loading-color");
  current.button.disabled = current.wasDisabled;
}

install();
