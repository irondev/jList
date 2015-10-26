/*! jList 1.4.1
 * Copyright (c) 2012-2015 Raphaël Dardeau
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
(function($) {
	$.fn.jList = function (method) {
		if (!$(this).length) $.error("List does not exist");
		if (methods[method]) {
		  return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
		  return methods.slide.apply(this, arguments);
		} else {
		  $.error('Method ' +  method + ' does not exist');
		}    
	};
	var methods = {
		slide : function(options) {
			/* settings */
			var settings = $.extend({
				'active' : 0, // index of the active item by default, integer or "random"
				'position' : 'horizontal', // horizontal or vertical
				'node' : 1, // number of items at the same level
				'move' : 'all', // number of nodes to move, visible = all visible items
				'speed' : 'normal', // slow, normal or fast
				'auto' : 0, // 1000 = 1sec, 0 = false
				'loop' : false, // true to enable (force move to 1)
				'arrows' : true, // true/false or DOM elements
				'nav' : false, // false or DOM element
				'currentPaging' : false, // false or DOM element
				'totalPaging' : false // false or DOM element
			}, options);
			if (settings.loop && settings.move != 1) settings.move = 1;
			/* init */
			var list = $(this);
			var itemNum = $(list).children("li").length;
			var itemSize = (settings.position == 'vertical') ? parseInt($(list).find("li:first").outerHeight(true)) : parseInt($(list).find("li:first").outerWidth(true));
			var listSize = (settings.node == 1) ? itemNum / settings.node * itemSize : (itemNum + (settings.node - itemNum%settings.node)) / settings.node * itemSize;
			var visibleSize = (settings.position == 'vertical') ? parseInt($(list).parent().height()) : parseInt($(list).parent().width());
			var slideSize = (settings.move == 'all') ? visibleSize : itemSize * settings.move;
			var autoTimer = null;
			var autoPause = null;
			if (settings.position == 'vertical') $(list).css('height', listSize); else $(list).css('width', listSize);
			$(list).parent().css({overflow:'hidden'});
			if (typeof settings.arrows === 'object') {
				var arrows = $(settings.arrows);
				var prev = $(arrows).first();
				$(prev).addClass("liprev disabled");
				var next = $(arrows).last();
				$(next).addClass("linext disabled");
			} else {
				if (!$(list).parent().find("a.liprev").length) $(list).before('<a href="#" class="liprev disabled"><span></span></a>');
				if (!$(list).parent().find("a.linext").length) $(list).after('<a href="#" class="linext disabled"><span></span></a>');
				var arrows = $(list).parent().find("a.liprev, a.linext");
				var prev = $(arrows).filter("a.liprev");
				var next = $(arrows).filter("a.linext");
			}
			if (typeof settings.nav === 'object') {
				var nav = $(settings.nav);
				var navItems = $(nav).find("li");
				$(list).find("li").each(function(i) {
					$(this).attr("index", i);
				});
			}
			if (listSize > visibleSize && settings.arrows && settings.loop) $(prev).removeClass("disabled");
			if (listSize > visibleSize && settings.arrows) $(next).removeClass("disabled");
			if (!settings.arrows) $(arrows).hide();
			var currentItem = (settings.active == 'random') ? Math.round(Math.random() * 100)%itemNum : settings.active;
			if (typeof settings.totalPaging === 'object') {
				var totalPaging = Math.ceil(listSize / slideSize);
				$(settings.totalPaging).text(totalPaging);
			}
			if (typeof settings.currentPaging === 'object') {
				var currentPaging = Math.ceil((currentItem + 1) * itemSize / slideSize);
				$(settings.currentPaging).text(currentPaging);
			}
			/* events */
			$(list).find("li").off("click");
			$(list).find("li").on("click", function() {
				if ($(list).find("li.active").length) $(list).find("li").removeClass("active");
				$(this).addClass("active");
				currentItem = $(this).index();
				var itemPosition = (settings.position == 'vertical') ? parseInt($(this).position().top) : parseInt($(this).position().left);
				if (itemPosition >= visibleSize || itemPosition < 0) {
					var listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
					var newListOffset = ( (currentItem + currentItem%settings.node) / settings.node * itemSize ) - Math.floor(visibleSize / itemSize / settings.node / 2) * itemSize;
					if (newListOffset > listSize - visibleSize) newListOffset = listSize - visibleSize;
					if (currentItem < (visibleSize / itemSize / settings.node))  newListOffset = 0;
					var marginCssObj = (settings.position == 'vertical') ? {marginTop:-newListOffset} : {marginLeft:-newListOffset};
					$(list).css(marginCssObj);
					$(prev).removeClass("disabled");
					if (Math.abs(newListOffset) >= listSize - visibleSize) $(next).addClass("disabled");
				}
				if (settings.nav) {
					$(navItems).removeClass("active");
					$(navItems).eq($(this).attr("index")).addClass("active");
				}
			});
			$(list).find("li:eq("+ currentItem +")").trigger("click");
			$(arrows).off("click");
			$(arrows).on("click", function() {
				if (listSize <= visibleSize) return false;
				if ($(this).hasClass("liprev") && $(next).hasClass("disabled")) $(next).removeClass("disabled");
				if ($(this).hasClass("linext") && $(prev).hasClass("disabled")) $(prev).removeClass("disabled");
				var button = $(this);
				if (!$(list).hasClass("animate")) {
					var listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
					if ($(button).hasClass("liprev")) {
						var marginCssObj = (settings.position == 'vertical') ? {marginTop:-slideSize} : {marginLeft:-slideSize};
						var marginAnimateObj = (settings.position == 'vertical') ? {marginTop: "+=" + slideSize + "px"} : {marginLeft: "+=" + slideSize + "px"};
						if (settings.loop) {
							$(list).find("li:last").clone().prependTo($(list)).css(marginCssObj);
							$(list).find("li:last").remove();
							$(list).find("li:first").animate(marginAnimateObj, settings.speed, function () {
								$(list).removeClass("animate");
								$(list).find("li:first").removeAttr("style");
								if (settings.nav) {
									var firstItemVisible = $(list).find("li:first").attr("index");
									$(navItems).removeClass("active");
									$(navItems).eq(firstItemVisible).addClass("active");
								}
							});
						} else if (listOffset < 0) {
							currentPaging--;
							$(list).addClass("animate");
							if (slideSize > Math.abs(listOffset)) marginAnimateObj = (settings.position == 'vertical') ? {marginTop: "+=" + Math.abs(listOffset) + "px"} : {marginLeft: "+=" + Math.abs(listOffset) + "px"};
							$(list).animate(marginAnimateObj, settings.speed, function () {
								$(list).removeClass("animate");
								listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
								if (listOffset >= 0) $(button).addClass("disabled");
								if (settings.nav) {
									var firstItemVisible = (listOffset >= 0) ? 0 : Math.round(Math.abs(listOffset) / slideSize);
									$(navItems).removeClass("active");
									$(navItems).eq(firstItemVisible).addClass("active");
								}
							});
						}
					} else if ($(button).hasClass("linext")) {
						var marginAnimateObj = (settings.position == 'vertical') ? {marginTop: "-=" + slideSize + "px"} : {marginLeft: "-=" + slideSize + "px"};
						if (Math.abs(listOffset) + slideSize > listSize - visibleSize) marginAnimateObj = (settings.position == 'vertical') ? {marginTop: - listSize + visibleSize + "px"} : {marginLeft: - listSize + visibleSize + "px"};
						if (settings.loop) {
							$(list).find("li:first").animate(marginAnimateObj, settings.speed, function () {
								$(list).removeClass("animate");
								$(list).find("li:first").clone().removeAttr("style").appendTo($(list));
								$(list).find("li:first").remove();
								if (settings.nav) {
									var firstItemVisible = $(list).find("li:first").attr("index");
									$(navItems).removeClass("active");
									$(navItems).eq(firstItemVisible).addClass("active");
								}
							});
						} else if (Math.abs(listOffset) < listSize - visibleSize) {
							currentPaging++;
							$(list).addClass("animate");
							$(list).animate(marginAnimateObj, settings.speed, function () {
								$(list).removeClass("animate");
								listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
								if (Math.abs(listOffset) >= listSize - visibleSize) $(button).addClass("disabled");
								if (settings.nav) {
									var firstItemVisible = (listOffset >= 0) ? 0 : Math.round(Math.abs(listOffset) / slideSize);
									$(navItems).removeClass("active");
									$(navItems).eq(firstItemVisible).addClass("active");
								}
							});
						}
					}
					if (typeof settings.currentPaging === 'object') {
						$(settings.currentPaging).text(currentPaging);
					}
				}
				return false;
			});
			$(arrows).off("mousedown");
			$(arrows).on("mousedown", function() {
				if (autoTimer) clearInterval(autoTimer);
			});
			if (settings.nav) {
				$(navItems).off("click");
				$(navItems).on("click", function() {
					$(navItems).removeClass("active");
					$(this).addClass("active");
					var item = (settings.loop) ? $(list).find("li[index='"+ $(this).index() +"']") : $(list).find("li:eq("+ $(this).index() +")");
					var itemIndex = $(item).index();			
					var itemPosition = (settings.position == 'vertical') ? parseInt($(item).position().top) : parseInt($(item).position().left);
					if (itemPosition >= visibleSize || itemPosition < 0) {
						var listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
						var newListOffset = ( (itemIndex + itemIndex%settings.node) / settings.node * itemSize ) - Math.floor(visibleSize / itemSize / settings.node / 2) * itemSize;
						if (newListOffset > listSize - visibleSize) newListOffset = listSize - visibleSize;
						if (itemIndex < (visibleSize / itemSize / settings.node))  newListOffset = 0;
						var marginCssObj = (settings.position == 'vertical') ? {marginTop:-newListOffset} : {marginLeft:-newListOffset};
						$(list).animate(marginCssObj);
					}
					if (autoTimer) clearInterval(autoTimer);
					return false;
				});
			}
			if (settings.auto) {
				if (listSize <= visibleSize) return false;
				$(list).live("mouseenter", function() {
					autoPause = true;
				});
				$(list).live("mouseleave", function() {
					autoPause = false;
				});
				autoTimer = setInterval(function() {
					if (!autoPause) {
						if ($(prev).hasClass("disabled")) $(prev).removeClass("disabled");
						$(next).trigger("click");
					}
				}, settings.auto);
			}
			/* return */
			$(list).data("itemNum", 10);
			return $(list);
		},
		scroll : function(options) {
			/* settings */
			var settings = $.extend({
				'position' : 'vertical', // horizontal or vertical
				'node' : 1, // number of items by node
				'speed' : 'normal', // slow, normal or fast
				'arrows' : true, // true/false or DOM elements
				'ajax' : false  // syntax ajax/classements.php?s={start}&l={limit}
			}, options);
			/* init */
			var list = $(this);
			var itemNum = $(list).children("li").length;
			var originalItemNum = $(list).find("li").length;
			var itemSize = (settings.position == 'vertical') ? parseInt($(list).find("li:first").outerHeight(true)) : parseInt($(list).find("li:first").outerWidth(true));
			var listSize = (settings.node == 1) ? itemNum / settings.node * itemSize : (itemNum + (settings.node - itemNum%settings.node)) / settings.node * itemSize;
			var visibleSize = (settings.position == 'vertical') ? parseInt($(list).parent().height()) : parseInt($(list).parent().width());
			var scrollInterval = null;
			var mousedownTimer = null;
			if (settings.position == 'vertical') $(list).css('height', listSize); else $(list).css('width', listSize);
			$(list).parent().css({overflow:'hidden'});
			if (typeof settings.arrows === 'object') {
				var arrows = $(settings.arrows);
				var prev = $(arrows).first();
				$(prev).addClass("liprev disabled");
				var next = $(arrows).last();
				$(next).addClass("linext disabled");
			} else {
				if (!$(list).parent().find("a.liprev").length) $(list).before('<a href="#" class="liprev disabled"><span></span></a>');
				if (!$(list).parent().find("a.linext").length) $(list).after('<a href="#" class="linext disabled"><span></span></a>');
				var arrows = $(list).parent().find("a.liprev, a.linext");
				var prev = $(arrows).filter("a.liprev");
				var next = $(arrows).filter("a.linext");
			}
			if (listSize > visibleSize) $(next).removeClass("disabled");
			var intervalSize = (settings.speed == 'slow') ? 2 : (settings.speed == 'fast') ? 4 : 3;
			/* events */
			$(arrows).off("click");
			$(arrows).on("click", function() {
				return false;
			});
			$(arrows).off("mousedown");
			$(arrows).on("mousedown", function(event) {
				if (event.button != 0) return false;
				if (listSize <= visibleSize) return false;
				if ($(this).hasClass("liprev") && $(next).hasClass("disabled")) $(next).removeClass("disabled");
				if ($(this).hasClass("linext") && $(prev).hasClass("disabled")) $(prev).removeClass("disabled");
				var button = $(this);
				mousedownTimer = setTimeout(function() {
					if (mousedownTimer) {
						scrollInterval = setInterval(function() {
							var listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
							if ($(button).hasClass("liprev")) {
								if (listOffset < 0) {
									var marginCssObj = (settings.position == 'vertical') ? {marginTop: "+=" + intervalSize + "px"} : {marginLeft: "+=" + intervalSize + "px"};
									$(list).css(marginCssObj);
								} else {
									var marginCssObj = (settings.position == 'vertical') ? {marginTop: 0 + "px"} : {marginLeft: 0 + "px"};
									$(list).css(marginCssObj);
									$(button).addClass("disabled");
								}
							} else if ($(button).hasClass("linext")) {
								if (Math.abs(listOffset) < listSize - visibleSize) {
									var marginCssObj = (settings.position == 'vertical') ? {marginTop: "-=" + intervalSize + "px"} : {marginLeft: "-=" + intervalSize + "px"};
									$(list).css(marginCssObj);
									if (settings.ajax && Math.abs(listOffset) + itemSize > listSize - visibleSize && !$(list).hasClass("loading")) {
										$(list).addClass("loading");
										$(list).append('<li class="loader"></li>');
										itemNum = $(list).find("li").length;
										listSize = (itemNum + itemNum%settings.node) / settings.node * itemSize;
										$.ajax({
											url: settings.ajax.replace("{start}", itemNum).replace("{limit}", originalItemNum),
											type: "GET",
											dataType: "html",
											success: function (html) {
												if (html) { 
													$(list).append(html);
													if ($(button).hasClass("disabled")) $(button).removeClass("disabled");
												} else {
													settings.ajax = null;
													$(button).addClass("disabled");
												}
											}, 
											complete: function() {
												$(list).find("li.loader").remove();
												itemNum = $(list).find("li").length;
												listSize = (itemNum + itemNum%settings.node) / settings.node * itemSize;
												$(list).removeClass("loading");
												if (Math.abs(listOffset) + itemSize > listSize - visibleSize) {
													var marginCssObj = (settings.position == 'vertical') ? {marginTop: "+=" + itemSize + "px"} : {marginLeft: "+=" + itemSize + "px"};
													$(list).css(marginCssObj);
												}
											}
										});	
									}
								} else {
									$(button).addClass("disabled");
								}
							}
						}, 10);
					}
				}, 200);
			});
			$(arrows).off("mouseup");
			$(arrows).on("mouseup", function(event) {
				if (event.button != 0) return false;
				if (listSize <= visibleSize) return false;
				clearInterval(scrollInterval);
				clearTimeout(mousedownTimer);
				var button = $(this);
				var listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
				if ($(button).hasClass("liprev") && listOffset < 0 && !$(list).hasClass("animate")) {
					$(list).addClass("animate");
					var marginAnimateObj = (settings.position == 'vertical') ? {marginTop: "+=" + itemSize + "px"} : {marginLeft: "+=" + itemSize + "px"};
					$(list).animate(marginAnimateObj, function() {
						$(list).removeClass("animate");
						var listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
						if (listOffset >= 0) {
							$(button).addClass("disabled");
							var marginCssObj = (settings.position == 'vertical') ? {marginTop: 0 + "px"} : {marginLeft: 0 + "px"};
							$(list).css(marginCssObj);
							return false;
						} else {
							if ($(button).hasClass("disabled")) $(button).removeClass("disabled");
							var modulo = Math.abs(listOffset)%itemSize;
							var marginModuloObj = (settings.position == 'vertical') ? {marginTop: "+=" + modulo + "px"} : {marginLeft: "+=" + modulo + "px"};
							if (modulo > 0) {
								$(list).animate(marginModuloObj, function () {
									listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
									if (listOffset >= 0) { $(button).addClass("disabled"); return false; }
								});
							}
						}
					});
				} else if ($(button).hasClass("linext") && Math.abs(listOffset) < listSize - visibleSize && !$(list).hasClass("animate")) {
					$(list).addClass("animate");
					var marginAnimateObj = (settings.position == 'vertical') ? {marginTop: "-=" + itemSize + "px"} : {marginLeft: "-=" + itemSize + "px"};
					$(list).animate(marginAnimateObj, function() {
						$(list).removeClass("animate");
						var listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
						if ((!settings.ajax && Math.abs(listOffset) >= listSize - visibleSize) || (settings.ajax && Math.abs(listOffset) > listSize - visibleSize)) {
							$(button).addClass("disabled");
							var maxlistOffset = listSize - visibleSize;
							var marginCssObj = (settings.position == 'vertical') ? {marginTop: -maxlistOffset + "px"} : {marginLeft: -maxlistOffset + "px"};
							$(list).css(marginCssObj);
							return false;
						} else {
							if ($(button).hasClass("disabled")) $(button).removeClass("disabled");
							var modulo = Math.abs(listOffset)%itemSize;
							if (modulo > 0) {
								var offsetModulo = itemSize - modulo;
								var marginModuloObj = (settings.position == 'vertical') ? {marginTop: "-=" + offsetModulo + "px"} : {marginLeft: "-=" + offsetModulo + "px"};
								$(list).animate(marginModuloObj, function () {
									listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
									if (Math.abs(listOffset) >= listSize - visibleSize) { $(button).addClass("disabled"); return false; }
								});
							}
							if (settings.ajax && Math.abs(listOffset) + itemSize > listSize - visibleSize && !$(list).hasClass("loading")) {
								$(list).addClass("loading");
								$(list).append('<li class="loader"></li>');
								itemNum = $(list).find("li").length;
								listSize = (itemNum + itemNum%settings.node) / settings.node * itemSize;
								$.ajax({
									url: settings.ajax.replace("{start}", itemNum).replace("{limit}", originalItemNum),
									type: "GET",
									dataType: "html",
									success: function (html) {
										if (html) { 
											$(list).append(html);
											if ($(button).hasClass("disabled")) $(button).removeClass("disabled");
										} else {
											settings.ajax = null;
											$(button).addClass("disabled");
										}
									}, 
									complete: function() {
										$(list).find("li.loader").remove();
										itemNum = $(list).find("li").length;
										listOffset = (settings.position == 'vertical') ? parseInt($(list).css("marginTop")) : parseInt($(list).css("marginLeft"));
										listSize = (itemNum + itemNum%settings.node) / settings.node * itemSize;
										$(list).removeClass("loading");
										if (Math.abs(listOffset) - itemSize >= listSize - visibleSize) {
											var marginCssObj = (settings.position == 'vertical') ? {marginTop: "+=" + itemSize + "px"} : {marginLeft: "+=" + itemSize + "px"};
											$(list).css(marginCssObj);
										}
									}
								});	
							}
						}
					});
				}
				return false;
			});
			/* return */
			return $(list);
		},
		fade : function(options) {
			/* settings */
			var settings = $.extend({
				'active' : 0, // index of the active item by default, integer or "random"
				'speed' : 'normal', // slow, normal or fast
				'random' : false, // items order
				'auto' : 0, // 1000 = 1sec
				'arrows' : true, // true/false or DOM elements
				'ajax' : false  // syntax ajax/media.php?id={id}, force random to false
			}, options);
			if (settings.random && settings.ajax) settings.random = false;
			/* init */
			var list = $(this);
			var itemNum = $(list).children("li").length;
			var autoTimer = null;
			var autoPause = null;
			if (settings.random) {
				for (i=0; i<itemNum; i++) {
					var randItem = $(list).find("li:eq("+ Math.round(Math.random() * 100)%itemNum +")");
					$(randItem).clone().appendTo($(list));
					$(randItem).remove();
				}
			}
			var currentItem = (settings.active == 'random') ? Math.round(Math.random() * 100)%itemNum : settings.active;
			$(list).parent().css({position:'relative'});
			$(list).find("li").css({position:'absolute'}).hide().eq(currentItem).show();
			if (typeof settings.arrows === 'object') {
				var arrows = $(settings.arrows);
				var prev = $(arrows).first();
				$(prev).addClass("liprev disabled");
				var next = $(arrows).last();
				$(next).addClass("linext disabled");
			} else {
				if (!$(list).parent().find("a.liprev").length) $(list).before('<a href="#" class="liprev disabled"><span></span></a>');
				if (!$(list).parent().find("a.linext").length) $(list).after('<a href="#" class="linext disabled"><span></span></a>');
				var arrows = $(list).parent().find("a.liprev, a.linext");
				var prev = $(arrows).filter("a.liprev");
				var next = $(arrows).filter("a.linext");
			}
			if (itemNum > 1 && settings.arrows) $(prev).removeClass("disabled");
			if (itemNum > 1 && settings.arrows || settings.ajax) $(next).removeClass("disabled");
			if (!settings.arrows) $(arrows).hide();
			/* events */
			$(arrows).off("click");
			$(arrows).on("click", function() {
				if ($(this).hasClass("liprev") && $(next).hasClass("disabled")) $(next).removeClass("disabled");
				if ($(this).hasClass("linext") && $(prev).hasClass("disabled")) $(prev).removeClass("disabled");
				if (!$(list).hasClass("animate")) {
					$(list).addClass("animate");
					if (!settings.ajax || $(this).hasClass("liprev") || currentItem + 1 < itemNum) {
						$(list).find("li:eq("+ currentItem +")").fadeOut(settings.speed, function() {
							$(list).removeClass("animate");
						}).css({zIndex:1});
						if ($(this).hasClass("liprev")) {
							currentItem--;
							if (currentItem < 0) currentItem = itemNum - 1;
						} else if ($(this).hasClass("linext")) {
							currentItem++;
							if (currentItem >= itemNum) currentItem = 0;
						}
						$(list).find("li:eq("+ currentItem +")").show().css({zIndex:0});
						if (settings.ajax && currentItem - 1 < 0) $(prev).addClass("disabled");
					} else if (!$(list).hasClass("loading")) {
						$(list).addClass("loading");
						$.ajax({
							url: settings.ajax.replace("{id}", itemNum),
							type: "GET",
							dataType: "html",
							success: function (html) {
								if (html) {
									$(list).append(html);
									itemNum++;
									$(list).find("li:last").css({position:'absolute'}).hide();
									$(list).find("li:eq("+ currentItem +")").fadeOut(settings.speed, function() {
										$(list).removeClass("animate");
									}).css({zIndex:1});
									currentItem = itemNum - 1;
									$(list).find("li:eq("+ currentItem +")").show().css({zIndex:0});
									if (settings.ajax && currentItem - 1 < 0) $(prev).addClass("disabled");
								} else {
									settings.ajax = null;
									$(list).removeClass("animate");
									$(next).trigger("click");
								}
							}, 
							complete: function() {
								$(list).removeClass("loading");
							}
						});
					}
				}
				return false;
			});
			$(arrows).off("mousedown");
			$(arrows).on("mousedown", function() {
				if (autoTimer) clearInterval(autoTimer);
			});
			if (settings.auto) {
				if (itemNum <= 1) return false;
				$(list).live("mouseenter", function() {
					autoPause = true;
				});
				$(list).live("mouseleave", function() {
					autoPause = false;
				});
				autoTimer = setInterval(function() {
					if (!autoPause) {
						if ($(prev).hasClass("disabled")) $(prev).removeClass("disabled");
						$(next).trigger("click");
					}
				}, settings.auto);
			}
			/* return */
			return $(list);
		},
		tabs : function(options) {
			/* settings */
			var settings = $.extend({
				'active' : 0, // index of the active item by default, integer or "random"
				'auto' : 0, // 1000 = 1sec
				'ajax' : false // syntax ajax/tabs/tab_{tab}.html
			}, options);
			/* init */
			var list = $(this);
			var itemNum = $(list).children("li").length;
			var autoTimer = null;
			var autoPause = null;
			var currentItem = (settings.active == 'random') ? Math.round(Math.random() * 100)%itemNum : settings.active;
			$(list).find("li").each(function(i) {
				if (!$(list).siblings(".tab-content").eq(i).length) $(list).parent().append('<div class="tab-content"></div>');
			});
			/* events */
			$(list).find("li a").off("click");
			$(list).find("li a").on("click", function() {
				if (!$(this).parent("li").hasClass("active")) {
					var tab = $.trim($(this).parent("li").attr("class").replace("active", ""));
					var tabIndex = $(this).parent("li").index();
					if ($(list).find("li.active")) $(list).find("li.active").removeClass("active");
					$(this).parent("li").addClass("active");
					if (!$(list).siblings(".tab-content").eq(tabIndex).html() && settings.ajax) {
						$.ajax({
							url: settings.ajax.replace("{tab}", tab),
							type: "GET",
							dataType: "html",
							success:function (html) {
								$(list).siblings(".tab-content").eq(tabIndex).html(html);
							}
						});	
					}
					$(list).siblings(".tab-content").hide();
					$(list).siblings(".tab-content").eq(tabIndex).show();
				}
				return false;
			});
			$(list).find("li a").off("mousedown");
			$(list).find("li a").on("mousedown", function() {
				if (autoTimer) clearInterval(autoTimer);
			});
			$(list).find("li:eq("+ currentItem +") a").trigger("click");
			if (settings.auto) {
				if (itemNum <= 1) return false;
				$(list).live("mouseenter", function() {
					autoPause = true;
				});
				$(list).live("mouseleave", function() {
					autoPause = false;
				});
				autoTimer = setInterval(function() {
					if (!autoPause) {
						currentItem++;
						if (currentItem >= itemNum) currentItem = 0;
						$(list).find("li:eq("+ currentItem +") a").trigger("click");
					}
				}, settings.auto);
			}
			/* return */
			return $(list);
		},
		paging : function(options) {
			/* settings */
			var settings = $.extend({
				'auto' : 0, //  // 1 = 1px before, 0 = false
				'arrows' : true, // true/false or DOM elements
				'ajax' : false  // syntax ajax/articles.php?s={start}&l={limit}
			}, options);
			/* init */
			var list = $(this);
			var itemNum = $(list).children("li").length;
			var originalItemNum = $(list).find("li").length;
			if (typeof settings.arrows === 'object') {
				var button = $(settings.arrows);
				$(button).addClass("linext");
			} else {
				if (!$(list).parent().find("a.linext").length) $(list).after('<a href="#" class="linext"><span></span></a>');
				var button = $(list).parent().find("a.linext");
			}
			if (!settings.ajax) $(button).addClass("disabled").fadeOut();
			else if ($(button).hasClass("disabled")) $(button).removeClass("disabled");
			/* events */
			$(button).off("click");
			$(button).on("click", function(event) {
				if (!$(list).hasClass("loading") && !$(button).hasClass("disabled")) {
					$(list).addClass("loading");
					$(list).append('<li class="loader"></li>');
					$(button).addClass("loading disabled");
					$.ajax({
						url: settings.ajax.replace("{start}", itemNum + 1).replace("{limit}", originalItemNum),
						type: "GET",
						dataType: "html",
						success: function (html) {
							if (html) { 
								$(list).append(html);
								if ($(button).hasClass("disabled")) $(button).removeClass("disabled");
							} else {
								$(button).addClass("disabled").fadeOut();
							}
						}, 
						error: function() {
							$(button).addClass("disabled").fadeOut();
						}, 
						complete: function() {
							$(list).find("li.loader").remove();
							$(list).removeClass("loading");
							itemNum = $(list).find("li").length;
							$(button).removeClass("loading");
							if (itemNum%originalItemNum > 0) $(button).addClass("disabled").hide();
						}
					});
				}
				return false;
			});
			if (settings.auto) {
				var currentScroll = null;
				$(window).scroll(function(e) {
					setTimeout(function() {
						if (currentScroll == $(window).scrollTop()) {
							var screenStart = $(window).scrollTop();
							var screenEnd = screenStart + $(window).height();
							var buttonTop = $(button).offset().top;
							if (buttonTop >= screenStart && buttonTop - settings.auto <= screenEnd) {
								$(button).trigger("click");
							} else if (buttonTop > screenEnd) {
								return false;
							}
						} else {
							currentScroll = $(window).scrollTop();
						}
					}, 200);
				});
			}
			/* return */
			return $(list);
		},
		box : function(options) {
			/* settings */
			var settings = $.extend({
				'active' : 0, // index of the active item by default, integer or "random"
			}, options);
			/* init */
			var list = $(this);
			var itemNum = $(list).find("li").length;
			var currentItem = (settings.active == 'random') ? Math.round(Math.random() * 100)%itemNum : settings.active;
			$(list).find("li:eq("+ currentItem +")").addClass("active");
			if (!$(list).parent().find("a.liselect").length) $(list).before('<a href="#" class="liselect"><span class="label"></span><span class="icon"></span></a>');
			var button = $(list).parent().find("a.liselect");
			$(button).find(".label").text($(list).find("li:eq("+ currentItem +") a").text());
			/* events */
			$(button).off("click");
			$(button).on("click", function(event) {
				$(list).toggle();
				$(list).scrollTop($(list).find("li.active").position().top);
				if ($(list).is(":visible")) $(button).addClass("active");
				else $(button).removeClass("active");
				return false;
			});
			$(list).find("li a").off("click");
			$(list).find("li a").on("click", function() {
				currentItem = $(this).parent("li").index();
				$(list).find("li.active").removeClass("active");
				$(list).find("li:eq("+ currentItem +")").addClass("active");
				$(button).find(".label").text($(this).text());
				$(button).trigger("click");
			});
			$("body").on("click", function(e) {
				setTimeout(function() { if ($(button).hasClass("active")) $(button).trigger("click"); }, 100);
			});
			/* return */
			return $(list);
		},
		multiplebox : function(options) {
			/* settings */
			var settings = $.extend({
				'labels' : ['-', '1 item', '{count} items'], // index of the active item by default, integer or "random"
			}, options);
			/* init */
			var list = $(this);
			if (!$(list).parent().find("a.liselect").length) $(list).before('<a href="#" class="liselect"><span class="label"></span><span class="icon"></span></a>');
			$(list).find("li input:checked").each(function() {
				$(this).parent("li").addClass("active");
			});
			var button = $(list).parent().find("a.liselect");
			var countSelection = $(list).find("li.active").length;
			$(button).find(".label").text(settings.labels[Math.min((settings.labels.length-1),countSelection)].replace("{count}", countSelection));
			/* events */
			$(button).off("click");
			$(button).on("click", function(event) {
				$(list).toggle();
				if ($(list).is(":visible")) $(button).addClass("active");
				else $(button).removeClass("active");
				return false;
			});
			$(list).find("li").off("click");
			$(list).find("li input").on("change", function() {
				var li = $(this).parent("li");
				if (!$(li).hasClass("active")) $(li).addClass("active");
				else $(li).removeClass("active");
				var countSelection = $(list).find("li.active").length;
				$(button).find(".label").text(settings.labels[Math.min((settings.labels.length-1),countSelection)].replace("{count}", countSelection));
			});
			/* return */
			return $(list);
		}
	};
})(jQuery);