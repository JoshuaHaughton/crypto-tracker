"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { useInView } from "react-intersection-observer";
import styles from "./ImageWithFallback.module.scss";

export const DEFAULT_IMAGE_FALLBACK_SRC = "/skeleton.png";

interface ImageWithFallbackProps extends ImageProps {
  src: string;
  alt: string;
}

const ImageWithFallback = ({
  src,
  alt = "",
  width,
  height,
  ...rest
}: ImageWithFallbackProps): JSX.Element => {
  const [isLoaded, setIsLoaded] = useState(false); // Tracks if image has loaded.
  const [currentSrc, setCurrentSrc] = useState(src);
  const { ref } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  // Combine container class based on load status
  const containerClassNames = `${styles.container} ${
    isLoaded ? styles.loaded : ""
  }`;

  // Handle image loading complete and error.
  const handleLoadingComplete = () => setIsLoaded(true);
  const handleError = () => {
    setCurrentSrc(DEFAULT_IMAGE_FALLBACK_SRC);
    setIsLoaded(true); // Assume loaded for fallback image
  };

  return (
    <div
      ref={ref}
      className={containerClassNames}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
      }}
    >
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoadingComplete}
        className={styles.image}
        {...rest}
      />
    </div>
  );
};

export default ImageWithFallback;
