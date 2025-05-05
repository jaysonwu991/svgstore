import copyAttributes from './utils/copy-attributes';
import loadXml from './utils/load-xml';
import removeAttributes from './utils/remove-attributes';
import setAttributes from './utils/set-attributes';
import svgToSymbol from './utils/svg-to-symbol';

const SELECTOR_SVG = 'svg';
const SELECTOR_DEFS = 'defs';

const TEMPLATE_SVG = '<svg><defs/></svg>';
const TEMPLATE_DOCTYPE =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
  '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

const DEFAULT_OPTIONS = {
  cleanDefs: false,
  cleanSymbols: false,
  inline: false,
  svgAttrs: false as Record<string, string | ((currentValue: string | undefined) => string)> | false,
  symbolAttrs: false as Record<string, string | ((currentValue: string | undefined) => string)> | false,
  copyAttrs: false,
  renameDefs: false,
};

function svgstore(options?: Record<string, any>) {
  const svgstoreOptions = { ...DEFAULT_OPTIONS, ...options };

  const parent = loadXml(TEMPLATE_SVG);
  const parentSvg = parent(SELECTOR_SVG);
  const parentDefs = parent(SELECTOR_DEFS);

  const renameDefs = (id: string, child: cheerio.Root) => {
    child(SELECTOR_DEFS)
      .children()
      .each((_i, elem) => {
        const element = child(elem);
        const oldDefId = element.attr('id');
        const newDefId = `${id}_${oldDefId}`;
        element.attr('id', newDefId);

        // Update <use> tags
        child('use').each((_i, use) => {
          const hrefLink = `#${oldDefId}`;
          const property = ['xlink:href', 'href'].find((prop) => child(use).prop(prop) === hrefLink);
          if (property) child(use).attr(property, `#${newDefId}`);
        });

        // Update fill attributes
        child(`[fill="url(#${oldDefId})"]`).each((_i, use) => {
          child(use).attr('fill', `url(#${newDefId})`);
        });
      });
  };

  return {
    element: parent,

    add(id: string, file: string, options?: Record<string, any>) {
      const child = loadXml(file);
      const addOptions = { ...svgstoreOptions, ...options };

      // Handle <defs>
      const childDefs = child(SELECTOR_DEFS);
      removeAttributes(childDefs as unknown as JQuery<HTMLElement>, addOptions.cleanDefs);

      if (addOptions.renameDefs) renameDefs(id, child);

      parentDefs.append(childDefs.contents());
      childDefs.remove();

      // Handle <symbol>
      const childSvg = child(SELECTOR_SVG);
      const childSymbol = svgToSymbol(id, child);

      removeAttributes(childSymbol as unknown as JQuery<HTMLElement>, addOptions.cleanSymbols);
      copyAttributes(
        { attr: (name) => childSymbol.attr(name) },
        { attr: (name) => childSvg.attr(name) ?? null },
        Array.isArray(addOptions.copyAttrs) ? addOptions.copyAttrs : []
      );
      setAttributes(childSymbol, addOptions.symbolAttrs || {});
      parentSvg.append(childSymbol);

      return this;
    },

    toString(options: Record<string, any>) {
      const clone = loadXml(parent.xml());
      const toStringOptions = { ...svgstoreOptions, ...options };
      const svg = clone(SELECTOR_SVG);

      if (toStringOptions.svgAttrs) setAttributes(svg, toStringOptions.svgAttrs);

      if (toStringOptions.inline) return clone.xml();

      svg.attr('xmlns', (val) => val || 'http://www.w3.org/2000/svg');
      svg.attr('xmlns:xlink', (val) => val || 'http://www.w3.org/1999/xlink');

      return TEMPLATE_DOCTYPE + clone.xml();
    },
  };
}

export default svgstore;
