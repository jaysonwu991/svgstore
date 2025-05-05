/**
 * Converts an <svg/> element to a <symbol/>.
 */
const svgToSymbol = (id: string, child: cheerio.Root): cheerio.Cheerio => {
  const svgElem = child('svg');
  const symbol = child('<symbol/>');

  symbol.attr('id', id);
  symbol.append(svgElem.contents());

  return symbol;
};

export default svgToSymbol;
