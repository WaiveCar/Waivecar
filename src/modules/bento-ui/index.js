export { default as templates }  from './lib/templates';
export { default as resources }  from './lib/resources';
export { default as fields }     from './lib/fields';
export { default as components } from './lib/components';
export { default as views }      from './lib/views';
export { default as menu }       from './lib/menu';
export { default as editor }     from './editor';
export { default as loader }     from './loader';

if (process.env.NODE_ENV !== 'production') {
  Object.defineProperty(exports, 'default', {
    get() {
      console.error('Module does not provide a default export. You are probably missing the curly braces in the import statement.');
    }
  });
}
