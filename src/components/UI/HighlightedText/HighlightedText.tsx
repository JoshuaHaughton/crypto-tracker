import { IMatchDetail } from "@/lib/types/coinTypes";
import React from "react";

/**
 * Props for the HighlightedText component, adjusted to accept match ranges directly.
 */
interface IHighlightedTextProps {
  text: string; // The original text to be highlighted
  matchDetails: IMatchDetail[]; // Array of [start, end] tuples for highlighting
}

/**
 * Renders text with parts of it highlighted based on provided match ranges.
 * Each matched segment is wrapped in a <mark> tag for highlighting.
 *
 * @param props The props for the HighlightedText component.
 * @returns A JSX element representing the text with highlighted segments.
 */
const HighlightedText: React.FC<IHighlightedTextProps> = ({
  text,
  matchDetails,
}) => {
  // If no matches, return the original text wrapped in a span
  if (!matchDetails.length) return <span>{text}</span>;

  // Variable to hold the last index processed to ensure we add all text segments
  let lastIndex = 0;
  const highlighted: JSX.Element[] = matchDetails.reduce(
    (acc, [start, end], index) => {
      // Add non-matched text before the current match
      if (start > lastIndex) {
        acc.push(
          <span key={`non-match-${index}`}>
            {text.substring(lastIndex, start)}
          </span>,
        );
      }
      // Add matched text
      acc.push(
        <mark key={`match-${index}`}>{text.substring(start, end + 1)}</mark>,
      );
      lastIndex = end + 1;
      return acc;
    },
    [] as JSX.Element[],
  );

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    highlighted.push(<span key="remainder">{text.substring(lastIndex)}</span>);
  }

  return <>{highlighted}</>;
};

export default HighlightedText;
