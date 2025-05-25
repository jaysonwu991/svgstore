import type { CheerioAPI } from 'cheerio';

const SELECTOR_DEFS = 'defs';

const renameDefinitions = (id: string, child: CheerioAPI) => {
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

export default renameDefinitions;
