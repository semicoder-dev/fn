import "./tailwind.css";
import { UIProvider } from "@semicoder/fn-sdk/ui";
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { native } from "@semicoder/fia/client";
import App from "./RuntimeApp";
import { ThemeProvider } from "./ThemeProvider";
import "./style.css";
function Root() {
  useEffect(() => {
    void native.ready();
  }, []);
  return (
    <UIProvider>
      <ThemeProvider><App /></ThemeProvider>
    </UIProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Root />);
