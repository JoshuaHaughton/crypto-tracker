import { IMatchDetail } from "@/lib/types/coinTypes";

interface IHighlightMatchedTextProps {
  text: string;
  match: IMatchDetail | undefined;
  highlightColor?: string; // Optional color for highlighting text
  styles?: {
    readonly [key: string]: string;
  }; // Optional CSS module styles
}

/**
 * Renders text with highlighted segments based on provided match indices.
 * This function takes a single tuple representing the start and end indices of a relevant match within the text.
 * Allows customization of highlight color or style through props.
 *
 * @param {IHighlightMatchedTextProps} props - Props including text to highlight, match indices, and optional styling options.
 * @returns {React.ReactNode} - The text with highlighted segments. Returns the original text if no match is provided.
 */
const HighlightMatchedText = ({
  text,
  match,
  highlightColor,
  styles,
}: IHighlightMatchedTextProps): React.ReactNode => {
  // Check if there is a match to highlight, otherwise return the original text
  if (!match) return text;

  // Extract start and end indices from the match tuple
  const [start, end] = match;

  // Create the highlighted text parts
  const beforeMatch = text.substring(0, start);
  const matchedText = text.substring(start, end);
  const afterMatch = text.substring(end + 1);

  // Construct the final output with highlighted match
  return (
    <>
      {beforeMatch}
      <mark
        style={{ backgroundColor: highlightColor }} // Apply highlight color
        className={styles?.highlighted} // Apply custom styling if provided
      >
        {matchedText}
      </mark>
      {afterMatch}
    </>
  );
};

export default HighlightMatchedText;
