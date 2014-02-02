// This code is provided in raw form so that it could be modified according to javascript specification at any time.

function SelectorList(list, options) {

    //Properties 
    this.Data = $([]);
    this.SelectedIndex = -1;
    this.UIContainer = $(list);
    this.IsVisible = false;

    //Settings
    this.Settings = $.extend({}, {
        defaultIndex: 0,
        selectedItemClass: "selectorpanel-selecteditem",
        itemClass: "selectorpanel-item",
        itemTemplate: "<li></li>",
        itemdataattribute: "index",
        onClickedCallback: null,
        onSelectionChangedCallback: null
    }, options);

    //Public - Clears the list items.
    this.clear = function () {
        var $this = this;
        $this.Data = $([]);
        $this.UIContainer.empty();
        $this.SelectedIndex = -1;
    }

    //Public - Creates list items by removing previous.
    this.setData = function (data) {
        var $this = this;
        $this.clear();
        if(data && data.length > 0)
        {
            $this.Data = $(data);
            render($this);
            $this.SelectedIndex = $this.Settings.defaultIndex;
        }
    }

    //public - return selected data item.
    this.getSelected = function () {
        if (this.SelectedIndex > -1) {
            return this.Data[this.SelectedIndex];
        }
        return null;
    }

    //Public - sets selected list item.
    this.setSelected = function (index) {
        var $this = this;
        var $children = $this.UIContainer.children();
        var $settings = $this.Settings;
        if (index > -1 && index < $children.length) {
            $children.each(function (i, item) {
                decorateItem($settings.selectedItemClass, $(item), index, i);
            });
            $this.SelectedIndex = index;
            if ($settings.onSelectionChangedCallback != null) {
                $settings.onSelectionChangedCallback.apply($this);
            }
        }
    }

    //Public - changes visibility of the list.
    this.setVisible = function (visible) {
        var $this = this;
        if (visible && !$this.IsVisible) {
            $this.UIContainer.show();
            $this.IsVisible = true;
        }
        else if (!visible && $this.IsVisible) {
            $this.UIContainer.hide();
            $this.IsVisible = false;
        }
    }

    //Private Event - raised when a list item is clicked
    var onClick = function (args) {
        var $this = this;
        var $target = $(args.target);
        var $settings = $this.Settings;
        this.setSelected(parseInt($target.data($settings.itemdataattribute)));
        if ($settings.onClickedCallback != null) {
            $settings.onClickedCallback.apply($this);
        }
    }

    //Private Static - creates list items using data property
    // to use complete data item structure such as { name: "anyname", data: "anyhash" } change this method
    var render = function ($this) {
        var $settings = $this.Settings;
        $this.UIContainer.empty();
        $this.Data.each(function (i, item) {
            var listItem = $($settings.itemTemplate).attr('data-' + $settings.itemdataattribute, i).addClass($settings.itemClass).append(item);
            decorateItem($settings.selectedItemClass, listItem, $this.SelectedIndex, i);
            $this.UIContainer.append(listItem);
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

    // binds all list items to onClick event in one go.
    this.UIContainer.on('click', 'li', contextBinder(onClick, this));

}
