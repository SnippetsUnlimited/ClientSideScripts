//*********************************************************************************************
// This code cannot be used without explicit permission.
// Illegal use of this code may result in penal penalties.
// For permissions and licencing please contact:
// contib2012[ignore][at][ignore]gmail[ignore][dot][ignore]com[ignore]
//*********************************************************************************************

;(function ($) {

    "use strict";

    // global callback manager.
    var searchOptimizer = function (func) {
        var args, release, blocked;

        var release = function () { blocked = false; };
        if (blocked) {
            console.log("blocked");
            return;
        }

        blocked = true;
        args = Array.prototype.slice.call(arguments);
        args.unshift(release);
        func.apply(this, args);
    };

    var isPrintable = function (code) {
        return (
            (code > 47 && code < 58) || // number keys
            (code === 32) || // spacebar & return key(s) (if you want to allow carriage returns)
            //(code === 13) ||
            (code > 64 && code < 91) || // letter keys
            (code > 95 && code < 112) || // numpad keys
            (code > 185 && code < 193) || // ;=,-./` (in order)
            (code > 218 && code < 223));   // [\]' (in order)
    };

    $.inputWizardEx = function (element, options) {

        var $element = $(element);

        var _Settings = $.extend({}, {
            popupSettings: [],
            popupOffset: { top: 0, left: 0 },
            inputManagerClass: "inputmanager-main",
            fullTextMatching: true,
            selectOnSpacebar: false,
            triggers: null,
            events: {
                onDataLoad: null
            },

        }, options);

        var searchCache = (function () {
            var cache = {};

            return {
                setSearchCache: function (term, results) {
                    cache[term] = results;
                },
                getSearchCache: function (term) {
                    return cache[term];
                }
            }
        })();

        var _OptionSelector = new optionSelectorEx({
            lists: _Settings.popupSettings.lists,
            defaultListIndex: _Settings.popupSettings.defaultListIndex,
            defaultIndex: _Settings.popupSettings.defaultIndex,
            events: {
                onClicked: function (e) {
                    $element.focus();
                    this.setVisible(false);
                    processSelection(this, $element);
                }
            }
        });

        // make option selector invisible initially.
        _OptionSelector.setVisible(false);

        // save types text to compare with new and detect the changes
        var _CachedText = "";
        var _CachedLocation = 0;

        var _InputManager = new inputManager($element, {
            containerClass: _Settings.inputManagerClass,
            events: {
                onKeyup: function (e) {
                    var $selector = _OptionSelector;
                    var preLength = e.preText.length;
                    var keyCode = e.keyCode;
                    var ctrlKey = e.ctrlKey;
                    var fullTextMatching = _Settings.fullTextMatching;
                    var forcePopup = false;
                    var preText = e.preText;


                    // if fullTextMatching is disabled then check for ctrl+space to activate the popup/optionselector
                    if (!fullTextMatching && ctrlKey == true && keyCode == 32) {
                        e.preventDefault();
                        forcePopup = true;
                    }

                    // use option selector if text under the cursor is changed or ctrl+space is clicked 
                    if (forcePopup || (preText && preLength > 0 && _CachedText != preText)) {
                        _CachedText = preText;

                        // force popup anyways or else check if there was a ligitimate printable key was pressed.
                        if (!forcePopup) {
                            if (!$selector.getVisibility() && !(isPrintable(keyCode) || keyCode > 255)) {
                                return;
                            }
                        }

                        // searchInfo represents a set trigger, term and results.
                        var searchInfo = null;

                        // check which trigger triggers search in order.
                        $.each(_Settings.triggers, function (key, trigger) {
                            var result = null;
                            var matches = null;

                            // if autopoup is enable and a force popup open is detected get matches. we will need this.
                            if (fullTextMatching || forcePopup) {
                                matches = preText.match(trigger.match);
                            }

                            // if autopop is is disabled we still need to load matches based on cursor location.
                            if (!fullTextMatching) {

                                // we need to know the cursor location.
                                if (!$selector.getVisibility()) {

                                    if (forcePopup && matches) {
                                        // if forcepopup is detected use matches to get to get cursor location. 
                                        _CachedLocation = preText.length - matches[matches.length - 1].length;
                                    }
                                    else {
                                        // last entered character is upon the cursor location.
                                        _CachedLocation = preText.length - 1;
                                    }
                                }
                                // get matches again based on the text selected
                                matches = preText.substring(_CachedLocation).match(trigger.match);
                            }



                            // if there are matches break the loop with findings.
                            if (matches) {
                                var term = matches[matches.length - 1];
                                var cache = searchCache.getSearchCache(term);
                                if (cache && cache[0] == trigger) {
                                    result = cache[1];
                                }
                                else {
                                    searchOptimizer(function (releaseCallback) {
                                        result = trigger.search(term);
                                        releaseCallback();
                                    });
                                }

                                searchCache.setSearchCache(term, [trigger, result]);
                                searchInfo = [trigger, term, result];
                                return;
                            }
                        });

                        // decide whether the popup should finally be displayed or not.
                        var display = (function (info) {
                            var data = info ? info[2] : null;
                            if (data && data.length > 0) {
                                var showList = true;
                                if (_Settings.events.onDataLoad) {
                                    showList = _Settings.events.onDataLoad.call(this, data);
                                }
                                $selector.tag = { preText: e.preText, postText: e.postText, data: info };
                                $selector.setData(data, info[0].formatter);
                                return showList;
                            }
                            $selector.tag = null;
                            return false;
                        })(searchInfo);

                        // make display popup only if not visible already and hide if displaed already
                        if (display && !$selector.getVisibility()) {
                            var position = e.cursorPosition;
                            position.top += _Settings.popupOffset.top;
                            if (position.left) {
                                position.left += _Settings.popupOffset.left;
                            }
                            else {
                                position.right -= _Settings.popupOffset.left;
                            }
                            //more screen bounding checks can be added here.
                            $selector.setPosition(position);
                            $selector.setVisible(true);
                        }
                        else if (!display && $selector.getVisibility()) {
                            $selector.setVisible(false);
                        }
                    }
                },
                onKeydown: function (e) {

                    var keyCode = e.keyCode;
                    var $selector = _OptionSelector;

                    // filter keys only if the popup is displayed.
                    if ($selector.getVisibility()) {
                        if (keyCode === 27) {
                            //escape - this will cancel the option selector.
                            e.preventDefault();
                            $selector.setVisible(false);
                        }
                        else if (keyCode === 38) {
                            //up - this will highlight previous option in the list.
                            e.preventDefault();
                            $selector.setSelected($selector.getSelectedIndex() - 1);
                        }
                        else if (keyCode === 40) {
                            //down - this will highlight the next option in the list.
                            e.preventDefault();
                            $selector.setSelected($selector.getSelectedIndex() + 1);
                        }
                        else if (e.keyCode == 37) { //left
                            e.preventDefault();
                            var nextListIndex = $selector.getSelectedListIndex() - 1;
                            if (nextListIndex > -1) {
                                var itemIndex = $selector.getSelectedIndex();
                                var listItemCount = $selector.getListItemCount(nextListIndex);
                                if (itemIndex >= listItemCount) {
                                    itemIndex = listItemCount - 1;
                                }
                                $selector.setSelected(itemIndex, nextListIndex);
                            }
                        }
                        else if (e.keyCode == 39) { //right
                            e.preventDefault();
                            var nextListIndex = $selector.getSelectedListIndex() + 1;
                            if (nextListIndex < $selector.getListCount()) {
                                var itemIndex = $selector.getSelectedIndex();
                                var listItemCount = $selector.getListItemCount(nextListIndex);
                                if (itemIndex >= listItemCount) {
                                    itemIndex = listItemCount - 1;
                                }
                                $selector.setSelected(itemIndex, nextListIndex);
                            }
                        }
                        else if (keyCode === 13 || (keyCode === 32 && _Settings.selectOnSpacebar)) {
                            //enter - this will process the current state of entry attached to the tag property of option selector
                            e.preventDefault();
                            $selector.setVisible(false);
                            processSelection($selector, $element);
                        }
                        else if (keyCode === 9) {
                            //tab - this will move the focus off the control so hide popup.
                            $selector.setVisible(false);
                        }
                    }
                }
            }
        });

        var processSelection = function (optionSelector, $box) {

            var box = $box.get(0);
            var tag = optionSelector.tag;
            var trigger = tag.data[0];
            var replacement = trigger.replace(optionSelector.getSelected(), tag.data[1], optionSelector.getSelectedListIndex());
            var newpreText = null;
            var newpostText = null;

            if (_Settings.fullTextMatching) {
                if ($.isArray(replacement)) {
                    newpreText = tag.preText.replace(trigger.match, replacement[0]);
                    newpostText = replacement[1] + tag.postText;
                }
                else {
                    newpreText = tag.preText.replace(trigger.match, replacement);
                    newpostText = tag.postText;
                }
            }
            else {
                if ($.isArray(replacement)) {
                    newpreText = tag.preText.substring(0, _CachedLocation) + replacement[0];
                    newpostText = replacement[1] + tag.postText;
                }
                else {
                    newpreText = tag.preText.substring(0, _CachedLocation) + replacement;
                    newpostText = tag.postText;
                }
            }

            $box.val(newpreText + newpostText);

            if (typeof box.selectionEnd === "number") {
                box.selectionStart = box.selectionEnd = newpreText.length;
            }
            else if (box.createTextRange) {
                var range = box.createTextRange();
                range.move('character', newpreText.length);
                range.collapse(false);
                range.select();
            }

        }

        // attached option selector to input manager.
        _InputManager.getUIRoot().append(_OptionSelector.getUIRoot());

        // register event to hide popup when clicked anywhere else on the page.
        $(document.body).bind('click', function (e) {
            if ($(e.target).closest(_OptionSelector).length == 0) {
                _OptionSelector.setVisible(false);
            }
        });

    }

    $.fn.inputWizardEx = function (options) {

        return this.each(function () {
            if (undefined == $(this).data('inputWizardEx')) {
                var plugin = new $.inputWizardEx(this, options);
                $(this).data("inputWizardEx", plugin);
            }
        });

        return this;
    }


    // global cache object.
    var searchCache = {};

    $.fn.inputWizardEx.setSearchCache = function (term, results) {
        searchCache[term] = results;
    }

    $.fn.inputWizardEx.getSearchCache = function (term) {
        return searchCache[term];
    }



})(window.jQuery);