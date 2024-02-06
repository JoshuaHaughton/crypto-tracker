import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

/**
 * Extends the standard ImageProps from Next.js to include a fallback source URL.
 * @interface ImageWithFallbackProps - Custom properties for the ImageWithFallback component.
 */
interface ImageWithFallbackProps extends ImageProps {
  /**
   * URL for the fallback image to be displayed in case of an error loading the main image.
   */
  fallbackSrc: string;
}

/**
 * A custom Image component that attempts to load an image from `src`,
 * and on failure, loads the image from `fallbackSrc`.
 * Utilizes Next.js Image component for optimized image delivery.
 *
 * @param {ImageWithFallbackProps} props - The properties including src, fallbackSrc, and other standard image props.
 * @returns {JSX.Element} - A Next.js Image component with error handling for fallback source.
 */
const ImageWithFallback = ({
  src,
  fallbackSrc,
  alt = "", // Default to an empty string if `alt` is not provided
  ...rest
}: ImageWithFallbackProps): JSX.Element => {
  // Use a state that can handle both string and StaticImport types
  const [currentSrc, setCurrentSrc] = useState<string | StaticImport>(src);

  const handleError = () => setCurrentSrc(fallbackSrc);

  return (
    <Image
      {...rest}
      src={currentSrc}
      alt={alt}
      onError={handleError}
      // `onError` event triggers when the image fails to load. It sets the source to the fallback URL.
    />
  );
};

export default ImageWithFallback;
