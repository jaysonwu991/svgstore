import { describe, it, expect } from 'vitest';

import SVGStore from '../src';

const doctype =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
  '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

const svgNs =
  '<svg xmlns="http://www.w3.org/2000/svg" ' + 'xmlns:xlink="http://www.w3.org/1999/xlink">';

const FIXTURE_SVGS = {
  foo: '<svg viewBox="0 0 100 100"><defs><linear-gradient style="fill: red;"/></defs><path style="fill: red;"/></svg>',
  bar: '<svg viewBox="0 0 200 200"><defs><radial-gradient style="stroke: red;"/></defs><rect style="stroke: red;"/></svg>',
  baz: '<svg viewBox="0 0 200 200"><defs><linear-gradient style="fill: red;"/></defs><path style="fill: red;"/></svg>',
  qux: '<svg viewBox="0 0 200 200"><defs><radial-gradient style="stroke: red;" fill="blue"/></defs><rect style="stroke: red;" fill="blue"/></svg>',
  quux: '<svg viewBox="0 0 200 200" aria-labelledby="titleId" role="img"><title id="titleId">A boxy shape</title><rect/></svg>',
  corge:
    '<svg viewBox="0 0 200 200" aria-labelledby="titleId" role="img" preserveAspectRatio="xMinYMax" take-me-too="foo" count-me-out="bar">' +
    '<title id="titleId">A boxy shape</title><rect/></svg>',
  defsWithId:
    '<svg><defs><linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="a"><stop stop-color="#FFF" offset="0%"/><stop stop-color="#F0F0F0" offset="100%"/></linearGradient><path id="b" d=""/></defs><path fill="url(#a)" fill-rule="nonzero" d=""/><use xlink:href="#b"></use><use fill-rule="nonzero" xlink:href="#b"></use><path fill="url(#a)" fill-rule="nonzero" d=""/></svg>',
};

describe('SVGStore', () => {
  let svgStore: SVGStore;

  it('should create an svg document', () => {
    svgStore = new SVGStore();
    const svg = svgStore.toString({});

    expect(svg.slice(0, 5), '<?xml');
  });

  it('should create an svg element', async () => {
    svgStore = new SVGStore();
    const svg = svgStore.toString();

    expect(svg.slice(0, 4), '<svg');
  });

  it('should combine svgs', () => {
    svgStore = new SVGStore();
    svgStore.add('foo', doctype + FIXTURE_SVGS.foo).add('bar', doctype + FIXTURE_SVGS.bar);

    const expected =
      doctype +
      svgNs +
      '<defs>' +
      '<linear-gradient style="fill: red;"/>' +
      '<radial-gradient style="stroke: red;"/>' +
      '</defs>' +
      '<symbol id="foo" viewBox="0 0 100 100"><path style="fill: red;"/></symbol>' +
      '<symbol id="bar" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
      '</svg>';

    expect(svgStore.toString(), expected);
  });

  it('should clean defs', () => {
    svgStore = new SVGStore({ cleanDefs: true });
    svgStore
      .add('foo', doctype + FIXTURE_SVGS.foo)
      .add('bar', doctype + FIXTURE_SVGS.bar)
      .add('baz', doctype + FIXTURE_SVGS.baz, {
        cleanDefs: [],
      })
      .add('qux', doctype + FIXTURE_SVGS.qux, {
        cleanDefs: ['fill'],
      });

    const expected =
      doctype +
      svgNs +
      '<defs>' +
      '<linear-gradient/><radial-gradient/>' +
      '<linear-gradient style="fill: red;"/>' +
      '<radial-gradient style="stroke: red;"/>' +
      '</defs>' +
      '<symbol id="foo" viewBox="0 0 100 100"><path style="fill: red;"/></symbol>' +
      '<symbol id="bar" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
      '<symbol id="baz" viewBox="0 0 200 200"><path style="fill: red;"/></symbol>' +
      '<symbol id="qux" viewBox="0 0 200 200"><rect style="stroke: red;" fill="blue"/></symbol>' +
      '</svg>';

    expect(svgStore.toString(), expected);
  });

  it('should clean symbols', () => {
    svgStore = new SVGStore({ cleanSymbols: true });
    svgStore
      .add('foo', doctype + FIXTURE_SVGS.foo)
      .add('bar', doctype + FIXTURE_SVGS.bar)
      .add('baz', doctype + FIXTURE_SVGS.baz, {
        cleanSymbols: [],
      })
      .add('qux', doctype + FIXTURE_SVGS.qux, {
        cleanSymbols: ['fill'],
      });

    const expected =
      doctype +
      svgNs +
      '<defs>' +
      '<linear-gradient style="fill: red;"/>' +
      '<radial-gradient style="stroke: red;"/>' +
      '<linear-gradient style="fill: red;"/>' +
      '<radial-gradient style="stroke: red;" fill="blue"/>' +
      '</defs>' +
      '<symbol id="foo" viewBox="0 0 100 100"><path/></symbol>' +
      '<symbol id="bar" viewBox="0 0 200 200"><rect/></symbol>' +
      '<symbol id="baz" viewBox="0 0 200 200"><path style="fill: red;"/></symbol>' +
      '<symbol id="qux" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
      '</svg>';

    expect(svgStore.toString(), expected);
  });

  it('should attempt to preserve the `viewBox`, `aria-labelledby`, and `role` attributes of the root SVG by default', () => {
    svgStore.add('quux', FIXTURE_SVGS.quux);

    const expected =
      doctype +
      svgNs +
      '<defs/>' +
      '<symbol id="quux" viewBox="0 0 200 200" aria-labelledby="titleId" role="img">' +
      '<title id="titleId">A boxy shape</title><rect/>' +
      '</symbol>' +
      '</svg>';

    expect(svgStore.toString(), expected);
  });

  it('should support custom attribute preservation, on top of the defaults', () => {
    const copyAttrs = ['preserveAspectRatio', 'take-me-too', 'role'];
    svgStore = new SVGStore({ copyAttrs });
    svgStore.add('corge', FIXTURE_SVGS.corge);

    const expected =
      doctype +
      svgNs +
      '<defs/>' +
      '<symbol id="corge" viewBox="0 0 200 200" aria-labelledby="titleId" role="img" preserveAspectRatio="xMinYMax" take-me-too="foo">' +
      '<title id="titleId">A boxy shape</title><rect/>' +
      '</symbol>' +
      '</svg>';

    expect(svgStore.toString(), expected);
  });

  it('should set symbol attributes', () => {
    svgStore = new SVGStore({
      symbolAttrs: {
        viewBox: '0 0 100 100',
        id: (id?: string) => {
          return 'icon-' + id;
        },
      },
    });
    svgStore.add('foo', doctype + FIXTURE_SVGS.foo).add('bar', doctype + FIXTURE_SVGS.bar);

    const expected =
      '<svg>' +
      '<defs>' +
      '<linear-gradient style="fill: red;"/>' +
      '<radial-gradient style="stroke: red;"/>' +
      '</defs>' +
      '<symbol id="icon-foo"><path style="fill: red;"/></symbol>' +
      '<symbol id="icon-bar"><rect style="stroke: red;"/></symbol>' +
      '</svg>';

    expect(svgStore.toString(), expected);
  });

  it('should set svg attributes', () => {
    svgStore = new SVGStore({
      svgAttrs: {
        id: 'spritesheet',
        style: 'display: none',
      },
    });
    svgStore.add('foo', doctype + FIXTURE_SVGS.foo).add('bar', doctype + FIXTURE_SVGS.bar);

    const expected =
      '<svg id="spritesheet" style="display: none">' +
      '<defs>' +
      '<linear-gradient style="fill: red;"/>' +
      '<radial-gradient style="stroke: red;"/>' +
      '</defs>' +
      '<symbol id="foo" viewBox="0 0 100 100"><path style="fill: red;"/></symbol>' +
      '<symbol id="bar" viewBox="0 0 200 200"><rect style="stroke: red;"/></symbol>' +
      '</svg>';

    expect(svgStore.toString(), expected);
  });

  it('should rename defs id', () => {
    svgStore = new SVGStore({
      renameDefs: true,
    });
    svgStore.add('defs_with_id', doctype + FIXTURE_SVGS.defsWithId);

    const expected =
      '<svg>' +
      '<defs>' +
      '<linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="defs_with_id_a">' +
      '<stop stop-color="#FFF" offset="0%"/>' +
      '<stop stop-color="#F0F0F0" offset="100%"/>' +
      '</linearGradient>' +
      '<path id="defs_with_id_b" d=""/>' +
      '</defs>' +
      '<symbol id="defs_with_id">' +
      '<path fill="url(#defs_with_id_a)" fill-rule="nonzero" d=""/>' +
      '<use xlink:href="#defs_with_id_b"/>' +
      '<use fill-rule="nonzero" xlink:href="#defs_with_id_b"/>' +
      '<path fill="url(#defs_with_id_a)" fill-rule="nonzero" d=""/>' +
      '</symbol>' +
      '</svg>';

    expect(svgStore.toString(), expected);
  });
});
