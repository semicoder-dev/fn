import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { UIProvider } from "@semicoder/fn-sdk/ui";
import "../tailwind.css";
import "../style.css";
import PluginIcon from "../PluginIcon";
import ActivityButton from "../ActivityButton";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const root = createRoot(document.getElementById("fixture")!);
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/></svg>';
const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
const results: string[] = [];
function assert(value: unknown, message: string) {
  if (!value) throw Error(message);
  results.push("PASS " + message);
}
async function show(iconURL: string | null, iconSvg?: string) {
  await act(async () => {
    root.render(
      <UIProvider>
        <nav className="activity-bar" aria-label="图标测试">
          <ActivityButton label="图标插件" className="activity-button active">
            <PluginIcon icon="记" iconURL={iconURL} iconSvg={iconSvg} />
          </ActivityButton>
        </nav>
      </UIProvider>,
    );
  });
}
async function until(condition: () => boolean) {
  const deadline = Date.now() + 5000;
  while (!condition()) {
    if (Date.now() > deadline) throw Error("image did not settle");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 15));
    });
  }
}
async function run() {
  await show(null);
  assert(
    document.querySelector(".plugin-icon")?.textContent === "记",
    "legacy text icon remains visible",
  );
  await show(url);
  await until(() => !!document.querySelector(".plugin-icon-svg"));
  const icon = document.querySelector<HTMLElement>(".plugin-icon-svg")!;
  assert(
    icon.getAttribute("aria-hidden") === "true",
    "decorative icon keeps the button accessible name",
  );
  assert(!icon.querySelector("svg"), "SVG markup never enters the host DOM");
  for (const theme of ["light", "dark"]) {
    document.documentElement.dataset.theme = theme;
    const style = getComputedStyle(icon),
      button = getComputedStyle(icon.parentElement!);
    assert(style.backgroundColor === button.color, `${theme} mask inherits the button foreground`);
    assert(style.width === "20px" && style.height === "20px", `${theme} sidebar icon stays 20px`);
  }
  await show("/missing-plugin-icon.svg");
  assert(
    !document.querySelector(".plugin-icon-svg"),
    "replacement URL clears the old mask immediately",
  );
  assert(
    document.querySelector(".plugin-icon")?.textContent === "记",
    "failed resource retains the text fallback",
  );
  await show(null, svg);
  await until(() => !!document.querySelector(".plugin-icon-svg"));
  assert(
    !!document.querySelector(".plugin-icon-svg"),
    "market SVG renders before plugin installation",
  );
  await show(null, '<svg><path d="broken"></svg>');
  assert(
    document.querySelector(".plugin-icon")?.textContent === "记",
    "undecodable SVG retains the text fallback",
  );
  await show(null, svg.replace("M4 4h16v16H4z", "M12 2v20M2 12h20"));
  await until(() => !!document.querySelector(".plugin-icon-svg"));
  assert(
    !!document.querySelector(".plugin-icon-svg"),
    "a new icon can recover after a failed load",
  );
  await act(async () => {
    root.unmount();
  });
  document.getElementById("results")!.textContent = results.join("\n") + "\nALL PASS";
}
void run().catch((error) => {
  document.getElementById("results")!.textContent = results.join("\n") + "\nFAIL " + String(error);
});
