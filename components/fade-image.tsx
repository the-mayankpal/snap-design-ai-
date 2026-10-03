"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/** `next/image`, hidden until fully loaded and decoded, then faded in — never painted in strips. */
export function FadeImage({ className = "", onLoad, alt, ...props }: ImageProps) {
  const [shown, setShown] = useState(false);
  return (
    <Image
      {...props}
      alt={alt}
      onLoad={(event) => {
        const image = event.currentTarget;
        image.decode().then(
          () => setShown(true),
          () => setShown(true),
        );
        onLoad?.(event);
      }}
      className={`transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        shown ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );
}
