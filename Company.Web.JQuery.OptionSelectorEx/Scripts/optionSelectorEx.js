// This code is provided in raw form.
// It should be modified according to javascript specification at any time.
; function optionSelectorEx(options) {

    "use strict";

    var self = this;

    //Settings
    var _Settings = $.extend({}, {
        lists: [
            {
                listClass: "selectorlist",
                itemClass: "selectorlist-item",
                selectedItemClass: "selectorlist-selecteditem",
            },
            {
                listClass: "selectorlist",
                itemClass: "selectorlist-item",
                selectedItemClass: "selectorlist-selecteditem",
            },
            {
                listClass: "selectorlist",
                itemClass: "selectorlist-item",
                selectedItemClass: "selectorlist-selecteditem",
            }
        ],
        defaultList: 1,
        defaultIndex: 0,
        rootListClass: "mainselectorlist",
        rootListItemClass: "mainselectorlist-item",
        listTemplate: "<ul style='padding: 0; margin: 0; list-style-type: none; z-index: 999999;'></ul>",
        itemTemplate: "<li></li>",
        itemdataattribute: "index",
        events: {
            onClicked: null,
            OnSelectionChanged: null
        }
    }, options);

    this.tag = null;

    //Properties 
    var _IsVisible = true;
    var _Data = null;
    var _SelectedIndexes = [];
    var _UIRoot = $(_Settings.listTemplate).addClass(_Settings.rootListClass);
    var _DisplayType = _UIRoot.css("display");
    var _UILists = [];

   $.each(_Settings.lists, function (index, listInfo) {
        _SelectedIndexes[index] = -1;
        var $list = $(_Settings.listTemplate).addClass(listInfo.listClass);
        var $rootItem = $(_Settings.itemTemplate).addClass(_Settings.rootListItemClass).append($list);
        _UIRoot.append($rootItem).addClass(_Settings.rootListClass);
        _UILists.push($list);
    });

    var _ActiveListIndex = _Settings.defaultList;

    this.getSettings = function () {
        return _Settings;
    }

    this.getUIRoot = function () {
        return _UIRoot;
    }
    
     this.getUILists = function () {
        return _UILists;
    }

    this.getData = function () {
        return _Data;
    }

    this.getSelectedIndex = function () {
        return _SelectedIndexes[_ActiveListIndex];
    }

    this.getActiveListIndex = function () {
        return _ActiveListIndex;
    }

    this.getDisplayType = function () {
        return _DisplayType;
    }

    this.getVisibility = function () {
        return _IsVisible;
    }

    //Public - Clears the list items.
    this.clear = function () {
        _Data = null;
        $.each(_UILists, function (index, item) { item.empty() });
        $.each(_SelectedIndexes, function(index, item) { item = -1 });
        _ActiveListIndex = _Settings.defaultList;
    }

    //Public - Creates list items by removing previous.
    this.setData = function (data) {
        this.clear();
        if (data && data.length === _UILists.length) {
            _Data = data;
            initialRender(this);
            this.setSelected(_Settings.defaultIndex);
        }
    }

    //public - return selected data item.
    this.getSelected = function () {
        if (_Data && _SelectedIndexes[_ActiveListIndex] > -1) {
            return _Data[_ActiveListIndex][_SelectedIndexes[_ActiveListIndex]];
        }
        return null;
    }

    //Public - sets selected list item.
    this.setSelected = function (index, listIndex) {
        var $settings = _Settings;

        if (typeof listIndex != "number") {
            listIndex = _ActiveListIndex;
        }

        if (listIndex > -1 && listIndex < _UILists.length) {
            if (index > -1 && index < _UILists[listIndex].children().length) {

                $.each(_UILists, function (j, $list) {
                    var $children = _UILists[j].children();

                    $children.each(function (i, item) {
                        if (j != listIndex) {
                            decorateItem($settings.lists[j].selectedItemClass, $(item), -1, i);
                        }
                        else {
                            decorateItem($settings.lists[j].selectedItemClass, $(item), index, i);
                        }
                    });

                    _ActiveListIndex = listIndex;
                    _SelectedIndexes[_ActiveListIndex] = index;

                });

                if ($settings.events.OnSelectionChanged != null) {
                    $settings.events.OnSelectionChanged.call(this);
                }
            }
        }
    }

    //Public - changes visibility of the list.
    this.setVisible = function (visible) {
        if (visible && !_IsVisible) {
            _UIRoot.css("display", _DisplayType);
            _IsVisible = true;
        }
        else if (!visible && _IsVisible) {
            _DisplayType = _UIRoot.css("display");
            _UIRoot.css("display", "none");
            _IsVisible = false;
        }
    }

    //Public - changes locatin of the list within the page.
    this.setPosition = function (location) {
        _UIRoot.css(location);
    }

    //Private Event - raised when a list item is clicked
    var onClicked = function (e) {
        var $listitem = $(e.target);
        var $settings = _Settings;
        this.setSelected(parseInt($listitem.data($settings.itemdataattribute), 10), getListIndex($listitem.parent()));
        if ($settings.events.onClicked != null) {
            $settings.events.onClicked.call(this, e);
        }
    }

    //Private Static - creates list items using data property
    // To use complete data item structure such as { name: "anyname", data: "anyhash" } change this method.
    // To use elements other than list change this method.
    var initialRender = function ($this) {
        var $settings = $this.getSettings();

        $.each($settings.lists, function (j, listInfo) {
            var $list = $this.getUILists()[j];
	    var data = $this.getData();
            if (data) {
                $.each(data[j], function (i, dataItem) {
                    var $listItem = $($settings.itemTemplate).attr('data-' + $settings.itemdataattribute, i).addClass(listInfo.itemClass).append(dataItem);
                    decorateItem(listInfo.selectedItemClass, $listItem, -1, i);
                    $list.append($listItem).addClass(listInfo.listClass);
                });
            }
        });
    }

    var getListIndex = function ($list) {
        for (var x = 0; x < _UILists.length; x++) {
            if (_UILists[x].is($list)) {
                _ActiveListIndex = x;
                break;
            }
        }
    }

    //Private Static - decorates item by adding/removing css classes
    var decorateItem = function (cssClass, item, selIndex, currIndex) {
        if (selIndex != currIndex) {
            item.removeClass(cssClass);
        }
        else if (!item.hasClass(cssClass)) {
            item.addClass(cssClass);
        }
    }

    //Private Static - changes function scope so that 'this' could point to source object
    var contextBinder = function (func, scope) {
        if (func.bind) {
            return func.bind(scope);
        } else {
            return function () {
                func.apply(scope, arguments);
            };
        }
    };

    // binds all list items to onClicked event in one go.
    // If we change the ui element from List to something else we need to handle the event binding below.
    $.each(_UILists, function (index, list) {
        list.on('click', 'li', contextBinder(onClicked, self));
    });
}
