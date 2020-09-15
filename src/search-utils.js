import store from './redux/store';

export const getTabSites = ({ view, tab }) => {
  let websites = [];
  const sites = store.getState().view.websites;
  if (tab.content === "all" && !tab.regex) {
    const tabs = view.tabs;
    const websiteSet = new Set();
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].content === "all") continue;
      const dupSites = getDomainOrRegexSites(sites, tabs[i]);
      for (let j = 0; j < dupSites.length; j++) {
        const site = dupSites[j];
        if (!websiteSet.has(site)) {
          websiteSet.add(site);
          websites.push(site);
        }
      }
    }
  } else {
    websites = getDomainOrRegexSites(sites, tab);
  }
  return websites;
}

const getDomainOrRegexSites = (sites, tab) => {
  let results = [];
  if (tab.regex) {
    results = grepSites(sites, tab.content);
  } else {
    // if tab content is not regex then it has to be a domain name
    const domains = store.getState().view.domains;
    results = domains[tab.content] || [];
  }
  return results;
}

export function grepSites(sites, search) {
  let results = [];
  const regex = RegExp(search, 'i');
  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    if (site.title.match(regex) || site.url.match(regex)) {
      results.push(site);
    }
  }
  return results;
}

export const getDomainFromUrl = url => {
  return url.match(/^(?:https?:\/\/)?(?:[^@/\n]+@)?(?:www\.)?([^:/?\n]+)/)[1];
}