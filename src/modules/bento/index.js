export { default as auth }    from './lib/auth';
export { default as api }     from './lib/api';
export { default as dom }     from './lib/dom';
export { default as helpers } from './lib/helpers';
export { default as logger }  from './lib/logger';
export { default as relay }   from './lib/relay';
export { default as socket }  from './lib/socket';

if (process.env.NODE_ENV !== 'production') {
  Object.defineProperty(exports, 'default', {
    get() {
      console.error('Module does not provide a default export. You are probably missing the curly braces in the import statement.');
    }
  });
}
