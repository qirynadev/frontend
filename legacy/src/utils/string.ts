export function slugify(str: string) {
  return str
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
}

export const isNumeric = (num: any): boolean => {
  return !isNaN(num);
};

// Retire les balises HTML et décode les entités (&nbsp;, &amp;…) via un <textarea> —
// un simple retrait des balises les laisse telles quelles en texte brut.
export const stripHtml = (html?: string | null): string => {
  if (!html) return "";
  const withoutTags = html.replace(/<[^>]*>/g, " ");
  const decoder = document.createElement("textarea");
  decoder.innerHTML = withoutTags;
  return decoder.value.replace(/\s+/g, " ").trim();
};
