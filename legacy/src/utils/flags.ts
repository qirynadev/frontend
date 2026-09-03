/**
 * Circular flag SVGs rendered inline as CSS background-image data-URIs.
 * No external assets — used by the Home marketing sections (Fiches écoles,
 * Hébergement, Langues). Approximated at small render sizes (24-30px).
 */
const FLAGS: Record<string, string> = {
  fr: "<rect width='20' height='60' x='0' fill='%23002395'/><rect width='20' height='60' x='20' fill='%23fff'/><rect width='20' height='60' x='40' fill='%23ED2939'/>",
  de: "<rect width='60' height='20' y='0' fill='%23000'/><rect width='60' height='20' y='20' fill='%23DD0000'/><rect width='60' height='20' y='40' fill='%23FFCE00'/>",
  es: "<rect width='60' height='60' fill='%23AA151B'/><rect width='60' height='30' y='15' fill='%23F1BF00'/>",
  ar: "<rect width='60' height='60' fill='%23006233'/><circle cx='30' cy='30' r='9' fill='none' stroke='%23fff' stroke-width='2.5'/>",
  uk: "<rect width='60' height='60' fill='%23012169'/><path d='M0 0l60 60M60 0L0 60' stroke='%23fff' stroke-width='10'/><path d='M0 0l60 60M60 0L0 60' stroke='%23C8102E' stroke-width='5'/><path d='M30 0v60M0 30h60' stroke='%23fff' stroke-width='16'/><path d='M30 0v60M0 30h60' stroke='%23C8102E' stroke-width='9'/>",
  us: "<rect width='60' height='60' fill='%23fff'/><g fill='%23B22234'><rect width='60' height='5' y='0'/><rect width='60' height='5' y='9.2'/><rect width='60' height='5' y='18.4'/><rect width='60' height='5' y='27.6'/><rect width='60' height='5' y='36.8'/><rect width='60' height='5' y='46'/><rect width='60' height='5' y='55.2'/></g><rect width='28' height='32' fill='%233C3B6E'/>",
  ca: "<rect width='60' height='60' fill='%23fff'/><rect width='16' height='60' x='0' fill='%23FF0000'/><rect width='16' height='60' x='44' fill='%23FF0000'/><path d='M30 16l2.5 6 6-1.5-3 5 3 2-6 1 .5 6-3-3.5-3 3.5.5-6-6-1 3-2-3-5 6 1.5z' fill='%23FF0000'/>",
  cn: "<rect width='60' height='60' fill='%23DE2910'/><path d='M16 14l2.4 5 5.4.4-4.1 3.5 1.3 5.3-4.4-2.9-4.4 2.9 1.3-5.3-4.1-3.5 5.4-.4z' fill='%23FFDE00'/><circle cx='30' cy='12' r='1.6' fill='%23FFDE00'/><circle cx='34' cy='17' r='1.6' fill='%23FFDE00'/><circle cx='34' cy='24' r='1.6' fill='%23FFDE00'/><circle cx='30' cy='29' r='1.6' fill='%23FFDE00'/>",
};

export const flagBg = (code: string): string => {
  const inner = FLAGS[code] ?? FLAGS.uk;
  return `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><clipPath id='c'><circle cx='30' cy='30' r='30'/></clipPath><g clip-path='url(%23c)'>${inner}</g></svg>")`;
};
