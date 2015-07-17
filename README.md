# trello-bookmarklets

This repository contains my [bookmarklets](https://en.wikipedia.org/wiki/Bookmarklet) for [Trello](https://trello.com/). Currently, it only contains a single bookmarklet - `trello-doing-cards-bookmarklet.js` (to show "Doing" Trello cards across **all** your Trello boards) - but also contains `trello.bookmarklet.core.js`. This file contains the "core" functions need to create a Trello bookmarklet. This core file was created directly from [Trello-Bookmarklet](https://github.com/danlec/Trello-Bookmarklet). Trello-Bookmarklet was instrumental in figuring out how to write a Trello bookmarklet but I wanted to encapsulate all the boilerplate code need into a single "core" file.

### Usage

    javascript:(function (a) { var b = a.createElement("script"); b.src = "https://rawgit.com/smichelotti/trello-bookmarklets/master/trello-doing-cards-bookmarklet.js"; a.getElementsByTagName("head")[0].appendChild(b);})(document);
