/*
  1 未封装成插件形式,js可以修改的部分都标出
  2 样式的改变在css中,包括slider的样式\slider容器的样式以及最外层的容器的样式
  3 需要注意的点:
    页面可touch区域有左右两边侧栏\主屏
    两个slider中间区域touch无效,在touchmove事件中做过处理
    scale会影响定位值,scale值手动设置.
    touch事件必须阻止默认事件，preventDefault();
    translate 值的改变需要兼容到各浏览器
    包括css样式，也需要兼容到各浏览器
    移动端滑动会出现闪烁效果，在css代码中已经解决

    滑动块和父元素之间的间距由 父元素设置padding值而获得。
    父元素的长宽取决于padding值与滑动块的长宽和。

    设置元素缩放和切换的类，类名可修改。

*/


$().ready(function() {
    // 初始化
    var sliderBox = $(".js-slider-box");
    var slider = $(".js-slider-box div");
    var sliderNum = slider.length;
    var jsScreen = $(".screen");
    var padding = {
        left: parseInt(jsScreen.css("padding-left")),
        right: parseInt(jsScreen.css("padding-right"))
    }
    var width = parseInt(jsScreen.css("width"));
    var sliderWidth = width - padding.left - padding.right;
    var current, currentLeft, currentRight;
    // class

    //  这块可修改
    var scale = "scale";
    var active = "active"
    var transition = "transition";
    var scaleNum = 0.9;
    var pos = {},
        start = {},
        move = {},
        distance = {};
    var direction = 0;
    var spacing = 80;
    // set index
    for (var i = 0; i < sliderNum; i++) {
        $(slider[i]).attr("slider-index", i);
        $(slider[i]).addClass(scale);
    }
    $(slider[0]).removeClass(scale).addClass(active);
    // set width
    sliderBox.width(sliderWidth * sliderNum);
    //  绑定事件
    sliderBox.bind("touchstart", function(e) {

        e.preventDefault();
       
        sliderBox.removeClass(transition);
        sliderStart(e);

    });
    sliderBox.bind("touchmove", function(e) {
        e.preventDefault();
  
        sliderMove(e);
    });
    sliderBox.bind("touchend", function(e) {
        e.preventDefault();
        sliderBox.addClass(transition);
        sliderEnd(e);
    });
    // touchstart 绑定的函数
    var sliderStart = function(e) {

        var sliderLeft = slider[0].getBoundingClientRect().left;
        var sliderBoxLeft = jsScreen[0].getBoundingClientRect().left + padding.left;
        var touchPoint = e.targetTouches[0];
        start = {
            x: touchPoint.clientX
        }

        var current = $(e.target);
        var index = parseInt(current.attr("slider-index"));
        pos = {
            x: sliderLeft - sliderBoxLeft - Math.round(sliderWidth * (1 - scaleNum) / 2)
        }
        if (current.hasClass("active") && index == 0) {
            pos = {
                x: sliderLeft - sliderBoxLeft
            }
        }

    }
    var sliderMove = function(e) {

        var touchPoint = e.targetTouches[0];
        var current = $(e.target);
        var index = parseInt(current.attr("slider-index"));
        move = {
            x: touchPoint.clientX
        };
        distance = {
            x: Math.round(pos.x + move.x - start.x)
        }
        if (current.attr("slider-index")) {

            translateSet(distance.x);
        }
        direction = Math.round(move.x - start.x);
    }
    var sliderEnd = function(e) {
            var distance = Math.abs(direction);
            current = $(e.target);
            currentLeft = current.prev();
            currentRight = current.next();
            var index = parseInt(current.attr("slider-index"));
            // 如果点击的是主屏
            if (current.hasClass(active)) {
                // 如果移动距离大于切换值
                if (distance > spacing) {
                    current.removeClass(active).addClass(scale);
                    // 左边滑动
                    if (direction < 0) {
                        currentRight.removeClass(scale).addClass(active);
                        sliderNext(index);
                    } else {
                        currentLeft.removeClass(scale).addClass(active);
                        sliderPrev(index);
                    }
                }
                // 小于切换值
                else {
                    sliderReset(index);
                }
                direction = 0;
                return;
            }
            // 如果点击的是右边栏
            if (currentLeft.hasClass(active)) {
                var rightSide = true;
                if (distance > spacing) {
                    if (direction < 0) {
                        current.removeClass(scale).addClass(active);
                        currentLeft.removeClass(active).addClass(scale);
                        sliderNext(index - 1, rightSide);
                    } else {
                        current.removeClass(active).addClass(scale);
                        currentLeft.removeClass(scale).addClass(active);
                        sliderPrev(index, rightSide);
                        
                    }
                } else {
                    sliderReset(index - 1);
                }
                direction = 0;
                return;
            }
            // 如果点击的是左边栏
            if (currentRight.hasClass(active)) {
                // var leftSide = true;
                var rightSide = false;
                if (distance > spacing) {
                    if (direction < 0) {
                        console.log("hello")
                        sliderNext(index, rightSide);
                        // 向右边滑动
                    } else {
                        current.addClass(active).removeClass(scale);
                        currentRight.addClass(scale).removeClass(active);
                        sliderPrev(index + 1);
                    }
                } else {
                    sliderReset(index + 1);
                }
                direction = 0;
                return;
            }
        }





        // 样式设置
    var translateSet = function(coordinates) {
            var str = "translate(" + coordinates+"px)";
            sliderBox.css({
                "transform": str,
                "-webkit-transform":str,
                "-moz-transform":str,
                "-ms-transform":str,
                "-o-transform":str
            });
        }
        // 往左滑动
    var sliderNext = function(index, rightSide) {
            var rightSide = false || rightSide;
            var bounding = sliderNum - 1;
            if (index == bounding && !rightSide) {
                var coordinates = -sliderWidth * (index);
                current.addClass(active).removeClass(scale);
            } else if (index == bounding && rightSide) {
                var coordinates = -sliderWidth * (index);
            } else {
                var coordinates = -sliderWidth * (index + 1);
            }
            translateSet(coordinates);
        }
        // 往右滑动
    var sliderPrev = function(index, rightSide) {
            var rightSide = false || rightSide;
            if (index == 0 && !rightSide) {
                var coordinates = -sliderWidth * (index);
                current.addClass(active).removeClass(scale);
            } else if (index == 0 && rightSide) {
                var coordinates = -sliderWidth * (index);
            } else {
                var coordinates = -sliderWidth * (index - 1);
            }
            translateSet(coordinates);
        }
        // 复位
    var sliderReset = function(index) {
        var coordinates = (-sliderWidth * index);
        translateSet(coordinates);
    }
});