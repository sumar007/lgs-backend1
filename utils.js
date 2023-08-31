function addWwwToUrl(url) {
    const urlObj = new URL(url);
  
    if (!urlObj.hostname.startsWith('www.')) {
      urlObj.hostname = 'www.' + urlObj.hostname;
    }
  
    return urlObj.href;
}

export {addWwwToUrl}