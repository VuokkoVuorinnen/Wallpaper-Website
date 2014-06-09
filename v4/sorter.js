function Sorter() {
    var unsortedData;
    var lastSort;
    var sorter = this;
    this.setData = function (data) {
        lastSort = unsortedData = data;
    }
    this.currentSort;
    this.currentAscend;

    this.getCurrent = function () {
        return lastSort;
    };
    this.sort = function (selector, ascend, converter) {
        // if order is not specified: toggle
        if (ascend == null) {
            ascend = sorter.currentSort == selector && !sorter.currentAscend;
        }
        // if order and selector are the same, don't sort, just return
        if (sorter.currentSort == selector && sorter.currentAscend == ascend) {
            //console.log("no sort, same selector");
            return lastSort;
        }
        if (!unsortedData) return null;
        sorter.currentSort = selector;
        sorter.currentAscend = ascend ? true : false;
        lastSort = unsortedData.slice();
        //console.log('sort: ' + sorter.currentAscend);
        var selectorSplit = selector.split('.');

        lastSort.sort(function (a, b) {
            var aValue = a;
            var bValue = b;
            for (var i in selectorSplit) {
                var selectorPart = selectorSplit[i];
                aValue = aValue[selectorPart];
                bValue = bValue[selectorPart];
            }
            if (converter) {
                aValue = converter(aValue);
                bValue = converter(bValue);
            }
            if (ascend)
                return aValue - bValue;
            else
                return bValue - aValue;
        });

        return lastSort;
    }
}
