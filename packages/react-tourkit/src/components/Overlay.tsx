import { useEffect, useState } from "react";
import scrollparent from "scrollparent";

export default function Overlay({
  target,
  highlight,
  padding = 0,
  radius = 6,
  highlightHorizonOverflow = false,
}: {
  target?: HTMLElement | null;
  highlight: boolean;
  radius?: number;
  padding?: number;
  highlightHorizonOverflow?: boolean;
}) {
  const [path, setPath] = useState("");

  useEffect(() => {
    document.body.classList.add("tourkit-body");
    if (target) {
      target.classList.add("tourkit-target");
    }

    return () => {
      document.body.classList.remove("tourkit-body");
      if (target) {
        target.classList.remove("tourkit-target");
      }
    };
  }, [target]);

  useEffect(() => {
    const callback = () => {
      if (!target) {
        return;
      }

      const windowX = window.innerWidth;
      const windowY = window.innerHeight;

      let rect = target.getBoundingClientRect();
      const parent = target.parentElement;
      let isHorizonOverflow = false;
      if (parent) {
        isHorizonOverflow = parent.clientWidth < parent.scrollWidth;
        if (isHorizonOverflow && highlightHorizonOverflow === false) {
          rect = Object.assign(rect, {
            width: parent.clientWidth,
            height: target.clientHeight,
            x: parent.getBoundingClientRect().x,
            y: target.getBoundingClientRect().y,
          });
        }
      }

      const stageWidth = rect.width + padding * 2;
      const stageHeight = rect.height + padding * 2;

      const limitedRadius = Math.min(radius, stageWidth / 2, stageHeight / 2);

      const normalizedRadius = Math.floor(Math.max(limitedRadius, 0));

      const highlightBoxX = rect.x - padding + normalizedRadius;
      const highlightBoxY = rect.y - padding;
      const highlightBoxWidth = stageWidth - normalizedRadius * 2;
      const highlightBoxHeight = stageHeight - normalizedRadius * 2;

      setPath(`M${windowX},0L0,0L0,${windowY}L${windowX},${windowY}L${windowX},0Z
    M${highlightBoxX},${highlightBoxY} h${highlightBoxWidth} a${normalizedRadius},${normalizedRadius} 0 0 1 ${normalizedRadius},${normalizedRadius} v${highlightBoxHeight} a${normalizedRadius},${normalizedRadius} 0 0 1 -${normalizedRadius},${normalizedRadius} h-${highlightBoxWidth} a${normalizedRadius},${normalizedRadius} 0 0 1 -${normalizedRadius},-${normalizedRadius} v-${highlightBoxHeight} a${normalizedRadius},${normalizedRadius} 0 0 1 ${normalizedRadius},-${normalizedRadius} z`);
    };

    window.addEventListener("resize", callback);
    document.addEventListener("scroll", callback, true);

    let scrollParent = null;
    if (target) {
      scrollParent = scrollparent(target);
      scrollParent?.addEventListener("scroll", callback, true);
    }

    callback();

    return () => {
      window.removeEventListener("resize", callback);
      document.removeEventListener("scroll", callback, true);
      if (scrollParent) {
        scrollParent.removeEventListener("scroll", callback, true);
      }
    };
  }, [target, padding, radius]);

  if (!target || !highlight) {
    return <div id="tourkit-overlay" />;
  }

  return (
    <svg id="tourkit-overlay">
      <path d={path} />
    </svg>
  );
}
