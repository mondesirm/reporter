(function () {
	'use strict';

	// Where we will expose all the data we retrieve from storage.sync.
	const options = { count: 0 };

	// Asynchronously retrieve data from storage.sync, then cache it.
	const initoptions = chrome.storage.sync.get().then((items) => {
		// Copy the data retrieved from storage into options.
		Object.assign(options, items);
	});

	chrome.action.onClicked.addListener(async (tab) => {
		try {
			await initoptions;
		} catch (e) {
			console.log(e);
		}

		// Normal action handler logic.
		options.count++;
		options.lastTabId = tab.id;
		chrome.storage.sync.set(options);
	});

	console.log(storageCache);

	// We use a mockup online tool to display a message as an image 
	const IMG_URL = 'https://fakeimg.pl/900x200/fff,0/008bc4/?font=lobster&font_size=40&text=';

	// TODO Open the help page when the extension is installed
	/* chrome.runtime.onInstalled.addListener(({ reason }) => {
		if (reason === 'install') {
			chrome.tabs.create({ url: IMG_URL + chrome.i18n.getMessage('onInstall') });
		}
	}); */

	// TODO Open the uninstall page when the extension is uninstalled
	// chrome.runtime.setUninstallURL(IMG_URL + chrome.i18n.getMessage('onUninstall'));

	// Listen to messages from the content script
	chrome.runtime.onMessage.addListener(({ type, data }) => {
		if (type === 'click' && type === 'copy') {

		}

		// Store the data in the sync storage area
		chrome.storage.sync.set({ [type]: data })

		// Display a notification with the received data
		chrome.notifications.create(null, {
			type: 'basic',
			iconUrl: chrome.runtime.getURL('icons/nasapod48x48.png'),
			title: chrome.i18n.getMessage('notificationTitle'),
			message: chrome.i18n.getMessage('notificationContent', data),
			buttons: [{ title: chrome.i18n.getMessage('notificationButton') }],
		});
	});
})();