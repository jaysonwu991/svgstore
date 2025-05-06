/**
 * Utility to remove specific attributes from all
 * child nodes of a given node.
 */
const removeAttributes = (el: JQuery<HTMLElement>, attrs: string[] | boolean) => {
  let localAttrs = attrs;

  if (localAttrs === true) {
    localAttrs = ['style'];
  }

  if (!localAttrs || !localAttrs.length) {
    return el;
  }

  const els = el.find('*');

  els.each(function (i: number) {
    if (Array.isArray(localAttrs)) {
      localAttrs.forEach(function (attr: string) {
        els.eq(i).removeAttr(attr);
      });
    }
  });

  return el;
};

export default removeAttributes;
