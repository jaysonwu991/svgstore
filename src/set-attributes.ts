/**
 * Sets attributes on an element, allowing values to be functions for dynamic updates.
 */
const setAttributes = (
  el: { attr: (name: string, value?: string) => string | undefined },
  attrs: Record<string, string | ((currentValue: string | undefined) => string)>
) => {
  if (!attrs || typeof attrs !== 'object') return el;

  for (const [attr, value] of Object.entries(attrs)) {
    const newValue = typeof value === 'function' ? value(el.attr(attr)) : value;
    el.attr(attr, newValue);
  }

  return el;
};

export default setAttributes;
