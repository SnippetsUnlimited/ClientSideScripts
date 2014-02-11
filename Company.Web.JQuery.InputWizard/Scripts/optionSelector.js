// This code is provided in raw form.
// It should be modified according to javascript specification at any time.
; function optionSelector(options) {

    "use strict";

    //Settings
    var _Settings = $.extend({}, {
        defaultIndex: 0,
        listClass: "selectorlist",
        itemClass: "selectorlist-item",
        selectedItemClass: "selectorlist-selecteditem",
        rootTemplate: "<ul style='padding: 0; margin: 0; list-style-type: none; z-index: 999999;'></ul>",
        itemTemplate: "<li></li>",
        itemdataattribute: "index",
        events: {
            onClicked: null,
            OnSelectionChanged: null
        }
    }, options);

    this.tag = null;

    //Properties 
    var _Data = [];
    var _SelectedIndex = -1;
    var _IsVisible = true;
    var _UIRoot = $(_Settings.rootTemplate).addClass(_Settings.listClass);
    var _DisplayType = _UIRoot.css("display");

    this.getSettings = function () {
        return _Settings;
    }

    this.getUIRoot = function () {
        return _UIRoot;
    }

    this.getData = function () {
        return _Data;
    }

    this.getSelectedIndex = function () {
        return _SelectedIndex;
    }

    this.getDisplayType = function () {
        return _DisplayType;
    }

    this.getVisibility = function () {
        return _IsVisible;
    }

    //Public - Clears the list items.
    this.clear = function () {
        _Data = [];
        _UIRoot.empty();
        _SelectedIndex = -1;
    }

    //Public - Creates list items by removing previous.
    this.setData = function (data) {
        this.clear();
        if (data && data.length > 0) {
            _Data = data;
            initialRender(this);
            this.setSelected(_Settings.defaultIndex);
        }
    }

    //public - return selected data item.
    this.getSelected = function () {
        if (_SelectedIndex > -1) {
            return _Data[_SelectedIndex];
        }
        return null;
    }

    //Public - sets selected list item.
    this.setSelected = function (index) {
        var $children = _UIRoot.children();
        var $settings = _Settings;

        if (index > -1 && index < $children.length) {
            $children.each(function (i, item) {
                decorateItem($settings.selectedItemClass, $(item), index, i);
            });
            _SelectedIndex = index;
            if ($settings.events.OnSelectionChanged != null) {
                $settings.events.OnSelectionChanged.call(this);
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
        this.setSelected(parseInt($listitem.data($settings.itemdataattribute), 10));
        if ($settings.events.onClicked != null) {
            $settings.events.onClicked.call(this, e);
        }
    }

    //Private Static - creates list items using data property
    // To use complete data item structure such as { name: "anyname", data: "anyhash" } change this method.
    // To use elements other than list change this method.
    var initialRender = function ($this) {
        var $settings = $this.getSettings();
        var $root = $this.getUIRoot();
        $root.empty();
        $.each($this.getData(), function (i, item) {
            var listItem = $($settings.itemTemplate).attr('data-' + $settings.itemdataattribute, i).addClass($settings.itemClass).append(item);
            decorateItem($settings.selectedItemClass, listItem, $this.getSelectedIndex(), i);
            $root.append(listItem);
        });
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
    _UIRoot.on('click', 'li', contextBinder(onClicked, this));
}
