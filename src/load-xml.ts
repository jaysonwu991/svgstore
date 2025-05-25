/**
 * Utility method to create an XML document object with a jQuery-like
 * interface for node manipulation.
 */
import { load, type CheerioAPI } from 'cheerio';

const loadXml = (text: string): CheerioAPI =>
  load(text, {
    xmlMode: true,
  });

export default loadXml;
