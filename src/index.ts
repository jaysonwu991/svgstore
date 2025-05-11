import { copyAttributes, loadXml, removeAttributes, setAttributes, svgToSymbol } from './utils';

const SELECTOR_SVG = 'svg';
const SELECTOR_DEFS = 'defs';

const TEMPLATE_SVG = '<svg><defs/></svg>';
const TEMPLATE_DOCTYPE =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
  '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

/**
 * Configuration options for the SVGStore class.
 *
 * @property cleanDefs - Removes `style` attributes or a list of attributes from SVG definitions.
 * @property cleanSymbols - Removes `style` attributes or a list of attributes from SVG objects.
 * @property inline - If true, outputs the SVG without a DOCTYPE declaration.
 * @property svgAttrs - A map of attributes to set on the root `<svg>` element. Setting an attribute's value to `null` removes it. Values can also be functions.
 * @property symbolAttrs - A map of attributes to set on each `<symbol>` element. Setting an attribute's value to `null` removes it. Values can also be functions.
 * @property copyAttrs - Attributes to copy from the source `<svg>` tag to the `<symbol>` tag. Always copies `viewBox`, `aria-labelledby`, and `role`.
 * @property renameDefs - Renames `defs` content IDs to include the file name, avoiding ID conflicts in the output.
 */
const DEFAULT_OPTIONS = {
  cleanDefs: false,
  cleanSymbols: false,
  inline: false,
  svgAttrs: {}, // { width: '100%', height: '100%' }
  symbolAttrs: {}, // { fill: 'currentColor' }
  copyAttrs: [] as string[],
  renameDefs: false,
};

class SVGStore {
  private options: typeof DEFAULT_OPTIONS;
  private parent: cheerio.Root;
  private parentSvg: cheerio.Cheerio;
  private parentDefs: cheerio.Cheerio;

  constructor(options?: Partial<typeof DEFAULT_OPTIONS>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.parent = loadXml(TEMPLATE_SVG);
    this.parentSvg = this.parent(SELECTOR_SVG);
    this.parentDefs = this.parent(SELECTOR_DEFS);
  }

  private renameDefs(id: string, child: cheerio.Root) {
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
          const property = ['xlink:href', 'href'].find(
            (prop) => child(use).prop(prop) === hrefLink
          );
          if (property) child(use).attr(property, `#${newDefId}`);
        });

        // Update fill attributes
        child(`[fill="url(#${oldDefId})"]`).each((_i, use) => {
          child(use).attr('fill', `url(#${newDefId})`);
        });
      });
  }

  add(id: string, file: string, options?: Record<string, unknown>) {
    const child = loadXml(file);
    const addOptions = { ...this.options, ...options };

    // Handle <defs>
    const childDefs = child(SELECTOR_DEFS);
    removeAttributes(childDefs, addOptions.cleanDefs);

    if (addOptions.renameDefs) this.renameDefs(id, child);

    this.parentDefs.append(childDefs.contents());
    childDefs.remove();

    // Handle <symbol>
    const childSvg = child(SELECTOR_SVG);
    const childSymbol = svgToSymbol(id, child);

    removeAttributes(childSymbol, addOptions.cleanSymbols);
    copyAttributes(
      { attr: (name) => childSymbol.attr(name) },
      { attr: (name) => childSvg.attr(name) ?? null },
      Array.isArray(addOptions.copyAttrs) ? addOptions.copyAttrs : []
    );
    setAttributes(childSymbol, addOptions.symbolAttrs || {});
    this.parentSvg.append(childSymbol);

    return this;
  }

  toString(options: Record<string, unknown> = { inline: true }) {
    const clone = loadXml(this.parent.xml());
    const toStringOptions = { ...this.options, ...options };
    const svg = clone(SELECTOR_SVG);

    setAttributes(svg, toStringOptions.svgAttrs || {});

    if (toStringOptions.inline) return clone.xml();

    svg.attr('xmlns', (val) => val || 'http://www.w3.org/2000/svg');
    svg.attr('xmlns:xlink', (val) => val || 'http://www.w3.org/1999/xlink');

    return TEMPLATE_DOCTYPE + clone.xml();
  }
}

export default SVGStore;
