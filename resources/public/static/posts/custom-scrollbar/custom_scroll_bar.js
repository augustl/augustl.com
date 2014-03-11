// Proof of concept cowboy code.
(function (){
    jQuery(".custom_scroll_bar").each(function (i, element) {
        element = jQuery(element);

        // Applying the final styles.
        element.addClass("retained");

        // Hindering click-select-and-hold horizontal scrolling.
        element.bind("scroll", function () {
            this.scrollLeft = 0;
            this.scrollTop = 0;
        });

        // The handle.
        var scrollBarHandle = jQuery(document.createElement("div"));
        scrollBarHandle.attr({"class": "custom_scroll_bar_handle"});
        element.append(scrollBarHandle);

        // Getting some numbers
        var nativeScroll = element.find(".native");
        var contentHeight = nativeScroll.get(0).scrollHeight - nativeScroll.height();
        var boxHeight = element.height() - scrollBarHandle.height();
        var scrollBarHandlePosition = 0;
        var isScrollingWithMouse = false;

        // Moving the scroll handle when scrolling with mouse, arrow keys,
        // page up, page down, etc.
        nativeScroll.bind("scroll", function (e) {
            var position = nativeScroll.scrollTop() / contentHeight;
            var scrollPosition = position * boxHeight;
            scrollBarHandle.css("top", scrollPosition + "px");

            if (!isScrollingWithMouse) {
                currentScrollPosition = scrollPosition;
            }
        });

        var currentScrollPosition = 0;
        // Scrolling the native scroll when moving the handle with the mouse
        scrollBarHandle.bind("mousedown", function (e) {
            var startY = e.clientY;
            var win = jQuery(document);
            var scrollPosition;
            isScrollingWithMouse = true;

            var mousemove = function (e) {
                scrollPosition = (e.clientY - startY) + currentScrollPosition;
                var contentPosition = scrollPosition / boxHeight;
                nativeScroll.scrollTop(contentHeight * contentPosition);
            };

            win.bind("mousemove", mousemove)
            win.bind("mouseup", function () {
                currentScrollPosition = Math.ceil((nativeScroll.scrollTop() / contentHeight) * boxHeight);
                win.unbind("mousemove", mousemove);
                isScrollingWithMouse = false;
            });

            return false;
        });

        // Disabling text selection in IE
        scrollBarHandle.bind("selectstart", function () {
            return false;
        });
    });
}());