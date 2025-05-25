import type { Cheerio, CheerioAPI } from 'cheerio';
import type { AnyNode } from 'domhandler';

/**
 * Converts an <svg/> element to a <symbol/>.
 */
const svgToSymbol = (id: string, child: CheerioAPI): Cheerio<AnyNode> => {
  const svgElem = child('svg');
  const symbol = child('<symbol/>');

  symbol.attr('id', id);
  symbol.append(svgElem.contents());

  return symbol;
};

export default svgToSymbol;
