import { ContentPiece } from "@/data/mockContent";

/**
 * Extract a short preview text from content for voice synthesis
 * @param content The content piece to extract preview from
 * @returns A shortened text suitable for TTS (30-60 seconds of speech)
 */
export function getPreviewText(content: ContentPiece): string {
  if (content.type === "tiktok") {
    // For TikTok: use hook + first 6 lines of script (removes shot notes)
    const base = content.hook || content.title;
    const scriptLines = content.content
      .split("\n")
      .filter(line => !line.includes("SHOT NOTES"))
      .slice(0, 6)
      .join("\n");

    return `${base}\n\n${scriptLines}`;
  }

  if (content.type === "twitter") {
    // For Twitter: first tweet in the thread (before first double newline)
    const tweets = content.content.split("\n\n");
    return tweets[0] || content.title;
  }

  if (content.type === "linkedin") {
    // For LinkedIn: title + first paragraph
    const paragraphs = content.content.split("\n\n");
    return `${content.title}\n\n${paragraphs[0]}`;
  }

  if (content.type === "newsletter") {
    // For Newsletter: subject line + first 3 sections
    const sections = content.content.split("\n\n").slice(0, 3);
    return sections.join("\n\n");
  }

  // Fallback: first 500 characters
  return content.content.slice(0, 500);
}
