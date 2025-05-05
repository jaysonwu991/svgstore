/**
 * Utility method to create an XML document object with a jQuery-like
 * interface for node manipulation.
 */
import { load } from 'cheerio';

const loadXml = (text: string) =>
  load(text, {
    xmlMode: true,
  });

export default loadXml;
