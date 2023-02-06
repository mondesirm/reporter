$(async function () {
	'use strict';

	/* STYLES */

	// Wait for important custom elements to register
	await Promise.allSettled([
		customElements.whenDefined('sl-card'),
		customElements.whenDefined('sl-button')
	]);

	// If media preference is dark, add the dark class to the body
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		// Add the dark class to the document
		document.documentElement.classList.add('sl-theme-dark');
	}

	// Body fades in
	document.body.classList.add('ready');

	// Get the current locale
	function getUILanguage() {
		let code;

		if (
			'i18n' in chrome &&
			'getUILanguage' in chrome.i18n &&
			typeof chrome.i18n.getUILanguage === 'function'
		) {
			code = chrome.i18n.getUILanguage();
		} else {
			code = navigator.language.split('-')[0];
		}
		if (code.endsWith('-mac')) {
			return code.substring(0, code.length - 4);
		}
		return code;
	}

	// Set document and sl-relative-time lang attributes
	document.documentElement.lang = getUILanguage();
	$('sl-relative-time').attr('lang', getUILanguage());

	/* LOCALIZATION */

	// Return the localized string for the given name
	function __(name) {
		return chrome?.i18n?.getMessage(name) || name;
	}

	// Localise text (eg. <span data-i18n="hello">__</span>)
	$('[data-i18n]').each(function () {
		// Replace placeholder with the localized string
		let text = $(this).text().replace('__', __($(this).data('i18n')));
		$(this).text(text || $(this).data('i18n'));
	});

	/* CLASSES */

	class Storage {
		// Default props and presets
		static props() {
			return {
				id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				type: 'text',
				children: []
			}
		};

		static options = {
			'firstTime': true,
			'confirmDelete': true,
			'notifyOnLinkClick': true,
			'newElementOnTextSelection': true
		};

		static elements = [
			{
				...this.props(), title: 'Names', children: [
					{ ...this.props(), title: 'John Doe' }, { ...this.props(), title: 'Jane Doe' }
				]
			}, {
				...this.props(), title: 'Emails', children: [
					{ ...this.props(), title: 'root1@root.com' }, { ...this.props(), title: 'root2@root.com' }
				]
			}, {
				...this.props(), title: 'Phones', children: [
					{ ...this.props(), title: '123456789' }, { ...this.props(), title: '987654321' }
				]
			}, {
				...this.props(), title: 'Addresses', children: [
					{ ...this.props(), title: '1234 Main Street' }, { ...this.props(), title: '4321 Main Street' }
				]
			}, { ...this.props(), title: 'Others' }
		];

		static reports = [
			{ ...this.props(), title: 'Fruits', children: [{ ...this.props(), title: 'Apples' }, { ...this.props(), title: 'Oranges' }, { ...this.props(), title: 'Bananas' }] },
			{
				...this.props(), title: 'Folder 1', children: [
					{ ...this.props(), title: 'Folder 2', children: [
						{ ...this.props(), title: 'Folder 3', children: [
							{ ...this.props(), title: 'Folder 4', children: [
								{ ...this.props(), title: 'Folder 5' }
							]}
						]}
					]}
				]
			}, { ...this.props(), title: 'Test Report' }
		];

		static init() {
			// Where we will expose all the data we retrieve from storage.sync.
			const storageCache = { count: 0 };
			// Asynchronously retrieve data from storage.sync, then cache it.
			const initStorageCache = chrome.storage?.sync.get().then((items) => {
				// Copy the data retrieved from storage into storageCache.
				Object.assign(storageCache, items);
			});

			chrome.action?.onClicked.addListener(async (tab) => {
				try {
					await initStorageCache;
				} catch (e) {
					console.log(e);
				}

				// Normal action handler logic.
				storageCache.count++;
				storageCache.lastTabId = tab.id;
				chrome.storage.sync.set(storageCache);
			});
		}

		static watch() {
			// Watch for changes in the storage
			chrome?.storage
				? chrome.storage.sync.onChanged.addListener(async (changes, area) => {
					const data = changes?.click?.newValue || changes?.copy?.newValue;

					if (data) {
						Actions.newElement(null, data);
						await chrome.storage.sync.remove(['click', 'copy']);
						await chrome.action.setBadgeBackgroundColor({ color: 'green' });
						chrome.action.setBadgeText({ text: ++badge })
					}

					// Store element
				})
				: window.addEventListener('storage', ({ key, newValue, ...e }) => {
					if (['elements', 'reports'].includes(key)) {
						Storage['set' + key[0].toUpperCase() + key.slice(1)](JSON.parse(newValue));
						Actions['load' + key[0].toUpperCase() + key.slice(1)]({ target: $(`[data-action=load${key[0].toUpperCase() + key.slice(1)}]`) });
					}
				});
			;
		}

		static get(key, presets = false) {
			return presets ? this[key]
				: (chrome?.storage?.sync
					? chrome.storage.sync.get(key).then(res => res[key])
					: JSON.parse(localStorage.getItem(key)));
		}

		static set(key, value) {
			return chrome?.storage?.sync
				? chrome.storage.sync.set({ [key]: value })
				: localStorage.setItem(key, JSON.stringify(value));
		}

		static remove(key) {
			return chrome?.storage?.sync
				? chrome.storage.sync.remove(key)
				: localStorage.removeItem(key);
		}

		static async find(type, arr, callback = f => f) {
			function findItem(items, arr) {
				if (items) {
					for (var i = 0; i < items.length; i++) {
						if (items[i]?.[arr[0]] == arr[1]) return items[i];
						var found = findItem(items[i].children, arr);

						if (found) {
							return callback(found);
						}
					}
				}
			}
			
			var items = await this.get(type);
			return findItem(items, arr);
		}

		static getOptions() {
			return Object.assign(this.options, this.get('options'));
		}

		static setOptions(newOptions = {}) {
			if (Object.keys(newOptions).length === 0) options = this.options;
			else Object.assign(options, newOptions);

			return chrome?.storage?.sync
				? chrome.storage.sync.set({ options })
				: localStorage.setItem('options', JSON.stringify(options));
		}

		static setElements(newElements = []) {
			if (newElements.length === 0) elements = this.elements;
			else Object.assign(elements, newElements);

			this.set('elements', elements);
		}

		static setReports(newReports = []) {
			if (newReports.length === 0) reports = this.reports;
			else Object.assign(reports, newReports);

			this.set('reports', reports);
		}
	}

	class Actions {
		static watch() {
				chrome?.commands?.onCommand?.addListener(async command => {
				if (command === 'element') {
					// impossible to open popup because of a chrome bug
					// needs to be opened before
					$('#new-element')[0].show();
				} else if (command === 'options') {
					// await chrome.windows.create({ url: 'popup/options.html', type: 'popup', width: 460, height: 300 });
					await chrome.runtime.openOptionsPage();
				}
			});

			// Remove badge when popup is opened
			chrome?.action?.onClicked?.addListener(async () => {
				await chrome?.action?.setBadgeText({ text: '' });
			});
		}

		static loadOptions() {
			// Merge options (priority to local storage)
			Object.assign(options, Storage.getOptions());

			$('form#options').find('sl-checkbox').remove();

			// Create the options form
			for (const [key, value] of Object.entries(options)) {
				if (key === 'firstTime') continue;
				$('form#options').prepend($(`<sl-checkbox name="${key}"${Boolean(value) && ' checked'}>${__('options_' + key)}</sl-checkbox>`));
			}

			// if options.newElementOnTextSelection is true, set badge color to green
			if (options.newElementOnTextSelection) chrome?.action?.setBadgeBackgroundColor({ color: 'green' })
			else chrome?.action?.setBadgeBackgroundColor({ color: 'red' });
		}

		static async loadTree({ target }, name = null) {
			if (!name) {
				this.loadElements({ target });
				this.loadReports({ target });
				return;
			}

			// Animate parent
			const parent = target ? $(target).parent()[0] : null;

			if (parent) {
				parent.keyframes = [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }];
				parent.play = true;
			}

			// Get corresponding data from storage
			const data = await Storage.get(name, options.firstTime);

			// Merge data (priority to local storage)
			if (name === 'elements') Object.assign(elements, data);
			else if (name === 'reports') Object.assign(reports, data);

			// Clear corresponding tree
			$(`sl-tree[data-tab=${name}]`).find('sl-tree-item').remove();

			if (!data) return;

			data.forEach(item => {
				if (item?.id) {
					// Create tree items recursively
					function createTreeItem(item) {
						const node = $(`<sl-tree-item data-id=${item.id}>`).append(item.title);
						if (item.children) node.append(item.children.map(createTreeItem));
						return node;
					}

					// Overwrite corresponding tree
					$(`sl-tree[data-tab=${name}]`).append(createTreeItem(item));
				}
			});
		}

		static loadElements(e) { Actions.loadTree(e, 'elements') }
		static loadReports(e) { Actions.loadTree(e, 'reports') }

		static toggleSelectionMode({ target }) {
			const active = $(target).attr('active') === 'true';
			const color = active ? 'var(--sl-color-neutral-600)' : 'var(--sl-color-primary-600)';
			$(target).attr('active', !active.valueOf());
			$(target).css('color', color);

			// Deselect all items
			$(target).closest('sl-card').find('sl-tree-item').each(function () {
				$(this).attr('selected', false);
			});

			// Toggle selection mode
			$(target).closest('sl-card').find('sl-tree').attr('selection', active ? 'single' : 'multiple');
		}

		static newCategory(e) {
			this.newElement(e);
		}

		static async newElement(e, title = null) {
			if (!title) {
				if ($(e.target).prev().val().trim().length < 1) return;
			}

			// Create new element
			const newElement = {
				...Storage.props(),
				title: title != null ? title : $(e?.target).prev().val(),
				children: []
			};

			// Find element, update it and return all elements
			var element = await Storage.find('elements', ['id', selectedElement]);

			console.log(element);
			// If element is found, add new element to its children
			if (selectedElement) element.children.push(newElement);
			else element = newElement;

			// Store new element and reload tree
			Storage.setElements([...elements.filter(e => e.id !== selectedElement), element]);
			this.loadElements({ target: $('[data-action=loadElements]') });

			// Expand the selected element and its parent
			$(`sl-tree-item[data-id=${element.id}]`).attr('selected', true).trigger('click')
			if (selectedElement) $(`sl-tree-item[data-id=${selectedElement}]`).attr('expanded', true);

			// Hide form
			$('sl-panel-tab[name=elements]').find('form').css('visibility', 'hidden');
		}

		static resetOptions() {
			// Reset options
			Storage.setOptions();
			Actions.loadOptions();
		}

		static resetData() {
			// Reset data
			Storage.setOptions({ ...options, firstTime: true});
			Storage.setElements();
			Storage.setReports();
			Actions.loadElements({ target: $('[data-action=loadElements]') });
			Actions.loadReports({ target: $('[data-action=loadReports]') });
		}

		static resetAll() {
			// Reset everything
			this.resetOptions();
			this.resetData();
		}
	}

	/* CACHE */

	var badge = 0;
	var selectedTab = 'elements';
	var options = {}, elements = [], reports = [];
	var selectedElement = null, selectedReport = null;

	/* CONTENT */

	Storage.init();
	// Load options form
	Actions.loadOptions();

	// Load all elements and reports in their respective trees
	Actions.loadElements({ target: $('[data-action=loadElements]') });
	Actions.loadReports({ target: $('[data-action=loadReports]') });

	/* Initialize data and put firstTime to false */
	await Storage.setOptions({ ...options, firstTime: false });
	Storage.setElements(elements);
	Storage.setReports(reports);

	// Show last selected tab
	$('sl-tab-group')[0]?.show(Storage.get('selectedTab'));

	/* EVENT LISTENERS */

	Storage.watch();
	Actions.watch();

	// Immediately persist options changes
	$('form#options').on('sl-change', ({ target }) => {
		// Update the options cache
		options[target.name] = target.checked;

		// Persist the options
		if (chrome?.storage?.sync) chrome.storage.sync.set({ options });
		else localStorage.setItem('options', JSON.stringify(options));
	});

	// Store last selected tab
	$('sl-tab-group').on('sl-tab-show', ({ originalEvent: { detail } }) => {
		selectedTab = detail.name;
		Storage.set('selectedTab', selectedTab);
	});

	// When clicking outside of the tree
	$('sl-card').on('click', ({ target }) => {
		if ($(target).is('sl-card')) {
			selectedElement = null;
			// Deselect all items
			$(target).find('sl-tree-item').attr('selected', false);
			// Hide form
			$(target).parentsUntil('sl-tab-panel').find('sl-card[slot=end]').css('visibility', 'hidden');
			// Show new category button
			$(target).find('[data-open=new-category]').css('display', 'inline-block');
			$(target).find('[data-open=new-element]').css('display', 'none');
		}
	});

	// Reset split panel divider position on double click
	$($('sl-split-panel')[0]?.shadowRoot).find('[part=divider]').on('dblclick', function () {
		$(this.parentNode.host).attr('position', 50)
	});

	// Open specified popup on button click
	$('[data-popup]').on('click', async function (e) {
		chrome?.runtime ? await chrome.runtime.openOptionsPage()
			: window.location.href = $(this).data('popup') + '.html';
		
		//! TODO change popup instead
		// chrome?.action?.setPopup({ popup: $(this).data('popup') + '.html' });
	});

	// Open drawer on button click
	$('[data-open]').on('click', function () {
		$('#' + $(this).data('open'))[0].show();
	});

	// Execute action on button click
	$('[data-action]').on('click', function (e) {
		// TODO show confirmation dialog if it starts with 'delete' and options.confirmDelete is true
		Actions[$(this).data('action')](e);
	});

	// Close drawer on button click
	$('sl-drawer').on('click', 'sl-button', function () {
		$(this).parent()[0].hide();
	});

	// TODO Add menu to the tree items
	/* $('sl-dropdown').on('sl-select', function ({ originalEvent: { detail }}) {
		const selected = detail.item;
		console.log(selected.value);
	}); */

	// Change sl-select icon with the selected item icon
	$('sl-select').on('sl-change', ({ target }) => {
		const icon = $(target.selectedOptions[0]).children().first().attr('name')
		const tag = target.value === 'long' ? 'textarea' : 'input';
		const attr = target.value === 'password' ? ' password-toggle' : '';
		const selector = `<sl-${tag} type="${target.value}" name="data" filled pill class="label-on-left" label="Data" placeholder="The data of your element"${attr} required></sl-${tag}>`;

		$(target).children().first().attr('name', icon);
		$(target).next().replaceWith($(selector).html($(target).next().html()));
		// TODO $(target).children().find('sl-relative-time').attr('date', new Date().toISOString());
	});

	// On tree selection change
	$('sl-tree').on('sl-selection-change', async function ({ target, originalEvent: { detail } }) {
		const panel = $(target).parentsUntil('sl-tab-panel');
		const item = await Storage.find(selectedTab, ['id', $(detail.selection).data('id')]);

		// Set the selected item id
		if ($(this).data('tab') === 'elements') selectedElement = item.id;
		else if ($(this).data('tab') === 'reports') selectedReport = item.id;

		// If the parent of the selected item is the tree itself
		if ($(`sl-tree-item[data-id=${item.id}]`).parent().is('sl-tree')) {
			// Toggle header buttons
			panel.find('[data-open=new-category]').css('display', 'none');
			panel.find('[data-open=new-element]').css('display', 'inline-block');
		} else {
			panel.find('[data-open=new-category]').css('display', 'none');
			panel.find('[data-open=new-element]').css('display', 'none');
		}

		// Show the relative time
		panel.find('sl-relative-time').attr('date', item.createdAt);

		// If the selected item doesn't have any items (it means it's an element)
		if (item?.children?.length === 0) {
			// Show the header and the form
			panel.find('sl-card[slot=end]').css('visibility', 'visible')
				.find('sl-icon-button').css('display', 'inline-block');

			// Set input type and value
			panel.find(
				$(this).data('tab') === 'elements' ? '[name=data]' : '[name=title]'
			).attr('type', item.type).val(item.title);

			// TODO Pagination system to have more space for the tree
			// Slide to the left then set split-panel position to 0
			/* const animation = $(`sl-tab-panel[name=${$(this).data('tab')}] > sl-animation`)[0];
			animation.keyframes = [
				{ transform: 'translateX(0)' },
				{ transform: 'translateX(-50%)' }
			];

			// Play animation
			animation.play = true; */
		} else {
			// Hide the form
			panel.find('sl-card[slot=end]').css('visibility', 'hidden');
		}
	});
});