import {
  remarkDefinitionList,
  defListHastHandlers,
} from 'remark-definition-list';
import remarkDirective from 'remark-directive';
import remarkAttributes from 'remark-attributes';
import {
  remarkExtendedTable,
  extendedTableHandlers,
} from 'remark-extended-table';

import { h } from 'hastscript';
import { visit } from 'unist-util-visit';

// This plugin is an example to turn `::note` into divs,
// passing arbitrary attributes.
function remarkContainers() {
  /**
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        /* Usage
        :::message[Optional Title]{.warning|.info|.error}

        Stuff Goes Here

        :::
        */
        if (node.name === 'message') {
          if (node.attributes.class) {
            node.attributes['data-type'] = node.attributes.class;
            node.attributes.class += ' message';
          } else {
            node.attributes.class = 'message';
          }

          // Find Title
          const label = node.children.findIndex((c) => c?.data?.directiveLabel);
          if (label >= 0) {
            const title = node.children[label];
            const titleData = title.data || {};
            titleData.hProperties = h('p', title || {}).properties;
            titleData.hProperties.className = ['message--title'];
            // console.log(titleData);
          }

          const data = node.data || (node.data = {});
          const tagName = node.type === 'textDirective' ? 'span' : 'div';

          data.hName = tagName;
          data.hProperties = h(tagName, node.attributes || {}).properties;
        } else if (node.name === 'figure') {
          /* Usage
        :::figure[Caption Goes Here]{#id}

        Stuff Goes Here

        :::
        */
          if (node.attributes.id) {
            node.attributes.id = `figure-${node.attributes.id}`;
          }

          // Find Figcaption
          const label = node.children.findIndex((c) => c.data.directiveLabel);
          if (label >= 0) {
            const capt = node.children[label];
            const captData = capt.data || {};
            captData.hName = 'figcaption';
            captData.hProperties = h('figcaption', capt || {}).properties;
            node.children = node.children.splice(label - 1, 1);
            node.children.push(capt);
          }

          // Build node back up
          const data = node.data || (node.data = {});
          const tagName = 'figure';

          data.hName = tagName;
          data.hProperties = h(tagName, node.attributes || {}).properties;
        } else {
          return;
        }
      }
    });
  };
}

export const markdown = {
  shikiConfig: {
    theme: 'monokai',
  },
  remarkPlugins: [
    remarkDefinitionList,
    remarkDirective,
    remarkContainers,
    remarkAttributes,
    remarkExtendedTable,
  ],
  remarkRehype: {
    handlers: {
      ...extendedTableHandlers,
      ...defListHastHandlers,
    },
  },
};
