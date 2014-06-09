function ViewBox(containerSelector, childSize) {
    var viewBox = this;
    var children = null;
    var childTemplate = $('<div></div>');
    var container = $(containerSelector);

    var center = true;

    var childWidth = childSize && childSize.width ? childSize.width : 160;
    var childHeight = childSize && childSize.height ? childSize.height : 90;

    var scrollBox = $('<div></div>');
    container.css('overflow', 'auto');
    scrollBox.css('position', 'relative');
    container.append(scrollBox);
    childTemplate.remove();
    var positionChild = function (child, index, columnCount) {
        var row = Math.floor(index / columnCount);
        var column = index % columnCount;

        child.css('top', row * childHeight + 'px');
        if (!center)
            child.css('left', column * childWidth + 'px');
        else {
            var width = container.width();
            var offset = (width - childWidth * columnCount) / 2;
            child.css('left', offset + column * childWidth + 'px');
        }
    }
    var createChild = function (index) {
        var child = childTemplate.clone();
        child.addClass('virtualItem');
        child.css('position', 'absolute');
        scrollBox.append(child);
        child.data('index', index);
        viewBox.populateChild(child, children[index]);
        return child;
    }
    this.populateChild = function (child, data) {
        child.text(data);
    }
    this.populateTemplate = function (template, item) {
        template.text(item);
    }

    var update = function () {
        if (children == null) {
            scrollBox.children('.virtualItem').remove();
            return;
        }
        var itemCount = children.length;
        var columnCount = Math.floor(container.width() / childWidth);
        var rowCount = itemCount / columnCount;
        scrollBox.height(rowCount * childHeight);
        var visibleRows = Math.ceil(container.height() / childHeight) + 2;
        var visibleItems = visibleRows * columnCount;
        var offset = container.scrollTop();
        var firstRow = Math.floor(offset / childHeight);
        firstRow = Math.max(0, firstRow - 1);
        var firstItem = firstRow * columnCount;
        var lastItem = firstItem + visibleItems;
        lastItem = Math.min(lastItem, children.length - 1);
        var lowestVisibleIndex = lastItem;
        var highestVisibleIndex = 0;
        var virtualChildren = scrollBox.children('.virtualItem');
        //console.log(firstItem);
        //console.log(visibleItems);
        //console.log(lastItem);
        virtualChildren.each(function () {
            var child = $(this);
            var childIndex = $(this).data('index');

            if (childIndex < firstItem || childIndex > lastItem) {
                // remove nodes outside the visible range
                child.remove();
            }
            else {
                positionChild(child, childIndex, columnCount, firstRow);
                lowestVisibleIndex = Math.min(lowestVisibleIndex, childIndex);
                highestVisibleIndex = Math.max(highestVisibleIndex, childIndex);
            }
        });
        // create new nodes before visible nodes
        for (var i = firstItem; i <= lowestVisibleIndex; i++) {
            if (i >= children.length) break;
            var child = createChild(i);
            positionChild(child, i, columnCount);
            highestVisibleIndex = Math.max(highestVisibleIndex, i);
        }
        // create new nodes after visible nodes
        for (var i = highestVisibleIndex + 1; i <= lastItem; i++) {
            if (i >= children.length) break;
            var child = createChild(i);
            positionChild(child, i, columnCount);
        }

        $("a.gallery").fancybox();
    }

    this.setChildren = function (childrenData) {
        children = childrenData;
        scrollBox.children('.virtualItem').remove();
        update();
    }

    container.scroll(update);
    $(container).resize(update);
}
