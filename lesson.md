# APIs
Il existe une multitude d'APIs à notre disposition. Un accès à l'historique, aux favoris, la géolocalisation et bien d'autres encore.

Dans le cadre de ce cours, nous allons parcourir une poignée d'entre elles qui ne nécessitent pas de connaissances avancées.

> Pour votre meilleure compréhension, nous vous conseillons d'effectuer la commande `npm install chrome-types`.
> Cela vous donnera accès à la documentation et auto-complétion des APIs.
> Essayer de survoler les méthodes et paramètres que nous allons aborder dans votre IDE favori (testé sur VSCode) !

## Runtime
### Communication entre scripts
Pour une extension qui a besoin de récupérer les interactions de l'utilisateur, il est nécessaire de pouvoir communiquer entre les scripts de contenu et le script d'arrière-plan.

Pour cela, il existe deux méthodes : `sendMessage` et `sendRequest`.
Il est préférable d'utiliser la paire API / écouteur d'événement `sendMessage / onMessage` au lieu de `sendRequest / onRequest` car en plus d'être dépréciée, cette dernière ne ferme pas la connexion s'il n'y a aucune réponse (voir [référence](https://codereview.chromium.org/9965005/)).
Aucune permission n'est nécessaire pour utiliser ces méthodes.

Voici un exemple d'utilisation pour récupérer les coordonnées de la souris lors d'un clic :
```javascript
// content.js
window.addEventListener('click', function(e) {
	const mouseCoordinates = { x: e.clientX, y: e.clientY };
	chrome.runtime.sendMessage(mouseCoordinates);
});
```

```javascript
// background.js
chrome.runtime.onMessage.addListener(({ x, y }) => {
	console.log(`x: ${x}, y: ${y}`);
});
```

Le résultat du `console.log` s'affiche dans la console de l'extension.
Pour y accéder, il y a plusieurs méthodes :
1. Paramètres de l'extension (ex : `edge://extensions` ou `chrome://extensions`)
	* Aller sur le lien du **service worker** de l'extension
2. Ouvrir la popup de l'extension
	* Clic droit, "inspecter" et ouvrir l'onglet **Console**

## Notifications
### Création
Imaginez que l'on voudrait afficher une notification à l'utilisateur à chaque fois que l'utilisateur clique sur un lien.

Pour cela, il faut utiliser l'API `chrome.notifications` et en particulier sa méthode `create`.
Chaque paramètre est optionnel, mais il est recommandé de spécifier au moins un titre et un message.

```javascript
// background.js
chrome.notifications.create(
	'notificationId', // id de la notification pour la réutiliser
	// options
	{
		type: 'basic', // type de notification
		iconUrl: 'icon.png', //
		title: 'Notification title',
		message: 'Notification message'
	}
);
```

Vous allez avoir besoin de la permission `notifications` pour pouvoir utiliser cette API.

### Storage
C'est maintenant que cela devient intéressant : il est possible de stocker des données dans la notification dans trois espaces différents :
* `local` : stockage local de l'extension
* `session` : stockage local de l'onglet
* `sync` : synchronisé et partagé entre les appareils où l'utilisateur s'est connecté

Nous ferons simple
```javascript
```

## Actions
Anciennement séparé en deux avec `browserAction` et `pageAction`, l'API `action` permet de gérer les actions de l'extension.