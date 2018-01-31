export function getProperty(object, keyChain) {
  return keyChain.split('.').reduce((o,i)=> {
    if(!o) { return null }
    return o.get ? o.get(i) : o[i];
  }, object);
}

export function defineStateGetter(interactor, state) {
  Object.defineProperty(interactor, 'state', {
    get() { return state; },
    set(_) { throw new Error('Cannot modify readonly property state!') },
    configurable: true
  });
}
