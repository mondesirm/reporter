(function () {
	'use strict';

	// Notify the background page when a link is clicked
	function onClick(e) {
		// Ctrl and Alt keys must be pressed
		if (!e.ctrlKey || !e.altKey) return;

		// Prevent the default action
		e.preventDefault();

		// Check if the element or one of his parents is a link
		while ((e.target.tagName != 'A' || !e.target.href) && e.target.parentNode) {
			e.target = e.target.parentNode;
		}

		if (e.target.tagName != 'A') return;

		// Send the link's URL to the background page
		chrome.runtime.sendMessage({ type: 'click', data: e.target.href });
	}

	// Copy the selected text to clipboard
	function onMouseUp(e) {
		// Ctrl and Alt keys must be pressed
		if (!e.ctrlKey || !e.altKey) return;

		// Get the selected text
		let data = window.getSelection().toString().trim();

		// If there is selected text
		if (data && data.length > 0) {
			// Copy it to clipboard and send it to the background page
			document.execCommand('Copy');
			chrome.runtime.sendMessage({ type: 'copy', data });
		}
	}

	// Listen to click events
	window.addEventListener('click', onClick);

	// Add onMouseUp() as a listener to mouseup events.
	window.addEventListener('mouseup', onMouseUp);
})();