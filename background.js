const browser = globalThis.browser ?? globalThis.chrome;

const closePatterns = [
  "chrome://newtab/",
  /https:\/\/.*.slack.com\/archives\/.*/,
]

browser.action.onClicked.addListener(async () => {
  let [currentWindow, ...tabs] = await Promise.all([
    browser.windows.getCurrent(),

    ...[true, false].flatMap((currentWindow) =>
      ["normal", "popup"].map((windowType) =>
        browser.tabs.query({
          currentWindow,
          windowType,
        }),
      ),
    ),
  ]);

  tabs = tabs.flat();

  const uniqueTabs = [];
  const urlsSeen = new Set();

  for (const tab of tabs) {
    if (!urlsSeen.has(tab.url)) {
      uniqueTabs.push(tab);
      urlsSeen.add(tab.url);
    } else {
      await browser.tabs.remove(tab.id);
    }
  }

  uniqueTabs.sort((a, b) => a.url.localeCompare(b.url));

  await browser.tabs.move(
    uniqueTabs.map((tab) => tab.id),
    {
      windowId: currentWindow.id,
      index: -1,
    },
  );

  for (const tab of uniqueTabs) {
    if (tab.pinned) {
      await browser.tabs.update(tab.id, {pinned: true});
    }
    for (const pattern of closePatterns) {
      if (tab.url.match(pattern)) {
        await browser.tabs.remove(tab.id);
        break
      }
    }
  }
});
