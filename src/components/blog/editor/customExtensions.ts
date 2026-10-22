import { Mark, mergeAttributes } from '@tiptap/core';

export const CustomTextStyle = Mark.create({
  name: 'customTextStyle',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || element.getAttribute('data-color'),
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            style: `color: ${attributes.color}`,
            'data-color': attributes.color,
          };
        },
      },
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize || element.getAttribute('data-font-size'),
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {};
          return {
            style: `font-size: ${attributes.fontSize}`,
            'data-font-size': attributes.fontSize,
          };
        },
      },
      fontFamily: {
        default: null,
        parseHTML: (element) => element.style.fontFamily || element.getAttribute('data-font-family'),
        renderHTML: (attributes) => {
          if (!attributes.fontFamily) return {};
          return {
            style: `font-family: ${attributes.fontFamily}`,
            'data-font-family': attributes.fontFamily,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-custom-style]',
      },
      {
        tag: 'span',
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const hasStyle =
            Boolean(element.style.color) ||
            Boolean(element.style.fontSize) ||
            Boolean(element.style.fontFamily);
          return hasStyle ? null : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-custom-style': 'true' }, HTMLAttributes), 0];
  },
});

export const CustomHighlight = Mark.create({
  name: 'customHighlight',

  addAttributes() {
    return {
      color: {
        default: '#fef08a',
        parseHTML: (element) =>
          element.getAttribute('data-highlight-color') || element.style.backgroundColor,
        renderHTML: (attributes) => {
          const bg = attributes.color || '#fef08a';
          return {
            'data-highlight-color': bg,
            style: `background-color: ${bg}; color: #000000; border-radius: 4px; padding: 1px 4px; font-weight: 500; display: inline;`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'mark' },
      {
        tag: 'span[data-highlight-color]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(HTMLAttributes), 0];
  },
});
