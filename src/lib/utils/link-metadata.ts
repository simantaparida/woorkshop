export interface ReferenceLink {
  url: string;
  title: string;
  favicon: string;
  type: LinkType;
}

export type LinkType = 'jira' | 'figma' | 'notion' | 'github' | 'confluence' | 'miro' | 'google_docs' | 'linear' | 'asana' | 'trello' | 'other';

// Detect link type based on URL
export function detectLinkType(url: string): LinkType {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('jira') || urlLower.includes('atlassian.net')) {
    return 'jira';
  }
  if (urlLower.includes('figma.com')) {
    return 'figma';
  }
  if (urlLower.includes('notion.so') || urlLower.includes('notion.site')) {
    return 'notion';
  }
  if (urlLower.includes('github.com')) {
    return 'github';
  }
  if (urlLower.includes('confluence')) {
    return 'confluence';
  }
  if (urlLower.includes('miro.com')) {
    return 'miro';
  }
  if (urlLower.includes('docs.google.com') || urlLower.includes('drive.google.com')) {
    return 'google_docs';
  }
  if (urlLower.includes('linear.app')) {
    return 'linear';
  }
  if (urlLower.includes('asana.com')) {
    return 'asana';
  }
  if (urlLower.includes('trello.com')) {
    return 'trello';
  }

  return 'other';
}

// Get icon for link type
export function getLinkTypeIcon(type: LinkType): string {
  const icons: Record<LinkType, string> = {
    jira: '📋',
    figma: '🎨',
    notion: '📝',
    github: '💻',
    confluence: '📄',
    miro: '🖼️',
    google_docs: '📊',
    linear: '📈',
    asana: '✅',
    trello: '📌',
    other: '🔗',
  };

  return icons[type] || icons.other;
}

// Get display name for link type
export function getLinkTypeName(type: LinkType): string {
  const names: Record<LinkType, string> = {
    jira: 'Jira',
    figma: 'Figma',
    notion: 'Notion',
    github: 'GitHub',
    confluence: 'Confluence',
    miro: 'Miro',
    google_docs: 'Google Docs',
    linear: 'Linear',
    asana: 'Asana',
    trello: 'Trello',
    other: 'Link',
  };

  return names[type] || names.other;
}

// Get favicon URL from a given URL
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Use Google's favicon service as a reliable fallback
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return '';
  }
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

// Create a reference link object with metadata
export function createReferenceLink(url: string, title?: string): ReferenceLink {
  const type = detectLinkType(url);
  const favicon = getFaviconUrl(url);
  const domain = extractDomain(url);

  return {
    url,
    title: title || `${getLinkTypeName(type)} - ${domain}`,
    favicon,
    type,
  };
}
