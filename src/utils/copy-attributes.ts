/**
 * Copies specific attributes from one node to another.
 */
const ALWAYS_COPY_ATTRS = ['viewBox', 'aria-labelledby', 'role'];

const copyAttributes = (
  a: { attr: (name: string, value?: string) => void },
  b: { attr: (name: string) => string | null },
  attrs: string[],
) => {
  const attrsToCopy = [...ALWAYS_COPY_ATTRS, ...attrs];
  const copiedAttrs = new Set<string>();

  attrsToCopy.forEach((attr) => {
    if (!attr || copiedAttrs.has(attr)) return;

    copiedAttrs.add(attr);
    const bAttr = b.attr(attr);

    if (bAttr != null) {
      a.attr(attr, bAttr);
    }
  });

  return a;
};

export default copyAttributes;
