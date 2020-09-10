import store from './redux/store';

export const getTabSites = ({view, tab}) => {
  let websites = [];
  const sites = store.getState().view.websites;
  const getSites = tab => {
    let results = [];
    const regex = RegExp(tab.content, 'i');
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      if (site.title.match(regex) || site.url.match(regex)) {
        results.push(site);
      }
    }
    return results;
  }
  if (tab.content === "all" && !tab.regex) {
    const tabs = view.tabs;
    const websiteSet = new Set();
    for (let i = 0; i < tabs.length; i++) {
      getSites(tabs[i]).forEach(site => {
        if (!websiteSet.has(site)) {
          websiteSet.add(site);
          websites.push(site);
        }
      })
    }
  } else {
    websites = getSites(tab);
  }
  return websites; 
}