// lib/markdown-utils.ts
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Configure marked with syntax highlighting
marked.setOptions({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  highlight: function (code: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('Highlight error:', err);
      }
    }
    return hljs.highlightAuto(code).value;
  },
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
  pedantic: false,
  sanitize: false, // We'll use DOMPurify instead
  smartLists: true,
  smartypants: true, // Smart quotes and dashes
});

/**
 * Convert Markdown to safe HTML with email-friendly styling
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  try {
    // Convert markdown to HTML
    let html = marked(markdown) as string;

    // Add inline styles for email compatibility
    html = addEmailStyles(html);

    // Sanitize HTML to prevent XSS attacks
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'del',
        'a',
        'img',
        'ul',
        'ol',
        'li',
        'blockquote',
        'pre',
        'code',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'hr',
        'div',
        'span',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class'],
      ALLOW_DATA_ATTR: false,
    });

    return clean;
  } catch (error) {
    console.error('Markdown conversion error:', error);
    return '<p>Error converting markdown</p>';
  }
}

/**
 * Add email-friendly inline styles to HTML elements
 */
function addEmailStyles(html: string): string {
  // Headers
  html = html.replace(
    /<h1>/g,
    '<h1 style="font-size: 32px; font-weight: 700; margin: 24px 0 16px; color: #1a1a1a; line-height: 1.25;">',
  );
  html = html.replace(
    /<h2>/g,
    '<h2 style="font-size: 28px; font-weight: 700; margin: 24px 0 16px; color: #1a1a1a; line-height: 1.25;">',
  );
  html = html.replace(
    /<h3>/g,
    '<h3 style="font-size: 24px; font-weight: 600; margin: 20px 0 12px; color: #1a1a1a; line-height: 1.25;">',
  );
  html = html.replace(
    /<h4>/g,
    '<h4 style="font-size: 20px; font-weight: 600; margin: 16px 0 8px; color: #1a1a1a; line-height: 1.25;">',
  );

  // Paragraphs
  html = html.replace(
    /<p>/g,
    '<p style="margin: 16px 0; line-height: 1.6; color: #374151; font-size: 16px;">',
  );

  // Links
  html = html.replace(
    /<a /g,
    '<a style="color: #2563eb; text-decoration: underline;" ',
  );

  // Lists
  html = html.replace(
    /<ul>/g,
    '<ul style="margin: 16px 0; padding-left: 24px; line-height: 1.6;">',
  );
  html = html.replace(
    /<ol>/g,
    '<ol style="margin: 16px 0; padding-left: 24px; line-height: 1.6;">',
  );
  html = html.replace(/<li>/g, '<li style="margin: 8px 0; color: #374151;">');

  // Blockquotes
  html = html.replace(
    /<blockquote>/g,
    '<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 16px 0; color: #6b7280; font-style: italic;">',
  );

  // Code blocks
  html = html.replace(
    /<pre>/g,
    '<pre style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; font-family: monospace; font-size: 14px; line-height: 1.5;">',
  );
  html = html.replace(
    /<code>/g,
    '<code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 14px;">',
  );

  // Images
  html = html.replace(
    /<img /g,
    '<img style="max-width: 100%; height: auto; display: block; margin: 16px auto; border-radius: 8px;" ',
  );

  // Tables
  html = html.replace(
    /<table>/g,
    '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">',
  );
  html = html.replace(
    /<th>/g,
    '<th style="border: 1px solid #e5e7eb; padding: 12px; background-color: #f9fafb; font-weight: 600; text-align: left;">',
  );
  html = html.replace(
    /<td>/g,
    '<td style="border: 1px solid #e5e7eb; padding: 12px;">',
  );

  // Horizontal rule
  html = html.replace(
    /<hr>/g,
    '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 32px 0;">',
  );

  // Strong/Bold
  html = html.replace(
    /<strong>/g,
    '<strong style="font-weight: 700; color: #1a1a1a;">',
  );

  // Emphasis/Italic
  html = html.replace(/<em>/g, '<em style="font-style: italic;">');

  return html;
}

/**
 * Wrap HTML in a complete email template
 */
export function wrapInEmailTemplate(
  html: string,
  subject: string,
  preheader?: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px;
    }
    .preheader {
      display: none;
      max-height: 0;
      overflow: hidden;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div class="preheader">${preheader}</div>` : ''}
  <div class="email-container">
    ${html}
  </div>
</body>
</html>`;
}

/**
 * Calculate reading time from markdown content
 */
export function calculateReadingTime(markdown: string): number {
  const wordsPerMinute = 200;
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Get content statistics
 */
export function getContentStats(markdown: string) {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  const characters = markdown.length;
  const readingTime = calculateReadingTime(markdown);

  // Count links
  const linkMatches = markdown.match(/\[([^\]]+)\]\(([^\)]+)\)/g);
  const links = linkMatches ? linkMatches.length : 0;

  // Count images
  const imageMatches = markdown.match(/!\[([^\]]*)\]\(([^\)]+)\)/g);
  const images = imageMatches ? imageMatches.length : 0;

  // Count headers
  const headerMatches = markdown.match(/^#{1,6}\s/gm);
  const headers = headerMatches ? headerMatches.length : 0;

  return {
    words,
    characters,
    readingTime,
    links,
    images,
    headers,
  };
}

/**
 * Markdown snippets for common patterns
 */
export const markdownSnippets = {
  button: (text: string, url: string) => `[${text}](${url})`,

  image: (alt: string, url: string) => `![${alt}](${url})`,

  callout: (text: string) => `> 💡 **Tip:** ${text}`,

  divider: () => '\n---\n',

  codeBlock: (language: string, code: string) =>
    `\`\`\`${language}\n${code}\n\`\`\``,

  table: () =>
    '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Data 1   | Data 2   | Data 3   |\n',

  toc: (headers: string[]) => {
    return headers
      .map(h => {
        const level = h.match(/^#+/)?.[0].length || 1;
        const text = h.replace(/^#+\s/, '');
        const indent = '  '.repeat(level - 1);
        return `${indent}- [${text}](#${text
          .toLowerCase()
          .replace(/\s+/g, '-')})`;
      })
      .join('\n');
  },
};

/**
 * Validate markdown for common issues
 */
export function validateMarkdown(
  markdown: string,
): Array<{ type: 'warning' | 'error'; message: string }> {
  const issues: Array<{ type: 'warning' | 'error'; message: string }> = [];

  // Check for broken links
  const linkMatches = markdown.match(/\[([^\]]+)\]\(([^\)]+)\)/g);
  if (linkMatches) {
    linkMatches.forEach(link => {
      const url = link.match(/\(([^\)]+)\)/)?.[1];
      if (url && !url.startsWith('http') && !url.startsWith('#')) {
        issues.push({
          type: 'warning',
          message: `Relative URL detected: ${url}. Consider using absolute URLs for emails.`,
        });
      }
    });
  }

  // Check for images without alt text
  const imageMatches = markdown.match(/!\[([^\]]*)\]\(([^\)]+)\)/g);
  if (imageMatches) {
    imageMatches.forEach(img => {
      const alt = img.match(/!\[([^\]]*)\]/)?.[1];
      if (!alt || alt.trim() === '') {
        issues.push({
          type: 'warning',
          message:
            'Image without alt text found. Alt text improves accessibility.',
        });
      }
    });
  }

  // Check content length
  const words = markdown.split(/\s+/).filter(Boolean).length;
  if (words < 50) {
    issues.push({
      type: 'warning',
      message: 'Content seems short. Consider adding more substance.',
    });
  }
  if (words > 2000) {
    issues.push({
      type: 'warning',
      message:
        'Content is quite long. Consider breaking into multiple newsletters.',
    });
  }

  return issues;
}
