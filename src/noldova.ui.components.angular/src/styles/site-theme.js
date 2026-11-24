/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

(() => {
  const modes = new Map([["light", "Light"], ["dark", "Dark"]]);
  const root = document.documentElement;
  let stored = null;
  try {
    stored = localStorage.getItem("noldova-theme");
  }
  catch {
    stored = null;
  }
  const choice = stored === "light" || stored === "dark" ? stored : "system";
  const mode = modes.get(choice);
  if (mode === undefined)
    root.removeAttribute("data-nol-theme-mode");
  else
    root.setAttribute("data-nol-theme-mode", mode);
  root.setAttribute("data-nol-site-theme", choice);
  const press = () => {
    const value = mode ?? "System";
    for (const pill of document.querySelectorAll(".nol-site-theme-switch .nol-choice-pill-icon")) {
      const checked = pill.getAttribute("data-nol-value") === value;
      pill.setAttribute("aria-checked", String(checked));
      pill.setAttribute("tabindex", checked ? "0" : "-1");
      pill.classList.toggle("nol-choice-pill-selected", checked);
    }
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", press, { once: true });
  else
    press();
})();
