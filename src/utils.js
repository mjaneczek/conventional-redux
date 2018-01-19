export function getProperty(object, keyChain) {
  return keyChain.split('.').reduce((o,i)=> {
    if(!o) { return null }
    return o[i]
  }, object);
}
