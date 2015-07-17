(function (window) {
    'option strict';
    /*globals async, Trello */
    // Usage: javascript:(function(a){window.trelloAppKey="optional";window.trelloIdList="optional";var b=a.createElement("script");b.src="https://dl.dropboxusercontent.com/u/20432002/active-trello-cards.js";a.getElementsByTagName("head")[0].appendChild(b)})(document);
    
    window.trelloBookmarkletCore = window.trelloBookmarkletCore || {};

    window.trelloBookmarkletCore.init = init;
    window.trelloBookmarkletCore.overlayPrompt = overlayPrompt;


    var appKeyName = 'trelloAppKey',
        mainCallback, $;


    function init(callback) {
        mainCallback = callback;
        loadJQuery();
    }

    function loadJQuery() {
        if (window.jQuery) {
            jQueryLoaded();
        } else {
            var script = document.createElement("script");
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js';
            script.onload = function () {
                jQueryLoaded();
            }
            document.getElementsByTagName("head")[0].appendChild(script);
        }

        function jQueryLoaded() {
            $ = window.jQuery;
            loadAsync();
        }
    }

    //    loadJQuery();

    function loadAsync(callback) {
        $.ajaxSetup({ cache: true });
        $.getScript("https://cdnjs.cloudflare.com/ajax/libs/async/1.3.0/async.min.js", function () { executeSequence(); });
    }
    
    
    /********** Start Main Execution **********/

    function executeSequence() {
        async.waterfall([
            getAppKey,
            loadTrelloClient,
            authorizeTrello,
            mainCallback
        ]);
    }



    function getAppKey(callback) {
        var appKey = store(appKeyName) || window[appKeyName];
        if (appKey && appKey.length == 32) {
            callback(null, appKey);
        }
        else {
            overlayPrompt("Please specify your Trello API Key (you'll only need to do this once per site)<br><br>You can get your API Key <a href='https://trello.com/1/appKey/generate' target='apikey'>here</a><br><br>", true, function (newAppKey) {
                if (newAppKey) {
                    callback(null, newAppKey);
                }
            })
        }
    }


    function loadTrelloClient(appKey, callback) {
        $.getScript("https://trello.com/1/client.js?key=" + appKey, function () { callback(); });
    }

    function authorizeTrello(callback) {
        store(appKeyName, Trello.key())
        if (!Trello) {
            console.error('Trello not loaded. You need to be logged into Trello to run this bookmarklet.');
            return;
        }

        Trello.authorize({
            interactive: false,
            success: callback,
            error: function () {
                Trello.authorize({
                    type: "popup",
                    expiration: "never",
                    scope: { read: true, write: true },
                    success: callback
                });
            }
        });
    }


    /********** Helper Methods **********/
    function overlayPrompt(html, hasInput, callback) {
        var done = function (value) {
            $div.remove();
            $overlay.remove();
            if (callback) {
                callback(value);
            }
        };

        // Cover the existing webpage with an overlay
        var $overlay = $("<div>")
            .css({
                background: "#000",
                opacity: .75,
                "z-index": 1e4,
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            })
            .appendTo("body")
            .click(function () {
                done(null);
            })

        // Show a "popup"
        var $div = $("<div>")
            .css({
                position: "absolute",
                border: "1px solid #000",
                padding: "16px",
                width: 300,
                top: 64,
                left: ($(window).width() - 200) / 2,
                background: "#fff",
                "z-index": 1e5
            })
            .appendTo("body");

        // Show the prompt
        $("<div>").html(html).appendTo($div);

        // Optionally show an input
        var $input = $("<input>")
            .css({
                width: "100%",
                "margin-top": "8px"
            })
            .appendTo($div)
            .toggle(hasInput);

        // Add an "OK" button
        $("<div>")
            .text("OK")
            .css({
                width: "100%",
                "text-align": "center",
                border: "1px solid #000",
                background: "#eee",
                "margin-top": "8px",
                cursor: "pointer"
            })
            .appendTo($div)
            .click(function () {
                done($input.val());
            });

        return $div;
    }

    function store(key, value) {
        if (arguments.length == 2) {
            return (window.localStorage[key] = value);
        } else {
            return window.localStorage[key];
        }
    }
})(window);