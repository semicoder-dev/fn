import React, { useEffect, useState } from "react";

/** SVG stays in image context; the mask inherits the surrounding foreground color. */
export default function PluginIcon({
  icon,
  iconURL,
  iconSvg,
}: {
  icon: string;
  iconURL?: string | null;
  iconSvg?: string;
}) {
  const source =
    iconURL ?? (iconSvg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg)}` : null);
  const [loaded, setLoaded] = useState<string | null>(null);
  useEffect(() => {
    setLoaded(null);
    if (!source) return;
    const image = new Image();
    image.onload = () => setLoaded(source);
    image.onerror = () => setLoaded(null);
    image.src = source;
    return () => {
      image.onload = image.onerror = null;
    };
  }, [source]);
  const ready = source !== null && loaded === source;
  const mask = ready ? `url(${JSON.stringify(source)})` : undefined;
  return (
    <span
      aria-hidden="true"
      className={`plugin-icon${ready ? " plugin-icon-svg" : ""}`}
      style={ready ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    >
      {ready ? null : icon}
    </span>
  );
}
