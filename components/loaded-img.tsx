"use client";

import { useState, type ImgHTMLAttributes } from "react";

/**
 * An <img> that stays invisible until it is fully downloaded and decoded,
 * then fades in — never painted top-to-bottom as it arrives. The parent
 * shows the placeholder (a flat fill or a pulse) behind it.
 */
export function LoadedImg({ className = "", onLoad, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [shown, setShown] = useState(false);

  const reveal = (image: HTMLImageElement) => {
    // decode() resolves once the whole image can paint in one frame.
    image.decode().then(
      () => setShown(true),
      () => setShown(true),
    );
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      {...props}
      ref={(image) => {
        // Already in the browser cache: no load event will come.
        if (image?.complete && image.naturalWidth) reveal(image);
      }}
      onLoad={(event) => {
        reveal(event.currentTarget);
        onLoad?.(event);
      }}
      className={`transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        shown ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );
}
