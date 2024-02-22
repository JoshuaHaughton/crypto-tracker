import { Fragment } from "react";
import { IMatchDetail } from "@/lib/types/coinTypes";

interface IHighlightMatchedTextProps {
  text: string;
  match: IMatchDetail | undefined;
  highlightColor?: string;
  styles?: { readonly [key: string]: string };
}

/**
 * Renders text with highlighted segments based on provided match indices.
 * This component splits the text into segments: those matching the query and those not,
 * and applies highlighting to the matching segments.
 * Allows customization of highlight color or style through props.
 *
 * @param {IHighlightMatchedTextProps} props - The component props including text, match indices, and optional styling.
 * @returns {React.ReactNode} - The text with highlighted segments, or the original text if no match is provided.
 */
const HighlightMatchedText = ({
  text,
  match,
  highlightColor,
  styles,
}: IHighlightMatchedTextProps): React.ReactNode => {
  // If no match details are provided, return the original text.
  if (!match) return text;

  // Initialize an array to hold the parts of the text, segmented for highlighting.
  const parts: React.ReactNode[] = [];
  let lastIndex = 0; // Tracks the index of the last segment added to 'parts'.

  // Iterate over the match indices in pairs.
  for (let i = 0; i < match.length; i += 2) {
    const start = match[i]; // Start index of the current match.
    const end = match[i + 1]; // End index of the current match.

    // Add text before the current match, if there is any.
    if (start > lastIndex) {
      parts.push(
        <Fragment key={`text-before-${i}`}>
          {text.substring(lastIndex, start)}
        </Fragment>,
      );
    }

    // Add the matched text segment with highlighting.
    parts.push(
      <mark
        key={`match-${i}`}
        style={highlightColor ? { backgroundColor: highlightColor } : undefined} // Apply the highlight color if provided.
        className={styles ? styles.highlighted : undefined} // Apply custom styling if provided.
      >
        {text.substring(start, end)}
      </mark>,
    );

    lastIndex = end; // Update lastIndex for the next iteration.
  }

  // Add any remaining text after the last match.
  if (lastIndex < text.length) {
    parts.push(
      <Fragment key="text-after-last-match">
        {text.substring(lastIndex)}
      </Fragment>,
    );
  }

  // Combine and return all parts.
  return <>{parts}</>;
};

export default HighlightMatchedText;
