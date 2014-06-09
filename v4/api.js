function WallpaperApi() {
    var api = this;
    this.apiUrl = "https://wallpapers.carroarmato0.be/v4/api/";
    this.format = "json";
    this.siteUrl = "https://wallpapers.carroarmato0.be/";
    var loadingInProgress = 0;

    var _onLoading = function () {
        loadingInProgress++;
        if (api.onLoading && loadingInProgress == 1) api.onLoading();
    };
    var _onLoaded = function () {
        loadingInProgress--;
        if (api.onLoaded && loadingInProgress == 0) api.onLoaded();
    }

    this.GetImageById = function (id, callback) {
        _onLoading();
        $.getJSON(this.apiUrl + '?request=getImageByID&id=' + (id * 1) + '&format=' + this.format, function (data) {
            if (callback) callback(data);
            _onLoaded();
        });
    }
    this.GetImages = function (callback) {
        _onLoading();
        $.getJSON(this.apiUrl + '?request=getImages&format=' + this.format, function (data) {
            if (callback) callback(data);
            _onLoaded();
        });
    }

    this.GetImageUrl = function (url) {
        return this.siteUrl + url;
    };

    this.onLoading = function () { };
    this.onLoaded = function () { };
}
