# QCMS
1. Bases
2. Flash Courses
3. Final
	1. Quel est le strict minimum pour créer une extension ?
		[ ] Des icônes
		[x] Le fichier Manifest
		[ ] Un fichier HTML
		[ ] Un fichier JS
		*Le fichier manifest est indispensable sachant qu'il contient les informations de base de l'extension.*

	2. Quel est le strict minimum pour créer un fichier Manifest fonctionnel ?
		*Le nom de l'extension (`name`), le numéro de sa version (`version`) et le numéro de version du fichier Manifest (`manifest_version`).*
	
	3. À partir de quelle année la migration de Manifest V2 vers V3 sera-t-elle obligatoire ?
		[ ] 2023
		[x] 2024
		[ ] 2025
		[ ] 2026
		*Le V2 est actuellement utilisée par les entreprises mais cette politique expirera en janvier 2024.*
		*Plus d'infos : https://developer.chrome.com/docs/extensions/mv3/mv2-sunset/*

	4. Combien d'espaces de stockage pouvons-nous utiliser avec l'API `storage` ?
		[ ] 2
		[ ] 3
		[x] 4
		[ ] 5
		*Les espaces de stockage sont : `sync`, `local`, `managed` et `session`.*

	5. Quelles méthodes pouvons-nous utiliser pour tracker les modifications dans un espace de stockage (celle qui reçoit une fonction comme argument) ?
		[x] `storage.onChanged.addListener`
		[ ] `storage.onChange.addListener`
		[ ] `storage.onChange`
		[x] `storage.sync.onChanged.addListener`
		*`onChanged` est le nom de l'événement, `addListener` permet de lui assigner une fonction et il est possible de tracker des changements sur un espace en suffixant `storage` par l'espace (ici `sync`).*

	6. Seul le navigateur Chrome utilise le "namespace" d'APIs `chrome`.
		[ ] Vrai
		[x] Faux
		*`chrome` est utilisé par les navigateurs Chromium et même un autre.*

	7. Aujourd'hui, environ combien d'extensions utilisant le namespace `chrome` peuvent fonctionner sur le navigateur Firefox.
		[ ] Tous
		[ ] Aucun
		[x] Un très grand pourcentage
		*On utilise `browser` pour Firefox mais les APIs du namespace `chrome` sont presque tous compatibles avec Firefox nativement.*

	8. Il est impossible d'utiliser les APIs de `browser` dans un navigateur Chromium.
		[ ] Vrai
		[x] Faux
		*On peut utiliser ce qu'on appelle une librairie "polyfill" pour étendre le namespace `chrome`.*
		*Plus d'infos : https://github.com/mozilla/webextension-polyfill*

	9. Que dois-je faire pour afficher une image stockée dans le dossier de l'extension dans une popup HTML et l'utiliser dans une notification ?
		*Dans le fichier Manifest V3, le chemin de l'image doit respecter le format `resources` dans la clé `web_accessible_resources` du Manifest.*
		*Pour récupérer l'URL d'une image dans un script, on utilise l'API' `runtime` et sa méthode `getURL`.*

	10. Remplir les trous 1 et 2 en utilisant les méthodes recommandées.
		```js
		// content.js
		window.addEventListener('click', function(e) {
			chrome.runtime.{{ 1 }}(e.target.href);
		});

		// background.js
		chrome.runtime.{{ 2 }}.addListener(e => {
			console.log(e);
		});
		```
		[ ] sendRequest
		[2] onMessage
		[ ] onRequest
		[1] sendMessage


# Vidéos (1h 30 min)
1. Présentation du cours et des formateurs (5-10 min)
	- Chacun se présente
	- Tenants et aboutissants du cours
2. Live coding
3. Live coding
	- Présentation

# Live Coding
0. Setup de l'HTML, CSS et JS
	- Création d'interface
	- Ajouter du dynamisme

1. Bases de l'extension (Le squelette)
	- Explication du sujet
	- Pourquoi la faire et à quoi elle sert ?
	- Setup du projet et conseils
2. Les APIs
	- Listener sur les clics et sélection
	- Communication entre les pages de contenu et d'arrière-plan
	- Notification
	- Storage
3. 
4. 