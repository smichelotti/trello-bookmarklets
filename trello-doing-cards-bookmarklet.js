(function (window) {
    'option strict';
    /*globals trelloBookmarkletCore, async, Trello */

    loadScript('trelloBookmarkletCore', 'https://dl.dropboxusercontent.com/u/20432002/trello-bookmarklet.core.js');

    function loadScript(windowObjectToCheck, scriptUrl) {
        if (window[windowObjectToCheck]) {
            init();
        } else {
            var script = document.createElement("script");
            script.src = scriptUrl;
            script.onload = function () {
                init();
            }
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    }

    function init() {
        if (!window.trelloBookmarkletCore) {
            console.error('Trello Bookmarklet Core did not load properly.');
            return;
        }

        trelloBookmarkletCore.init(execute);
    }

    var memberId, $;

    function execute() {
        $ = window.jQuery;

        async.waterfall([
            // Get ID for current user
            function (callback) {
                Trello.get('members/me', { fields: 'id' }, function (data) {
                    memberId = data.id;
                    callback(null);
                });
            },
            // Get all open boards
            function (callback) {
                Trello.get('members/me/boards', { filter: 'open' }, function (boards) {
                    callback(null, boards);
                });
            },
            // Get "Doing" Lists from all open boards
            function (openBoards, callback) {
                async.concat(openBoards, function (board, callback) {
                    Trello.get('boards/' + board.shortLink + '/lists', { filter: 'open' }, function (lists) {
                        var doing = $.grep(lists, function (item) {
                            return item.name.indexOf('Doing') !== -1;
                        });
                        var doingLists = doing.map(function (item) {
                            return {
                                name: item.name,
                                board: board,
                                id: item.id
                            };
                        });
                        callback(null, doingLists);
                    });
                }, function (err, doingLists) {
                    callback(null, doingLists);
                });
            },
            // Get all cards across all "Doing" lists
            function (doingLists, callback) {
                async.concat(doingLists, function (list, callback) {
                    Trello.get('lists/' + list.id + '/cards', function (cards) {
                        var myCards = $.grep(cards, function (item) {
                            if (item.idMembers.length === 0)
                                return true;

                            for (var index = 0; index < item.idMembers.length; index++) {
                                var memId = item.idMembers[index];
                                if (memId === memberId) {
                                    return true;
                                }
                            }
                            return false;
                        });

                        var doingCards = myCards.map(function (item) {
                            return {
                                name: item.name,
                                shortUrl: item.shortUrl,
                                list: list.name,
                                board: list.board.name
                            };
                        });
                        callback(null, doingCards);
                    });
                }, function (err, doingCards) {
                    //console.table(doingCards);

                    var htmlResult = '';
                    $.each(doingCards, function (index, card) {
                        htmlResult +=
                        '<h2><a target="_blank" href="' + card.shortUrl + '">' + card.name + '</a></h2>' +
                        '<p>in <strong>' + card.list + '</strong> on <strong>' + card.board + '</strong></p><hr/>';
                    });
                    trelloBookmarkletCore.overlayPrompt(htmlResult, false);
                });
            }
        ]);

    }
})(window);