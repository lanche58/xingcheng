(function (l, f) {
    function m() { var a = e.elements; return "string" == typeof a ? a.split(" ") : a } function i(a) { var b = n[a[o]]; b || (b = {}, h++, a[o] = h, n[h] = b); return b } function p(a, b, c) { b || (b = f); if (g) return b.createElement(a); c || (c = i(b)); b = c.cache[a] ? c.cache[a].cloneNode() : r.test(a) ? (c.cache[a] = c.createElem(a)).cloneNode() : c.createElem(a); return b.canHaveChildren && !s.test(a) ? c.frag.appendChild(b) : b } function t(a, b) {
        if (!b.cache) b.cache = {}, b.createElem = a.createElement, b.createFrag = a.createDocumentFragment, b.frag = b.createFrag();
        a.createElement = function (c) { return !e.shivMethods ? b.createElem(c) : p(c, a, b) }; a.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + m().join().replace(/[\w\-]+/g, function (a) { b.createElem(a); b.frag.createElement(a); return 'c("' + a + '")' }) + ");return n}")(e, b.frag)
    } function q(a) {
        a || (a = f); var b = i(a); if (e.shivCSS && !j && !b.hasCSS) {
            var c, d = a; c = d.createElement("p"); d = d.getElementsByTagName("head")[0] || d.documentElement; c.innerHTML = "x<style>article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}</style>";
            c = d.insertBefore(c.lastChild, d.firstChild); b.hasCSS = !!c
        } g || t(a, b); return a
    } var k = l.html5 || {}, s = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i, r = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i, j, o = "_html5shiv", h = 0, n = {}, g; (function () {
        try {
            var a = f.createElement("a"); a.innerHTML = "<xyz></xyz>"; j = "hidden" in a; var b; if (!(b = 1 == a.childNodes.length)) {
                f.createElement("a"); var c = f.createDocumentFragment(); b = "undefined" == typeof c.cloneNode ||
                "undefined" == typeof c.createDocumentFragment || "undefined" == typeof c.createElement
            } g = b
        } catch (d) { g = j = !0 }
    })(); var e = {
        elements: k.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video", version: "3.7.0", shivCSS: !1 !== k.shivCSS, supportsUnknownElements: g, shivMethods: !1 !== k.shivMethods, type: "default", shivDocument: q, createElement: p, createDocumentFragment: function (a, b) {
            a || (a = f);
            if (g) return a.createDocumentFragment(); for (var b = b || i(a), c = b.frag.cloneNode(), d = 0, e = m(), h = e.length; d < h; d++) c.createElement(e[d]); return c
        }
    }; l.html5 = e; q(f)
})(this, document);


(function(win) {
	"use strict";
	// =========================== Init Objects ============================

	var doc = document;
	var root = doc.documentElement;
	var xhr = "XMLHttpRequest";
	var ieVersion = doc.querySelector ? doc.documentMode : doc.compatMode === "CSS1Compat" ? xhr in win ? 7 : 6 : 5;

	// String constants
	var EMPTY_STRING						= "";
	var SPACE_STRING						= " ";
	var PLACEHOLDER_STRING					= "$1";

	// If were not in standards mode, IE is too old / new or we can't create
	if (ieVersion) {
		toggleElementClass(root, "ie" + ieVersion, true);
	}
	var js_path								= doc.scripts || doc.querySelectorAll("script");
		js_path								= js_path[js_path.length - 1].getAttribute("src").replace(/[^\/]+$/, "");
	var ajaxCache							= {};

	// an XMLHttpRequest object then we should get out now.
	xhr = ieVersion < 7 ? new ActiveXObject("Microsoft.XMLHTTP") : new win[xhr]();

	// ========================= Common Objects ============================

	// Compatiable selector engines in order of CSS3 support. Note: '*' is
	// a placholder for the object key name. (basically, crude compression)
	var selectorEngines = {
		"NW"								: "*.Dom.select",
		"MooTools"							: "$$",
		"DOMAssistant"						: "*.$",
		"Prototype"							: "$$",
		"YAHOO"								: "*.util.Selector.query",
		"Sizzle"							: "*",
		"jQuery"							: "*",
		"dojo"								: "*.query"
	};

	var selectorMethod;
	var enabledWatchers						= [];     // array of :enabled/:disabled elements to poll
	var domPatches							= [];
	var ie6PatchID							= 0;      // used to solve ie6's multiple class bug
	var patchIE6MultipleClasses				= true;   // if true adds class bloat to ie6
	var namespace							= "slvzr";
	var strRawCssText						= "rawCssText";

	// Stylesheet parsing regexp's
	var RE_ORIGIN							= /^\w+:\/\/[^\/]+/;
	var RE_COMMENT							= /(\/\*[^*]*\*+([^\/][^*]*\*+)*\/)\s*?/g;
	var RE_IMPORT							= /@import\s*(?:(?:(?:url\(\s*(['"]?)(.*)\1)\s*\))|(?:(['"])(.*)\3))\s*([^;]*);/g;
	var RE_MEDIA							= /@media\s+([^\{]+)/g;
	var RE_ASSET_URL						= /(\bbehavior\s*?:[^;}\n\r]+)?\burl\(\s*(["']?)(?!\w+:)([^"')]+)\2\s*\)/g;
	var RE_PSEUDO_STRUCTURAL				= /^:(empty|(first|last|only|nth(-last)?)-(child|of-type))$/;
	var RE_PSEUDO_ELEMENTS					= /:(:first-(?:line|letter))/g;
	var RE_SELECTOR_GROUP					= /((?:^|(?:\s*})+)(?:\s*@media[^{]+{)?)\s*([^\{]*?[\[:][^{]+)/g;
	var RE_SELECTOR_PARSE					= /([ +~>])|(:[a-z-]+(?:\(.*?\)+)?)|(\[.*?\])/g;
	var RE_LIBRARY_INCOMPATIBLE_PSEUDOS		= /(:not\()?:(hover|enabled|disabled|focus|checked|target|active|visited|first-line|first-letter)\)?/g;
	var RE_PATCH_CLASS_NAME_REPLACE			= /[^\w-]/g;

	// HTML UI element regexp's
	var RE_INPUT_ELEMENTS					= /^(INPUT|SELECT|TEXTAREA|BUTTON)$/;
	var RE_INPUT_CHECKABLE_TYPES			= /^(checkbox|radio)$/;

	// Broken attribute selector implementations (IE7/8 native [^=""], [$=""] and [*=""])
	var BROKEN_ATTR_IMPLEMENTATIONS			= ieVersion>6 ? /[\$\^*]=(['"])\1/ : null;

	// Whitespace normalization regexp's
	var RE_TIDY_TRAILING_WHITESPACE			= /([(\[+~])\s+/g;
	var RE_TIDY_LEADING_WHITESPACE			= /\s+([)\]+~])/g;
	var RE_TIDY_CONSECUTIVE_WHITESPACE		= /\s+/g;
	var RE_TIDY_TRIM_WHITESPACE				= /^\s*((?:[\S\s]*\S)?)\s*$/;

	// PIE
	var pie_path							= win.PIE && "behavior" in PIE ? PIE.behavior : js_path.replace(RE_ORIGIN, "") + "PIE.htc";
	function viewHeight(){
		return win.innerHeight || root.clientHeight;
	}

	function viewWidth(){
		return win.innerWidth || root.clientWidth;
	}

	function onresize(fn) {
		var viewH = viewHeight(),
			viewW = viewWidth();

		function sizefn() {
			var vh = viewHeight(),
				vw = viewWidth();
			if (viewH !== vh || viewW !== vw) {
				viewH = vh;
				viewW = vw;
				fn();
			}
		}
		if (win.addEventListener) {
			win.addEventListener("resize", sizefn, true);
			win.addEventListener("orientationchange", sizefn, true);
		} else {
			addEvent(win, "resize", sizefn);
		}
	}

	function loadScript(src) {
		var script = doc.createElement("script");
		script.src = src;
		root.children[0].appendChild(script);
		return script;
	}

	function forEach(fn, array) {
		array = array || doc.styleSheets;
		for (var i = array.length - 1; i >= 0; i--) {
			fn(array[i], i);
		}
	}

	function vunits(css, raw, ele) {
		if (ele) {
			var url = ele.getAttribute("href") || ele.getAttribute("data-href");
			if (url) {
				css = ajaxCache[url] || (ajaxCache[url] = css);
			} else {
				css = ele[strRawCssText] || (ele[strRawCssText] = css);
			}
		}
		var vh = viewHeight() / 100,
			vw = viewWidth() / 100,
			viewport = {
				max: Math.max(vh, vw),
				min: Math.min(vh, vw),
				h: vh,
				w: vw
			};

		return css.replace(
			/([-:\s])(\.\d+\w+)/g,
			"$10$2"
		).replace(
			/\b(\d+(\.\d+)?)v(w|h|max|min)\b/g,
			function(s, num, subNum, strUnit) {
				return (num * viewport[strUnit]).toFixed(4) + "px";
			}
		);
	}

	// IE media queries, vm, vw, vh, vmax, vmin, rem
	function setLengthUnits() {
		var rem = root.currentStyle.fontSize.match(/([\d\.]+)([^\d\.]+)/),
			units = {
				"%": 0.12,
				em: 12,
				ex: 6
			};

		if (units[rem[2]]) {
			rem[1] = rem[1] * units[rem[2]];
			rem[2] = "pt";
		} else {
			rem[1] = parseFloat(rem[1]);
		}
		forEach(function(stylesheet) {
			var cssText = stylesheet[strRawCssText];
			if (cssText) {
				cssText = vunits(cssText);
				if (ieVersion < 9) {
					cssText = cssText.replace(/\b(\d+(\.\d+)?)rem\b/g, function(s, num) {
						return num * rem[1] + rem[2];
					});
					// call media.match.js see https://github.com/reubenmoes/media-match */
					if (win.styleMedia) {
						cssText = cssText.replace(RE_MEDIA, function(str, strRules) {
							try {
								if (styleMedia.matchMedium(strRules)) {
									str = "@media all ";
								}
							} catch (ex) {}
							return str;
						});
					}
				}
				stylesheet.cssText = cssText;
			}
		});
	}

	// =========================== Patching ================================
	// --[ patchStyleSheet() ]----------------------------------------------
	// Scans the passed cssText for selectors that require emulation and
	// creates one or more patches for each matched selector.
	function patchStyleSheet( cssText ) {

		// css IE version query
		cssText = cssText.replace(RE_MEDIA, function(str, strRules) {
			return "@media " + strRules.replace(/\s+and\s+\(\s*(\w+\-)?msie\s*:\s*([\d\.]+)\s*\)/g, function(s, cond, ver) {
				ver = parseFloat(ver);
				if (cond) {
					if (/^max/.test(cond)) {
						cond = ver - ieVersion;
					} else if (/^min/.test(cond)) {
						cond = ieVersion - ver;
					}
					cond = cond >= 0;
				} else {
					cond = ver === ieVersion;
				}
				return cond ? EMPTY_STRING : s;
			});
		});

		// IE CSS3 properties
		cssText = cssText.replace(/{(([^{}]*)\bbackground(-\w+)?\s*:\s*(\w+-gradient\s*\([^;\}]+))/g, function(str, props, propsPre, backSubVal, gradient) {
			return /background(-image)?\s*:[^;]*url\(/g.test(propsPre) ? str : "{" + pie_path + "-pie-background:" + gradient + ";" + props;
		}).replace(
			/{(?=[^{}]*\bborder-image\s*:[^{}]+})/g,
			"{" + pie_path
		);
		if (ieVersion < 9) {
			cssText = cssText.replace(
				/{(?=[^{}]*\b(border-radius|\w+-shadow|pie-background)\s*:[^{}]+})/g,
				"{" + pie_path
			);
			if (ieVersion < 8) {
				cssText = cssText.replace(
					/([;\{\r\n]\s*display\s*:\s*inline-block)\s*([;\}])/g,
					"$1;*display:inline;*zoom:1$2"
				);
				if (ieVersion < 7) {
					cssText = cssText.replace(
						/([;\{\r\n]\s*position\s*:\s*fixed)\s*([;\}])/g,
						"$1;_position:absolute$2"
					).replace(
						/{(?=[^{}]*-pie-png-fix\s*:\s*true\b)/g,
						"{" + pie_path
					);
				}
			}
		} else {
			// Add prefix for transform
			cssText = cssText.replace(
				/([;\{\r\n])\s*(transform(-\w+)?\s*:[^;\}]+)/g,
				"$1-ms-$2;$2"
			).replace(
				/\bfilter\s*:\s*([^;\}]+)/g,
				function(s, vals) {
					// Disable some filter that conflict with CSS3
					vals = trim(vals.split(/\s+(?=\w+\s*[\(\:])/).filter(function(filter){
						return !/^(progid\s*\:\s*DXImageTransform\.Microsoft\.)?(Alpha|Matrix|Gradient|FlipH|FlipV)\s*\(/i.test(filter);
					}).join(" "));
					return vals ? "filter: " + vals : "";
				}
			);
		}

		// IE CSS3 selector
		return ieVersion > 8 ? cssText : cssText.replace(RE_PSEUDO_ELEMENTS, PLACEHOLDER_STRING).
			replace(RE_SELECTOR_GROUP, function(m, prefix, selectorText) {

				var selectorGroups = [];
				forEach(function(selector, c) {
					selector = normalizeSelectorWhitespace(selector) + SPACE_STRING;
					var patches = [];
					selectorGroups[c] = selector.replace(RE_SELECTOR_PARSE,
						function(match, combinator, pseudo, attribute, index) {
							if (combinator) {
								if (patches.length>0) {
									domPatches.push( { selector: selector.substring(0, index), patches: patches } );
									patches = [];
								}
								return combinator;
							}
							else {
								var patch = (pseudo) ? patchPseudoClass( pseudo ) : patchAttribute( attribute );
								if (patch) {
									patches.push(patch);
									return "." + patch.className;
								}
								return match;
							}
						}
					);
				}, selectorText.split(","));

				return prefix + selectorGroups.join(",");
			});
	}

	// --[ patchAttribute() ]-----------------------------------------------
	// returns a patch for an attribute selector.
	function patchAttribute( attr ) {
		return (!BROKEN_ATTR_IMPLEMENTATIONS || BROKEN_ATTR_IMPLEMENTATIONS.test(attr)) ?
			{ className: createClassName(attr), applyClass: true } : null;
	}

	// --[ patchPseudoClass() ]---------------------------------------------
	// returns a patch for a pseudo-class
	function patchPseudoClass( pseudo ) {

		var applyClass = true;
		var className = createClassName(pseudo.slice(1));
		var isNegated = pseudo.substring(0, 5) === ":not(";
		var activateEventName;
		var deactivateEventName;

		// if negated, remove :not()
		if (isNegated) {
			pseudo = pseudo.slice(5, -1);
		}

		// bracket contents are irrelevant - remove them
		var bracketIndex = pseudo.indexOf("(");
		if (bracketIndex > -1) {
			pseudo = pseudo.substring(0, bracketIndex);
		}

		// check we're still dealing with a pseudo-class
		if (pseudo.charAt(0) === ":") {
			switch (pseudo.slice(1)) {

				case "root":
					applyClass = function(e) {
						return isNegated ? e !== root : e === root;
					};
					break;

				case "target":
					// :target is only supported in IE8
					if (ieVersion === 8) {
						applyClass = function(e) {
							var handler = function() {
								var hash = location.hash;
								var hashID = hash.slice(1);
								return isNegated ? (hash === EMPTY_STRING || e.id !== hashID) : (hash !== EMPTY_STRING && e.id === hashID);
							};
							addEvent( win, "hashchange", function() {
								toggleElementClass(e, className, handler());
							});
							return handler();
						};
						break;
					}
					return false;

				case "checked":
					applyClass = function(e) {
						if (RE_INPUT_CHECKABLE_TYPES.test(e.type)) {
							addEvent( e, "propertychange", function() {
								if (event.propertyName === "checked") {
									toggleElementClass( e, className, e.checked !== isNegated );
								}
							});
						}
						return e.checked !== isNegated;
					};
					break;

				case "disabled":
					isNegated = !isNegated;
					/* falls through */
				case "enabled":
					applyClass = function(e) {
						if (RE_INPUT_ELEMENTS.test(e.tagName)) {
							addEvent( e, "propertychange", function() {
								if (event.propertyName === "$disabled") {
									toggleElementClass( e, className, e.$disabled === isNegated );
								}
							});
							enabledWatchers.push(e);
							e.$disabled = e.disabled;
							return e.disabled === isNegated;
						}
						return pseudo === ":enabled" ? isNegated : !isNegated;
					};
					break;

				case "focus":
					activateEventName = "focus";
					deactivateEventName = "blur";
					/* falls through */
				case "hover":
					if (!activateEventName) {
						activateEventName = "mouseenter";
						deactivateEventName = "mouseleave";
					}
					applyClass = function(e) {
						addEvent( e, isNegated ? deactivateEventName : activateEventName, function() {
							toggleElementClass( e, className, true );
						});
						addEvent( e, isNegated ? activateEventName : deactivateEventName, function() {
							toggleElementClass( e, className, false );
						});
						return isNegated;
					};
					break;

				// everything else
				default:
					// If we don't support this pseudo-class don't create
					// a patch for it
					if (!RE_PSEUDO_STRUCTURAL.test(pseudo)) {
						return false;
					}
					break;
			}
		}
		return { className: className, applyClass: applyClass };
	}

	// --[ applyPatches() ]-------------------------------------------------
	function applyPatches() {
		var elms, selectorText, patches, domSelectorText;

		for (var c=0; c<domPatches.length; c++) {
			selectorText = domPatches[c].selector;
			patches = domPatches[c].patches;

			// Although some selector libraries can find :checked :enabled etc.
			// we need to find all elements that could have that state because
			// it can be changed by the user.
			domSelectorText = selectorText.replace(RE_LIBRARY_INCOMPATIBLE_PSEUDOS, EMPTY_STRING);

			// If the dom selector equates to an empty string or ends with
			// whitespace then we need to append a universal selector (*) to it.
			if (domSelectorText === EMPTY_STRING || domSelectorText.charAt(domSelectorText.length - 1) === SPACE_STRING) {
				domSelectorText += "*";
			}

			// Ensure we catch errors from the selector library
			try {
				elms = selectorMethod( domSelectorText );
			} catch (ex) {
				// #DEBUG_START
				log( "Selector '" + selectorText + "' threw exception '" + ex + "'" );
				// #DEBUG_END
			}


			if (elms) {
				for (var d = 0, dl = elms.length; d < dl; d++) {
					var elm = elms[d];
					var cssClasses = elm.className;
					for (var f = 0, fl = patches.length; f < fl; f++) {
						var patch = patches[f];
						if (!hasPatch(elm, patch)) {
							if (patch.applyClass && (patch.applyClass === true || patch.applyClass(elm) === true)) {
								cssClasses = toggleClass(cssClasses, patch.className, true );
							}
						}
					}
					elm.className = cssClasses;
				}
			}
		}
	}

	// --[ hasPatch() ]-----------------------------------------------------
	// checks for the exsistence of a patch on an element
	function hasPatch( elm, patch ) {
		return new RegExp("(^|\\s)" + patch.className + "(\\s|$)").test(elm.className);
	}


	// =========================== Utility =================================

	function createClassName( className ) {
		return namespace + "-" + ((ieVersion === 6 && patchIE6MultipleClasses) ?
			ie6PatchID++
		:
			className.replace(RE_PATCH_CLASS_NAME_REPLACE, function(a) { return a.charCodeAt(0); }));
	}

	// --[ isDocComplete() ]-----------------------------------------------------
	// checks doc.readyState
	function isDocComplete() {
		return doc.readyState === "complete";
	}

	// --[ log() ]----------------------------------------------------------
	// #DEBUG_START
	function log( message ) {
		if (win.console) {
			win.console.log(message);
		}
	}
	// #DEBUG_END

	// --[ trim() ]---------------------------------------------------------
	// removes leading, trailing whitespace from a string
	function trim( text ) {
		return text.replace(RE_TIDY_TRIM_WHITESPACE, PLACEHOLDER_STRING);
	}

	// --[ normalizeWhitespace() ]------------------------------------------
	// removes leading, trailing and consecutive whitespace from a string
	function normalizeWhitespace( text ) {
		return trim(text).replace(RE_TIDY_CONSECUTIVE_WHITESPACE, SPACE_STRING);
	}

	// --[ normalizeSelectorWhitespace() ]----------------------------------
	// tidies whitespace around selector brackets and combinators
	function normalizeSelectorWhitespace( selectorText ) {
		return normalizeWhitespace(selectorText.
			replace(RE_TIDY_TRAILING_WHITESPACE, PLACEHOLDER_STRING).
			replace(RE_TIDY_LEADING_WHITESPACE, PLACEHOLDER_STRING)
		);
	}

	// --[ toggleElementClass() ]-------------------------------------------
	// toggles a single className on an element
	function toggleElementClass( elm, className, on ) {
		var oldClassName = elm.className;
		var newClassName = toggleClass(oldClassName, className, on);
		if (newClassName !== oldClassName) {
			elm.className = newClassName;
			elm.parentNode.className += EMPTY_STRING;
		}
	}

	// --[ toggleClass() ]--------------------------------------------------
	// adds / removes a className from a string of classNames. Used to
	// manage multiple class changes without forcing a DOM redraw
	function toggleClass( classList, className, on ) {
		var re = new RegExp("(^|\\s)" + className + "(\\s|$)");
		var classExists = re.test(classList);
		if (on) {
			return classExists ? classList : classList + SPACE_STRING + className;
		} else {
			return classExists ? trim(classList.replace(re, PLACEHOLDER_STRING)) : classList;
		}
	}

	// --[ addEvent() ]-----------------------------------------------------
	function addEvent(elm, eventName, eventHandler) {
		elm.attachEvent("on" + eventName, eventHandler);
	}

	// --[ loadStyleSheet() ]-----------------------------------------------
	function loadStyleSheet(url) {
		var cssText = ajaxCache[url];

		if (win.$) {
			cssText = $.ajax(url, {
				dataType: "text",
				async: false
			}).responseText;
		}
		if (!cssText) {
			try {
				xhr.open("GET", url, false);
				xhr.send();
				if (xhr.status === 200) {
					cssText = xhr.responseText;
				} else {
					log(url + "\t Error:" + xhr.status);
				}
			} catch (ex) {
				if(RE_ORIGIN.test(url)){
					cssText = loadStyleSheet(url.replace(RE_ORIGIN, EMPTY_STRING));
				}
			}
			ajaxCache[url] = cssText;
		}
		return cssText || EMPTY_STRING;
	}

	// --[ resolveUrl() ]---------------------------------------------------
	// Converts a URL fragment to a fully qualified URL using the specified
	// context URL. Returns null if same-origin policy is broken
	function resolveUrl( url, contextUrl, ignoreSameOriginPolicy ) {

		function getProtocol( url ) {
			return url.substring(0, url.indexOf("//"));
		}

		function getProtocolAndHost( url ) {
			return url.substring(0, url.indexOf("/", 8));
		}

		if (!contextUrl) {
			contextUrl = baseUrl;
		}

		// protocol-relative path
		if (url.substring(0,2) === "//") {
			url = getProtocol(contextUrl) + url;
		}

		// absolute path
		if (/^\w+:\/\//i.test(url)) {
			return !ignoreSameOriginPolicy && getProtocolAndHost(contextUrl) !== getProtocolAndHost(url) ? null : url ;
		}

		// root-relative path
		if (url.charAt(0) === "/")	{
			return getProtocolAndHost(contextUrl) + url;
		}

		// relative path
		var contextUrlPath = contextUrl.split(/[?#]/)[0]; // ignore query string in the contextUrl
		if (url.charAt(0) !== "?" && contextUrlPath.charAt(contextUrlPath.length - 1) !== "/") {
			contextUrlPath = contextUrlPath.substring(0, contextUrlPath.lastIndexOf("/") + 1);
		}

		return contextUrlPath + url;
	}

	// --[ parseStyleSheet() ]----------------------------------------------
	// Downloads the stylesheet specified by the URL, removes it's comments
	// and recursivly replaces @import rules with their contents, ultimately
	// returning the full cssText.
	function parseStyleSheet( url ) {
		if (url) {
			return loadStyleSheet(url).replace(RE_COMMENT, EMPTY_STRING).
			replace(RE_IMPORT, function( match, quoteChar, importUrl, quoteChar2, importUrl2, media ) {
				var cssText = parseStyleSheet(resolveUrl(importUrl || importUrl2, url));
				return (media) ? "@media " + media + " {" + cssText + "}" : cssText;
			}).
			replace(RE_ASSET_URL, function( match, isBehavior, quoteChar, assetUrl ) {
				quoteChar = quoteChar || EMPTY_STRING;
				return isBehavior ? match : " url(" + quoteChar + resolveUrl(assetUrl, url, true) + quoteChar + ") ";
			});
		}
		return EMPTY_STRING;
	}

	// --[ getStyleSheets() ]-----------------------------------------------
	function getStyleSheets() {
		if (ieVersion < 8 && win.PIE && !PIE.attach_ie67) {
			PIE.attach_ie67 = function(node) {
				function start() {
					clearTimeout(timer);
					PIE.attach(node);
				}
				var $ = win.jQuery,
					timer;
				if ($) {
					timer = setTimeout(start, 800);
					$(start);
				} else {
					start();
				}
				node.runtimeStyle.behavior = "none";
			};
		}

		forEach(function(style) {
			var rawCssText = style.innerHTML,
				styleSheet = style.styleSheet;
			if (!(strRawCssText in styleSheet)) {
				styleSheet[strRawCssText] = patchStyleSheet(rawCssText);
			}
		}, doc.getElementsByTagName("style"));

		forEach(function(styleSheet) {
			var url = styleSheet.href;
			if (url && !(strRawCssText in styleSheet)) {
				styleSheet[strRawCssText] = patchStyleSheet(parseStyleSheet(resolveUrl(url) || url));
			}
		});

		setLengthUnits();
	}

	// --[ init() ]---------------------------------------------------------
	function init() {

		if (pie_path && !win.PIE) {
			try {
				eval.call(win, loadStyleSheet(js_path));
			} catch (ex) {}
		}

		getStyleSheets();

		// If were not in standards mode, IE is too old / new or we can't create
		if ( ieVersion < 9 ) {

			applyPatches();

			// :enabled & :disabled polling script (since we can't hook
			// onpropertychange event when an element is disabled)
			if (enabledWatchers.length > 0) {
				setInterval( function() {
					for (var c = 0, cl = enabledWatchers.length; c < cl; c++) {
						var e = enabledWatchers[c];
						if (e.disabled !== e.$disabled) {
							if (e.disabled) {
								e.disabled = false;
								e.$disabled = true;
								e.disabled = true;
							} else {
								e.$disabled = e.disabled;
							}
						}
					}
				}, 250);
			}
		}
	}

	function stylePropertyFix(property, prefixProperty) {
		Object.defineProperty(CSSStyleDeclaration.prototype, property, {
			get: function() {
				return this[prefixProperty];
			},
			set: function(val) {
				this[prefixProperty] = val;
			},
			enumerable: true
		});
	}

	function fixFnPrefix(obj, fnName) {
		var fn = obj[fnName];
		if (fn && fn.apply) {
			obj[fnName] = function() {
				try {
					if (PrefixFree.properties.indexOf(arguments[0]) >= 0) {
						arguments[0] = PrefixFree.prefix + arguments[0];
					}
				} catch (ex) {}
				return fn.apply(this, arguments);
			};
		}
	}

	function prefixInit() {
		if (!StyleFix.fixed) {
			StyleFix.fixed = 1;
			var tester = doc.createElement("div"),
				process = StyleFix.process;
			tester.style.cssText = "font-size:calc(1vmax*1)";
			if (!/vmax/.test(tester.style.fontSize)) {
				StyleFix.register(vunits);
				onresize(process);
			}
			contentLoaded(function() {
				setTimeout(process, 0);
			});

			for (var i in CSSStyleDeclaration.prototype) {
				if (/Property/.test(i)) {
					fixFnPrefix(CSSStyleDeclaration.prototype, i);
				}
			}
			PrefixFree.properties.forEach(function(property) {
				stylePropertyFix(StyleFix.camelCase(property), PrefixFree.prefixProperty(property, true));
			});
		}
	}

	if (ieVersion > 5 && ieVersion < 10) {
		if (ieVersion > 8) {
			stylePropertyFix("transform", "msTransform");
			stylePropertyFix("transformOrigin", "msTransformOrigin");
		} else {
			if (ieVersion < 8) {
				pie_path = "behavior: expression(window.PIE&&PIE.attach_ie67&&PIE.attach_ie67(this));";
			} else {
				pie_path = "behavior: url(" + pie_path + ");";
			}
		}

		if (pie_path && !win.PIE) {
			js_path += "PIE_IE" + (ieVersion < 9 ? "678" : "9") + ".js";
			loadScript(js_path);
		}
		// Determine the baseUrl and download the stylesheets
		var baseTags = doc.getElementsByTagName("BASE");
		var baseUrl = baseTags.length > 0 ? baseTags[0].href : doc.location.href;
		getStyleSheets();

		onresize(setLengthUnits);

		// Bind selectivizr to the ContentLoaded event.
		contentLoaded(function() {
			// Determine the "best fit" selector engine
			for (var engine in selectorEngines) {
				var members, member, context = win;
				if (win[engine]) {
					members = selectorEngines[engine].replace("*", engine).split(".");
					while ((member = members.shift()) && (context = context[member])) {}
					if (typeof context === "function") {
						selectorMethod = context;
						init();
						return;
					}
				}
			}
			init();
		});
	} else {
		js_path += "prefixfree.min.js";
		if (win.StyleFix) {
			prefixInit();
		} else {
			try {
				eval.call(win, loadStyleSheet(js_path));
				prefixInit();
			} catch (ex) {
				loadScript(js_path).onload = prefixInit;
			}
		}
	}

	/*!
	 * ContentLoaded.js by Diego Perini, modified for IE<9 only (to save space)
	 *
	 * Author: Diego Perini (diego.perini at gmail.com)
	 * Summary: cross-browser wrapper for DOMContentLoaded
	 * Updated: 20101020
	 * License: MIT
	 * Version: 1.2
	 *
	 * URL:
	 * http://javascript.nwbox.com/ContentLoaded/
	 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
	 *
	 */

	// @w window reference
	// @f function reference
	function contentLoaded(fn) {
		if (win.$) {
			return $(fn);
		}
		var isReady = false;

		function completed() {
			// readyState === "complete" is good enough for us to call the dom ready in oldIE
			if (!isReady) {
				isReady = true;
				fn();
			}
		}
		if (isDocComplete()) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout(completed);

		// Standards-based browsers support DOMContentLoaded
		} else if (doc.addEventListener) {
			// Use the handy event callback
			doc.addEventListener("DOMContentLoaded", completed, false);

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			doc.attachEvent("onreadystatechange", function() {
				if (isDocComplete()) {
					completed();
				}
			});

			// If IE and not a frame
			// continually check to see if the document is ready
			var top;

			try {
				top = !win.frameElement && root;
			} catch (e) {}

			if (top && top.doScroll) {
				(function doScrollCheck() {
					if (!isReady) {
						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch (e) {
							return setTimeout(doScrollCheck, 50);
						}

						// and execute any waiting functions
						completed();
					}
				})();
			}
		}
	}
})(this);


if(typeof Object.create!=="function"){
Object.create=function(o){
function F(){
};
F.prototype=o;
return new F();
};
}
var ua={toString:function(){
return navigator.userAgent;
},test:function(s){
return this.toString().toLowerCase().indexOf(s.toLowerCase())>-1;
}};
ua.version=(ua.toString().toLowerCase().match(/[\s\S]+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)||[])[1];
ua.webkit=ua.test("webkit");
ua.gecko=ua.test("gecko")&&!ua.webkit;
ua.opera=ua.test("opera");
ua.ie=ua.test("msie")&&!ua.opera;
ua.ie6=ua.ie&&document.compatMode&&typeof document.documentElement.style.maxHeight==="undefined";
ua.ie7=ua.ie&&document.documentElement&&typeof document.documentElement.style.maxHeight!=="undefined"&&typeof XDomainRequest==="undefined";
ua.ie8=ua.ie&&typeof XDomainRequest!=="undefined";
var domReady=function(){
var _1=[];
var _2=function(){
if(!arguments.callee.done){
arguments.callee.done=true;
for(var i=0;i<_1.length;i++){
_1[i]();
}
}
};
if(document.addEventListener){
document.addEventListener("DOMContentLoaded",_2,false);
}
if(ua.ie){
(function(){
try{
document.documentElement.doScroll("left");
}
catch(e){
setTimeout(arguments.callee,50);
return;
}
_2();
})();
document.onreadystatechange=function(){
if(document.readyState==="complete"){
document.onreadystatechange=null;
_2();
}
};
}
if(ua.webkit&&document.readyState){
(function(){
if(document.readyState!=="loading"){
_2();
}else{
setTimeout(arguments.callee,10);
}
})();
}
window.onload=_2;
return function(fn){
if(typeof fn==="function"){
_1[_1.length]=fn;
}
return fn;
};
}();
var cssHelper=function(){
var _3={BLOCKS:/[^\s{][^{]*\{(?:[^{}]*\{[^{}]*\}[^{}]*|[^{}]*)*\}/g,BLOCKS_INSIDE:/[^\s{][^{]*\{[^{}]*\}/g,DECLARATIONS:/[a-zA-Z\-]+[^;]*:[^;]+;/g,RELATIVE_URLS:/url\(['"]?([^\/\)'"][^:\)'"]+)['"]?\)/g,REDUNDANT_COMPONENTS:/(?:\/\*([^*\\\\]|\*(?!\/))+\*\/|@import[^;]+;)/g,REDUNDANT_WHITESPACE:/\s*(,|:|;|\{|\})\s*/g,MORE_WHITESPACE:/\s{2,}/g,FINAL_SEMICOLONS:/;\}/g,NOT_WHITESPACE:/\S+/g};
var _4,_5=false;
var _6=[];
var _7=function(fn){
if(typeof fn==="function"){
_6[_6.length]=fn;
}
};
var _8=function(){
for(var i=0;i<_6.length;i++){
_6[i](_4);
}
};
var _9={};
var _a=function(n,v){
if(_9[n]){
var _b=_9[n].listeners;
if(_b){
for(var i=0;i<_b.length;i++){
_b[i](v);
}
}
}
};
var _c=function(_d,_e,_f){
if(ua.ie&&!window.XMLHttpRequest){
window.XMLHttpRequest=function(){
return new ActiveXObject("Microsoft.XMLHTTP");
};
}
if(!XMLHttpRequest){
return "";
}
var r=new XMLHttpRequest();
try{
r.open("get",_d,true);
r.setRequestHeader("X_REQUESTED_WITH","XMLHttpRequest");
}
catch(e){
_f();
return;
}
var _10=false;
setTimeout(function(){
_10=true;
},5000);
document.documentElement.style.cursor="progress";
r.onreadystatechange=function(){
if(r.readyState===4&&!_10){
if(!r.status&&location.protocol==="file:"||(r.status>=200&&r.status<300)||r.status===304||navigator.userAgent.indexOf("Safari")>-1&&typeof r.status==="undefined"){
_e(r.responseText);
}else{
_f();
}
document.documentElement.style.cursor="";
r=null;
}
};
r.send("");
};
var _11=function(_12){
_12=_12.replace(_3.REDUNDANT_COMPONENTS,"");
_12=_12.replace(_3.REDUNDANT_WHITESPACE,"$1");
_12=_12.replace(_3.MORE_WHITESPACE," ");
_12=_12.replace(_3.FINAL_SEMICOLONS,"}");
return _12;
};
var _13={mediaQueryList:function(s){
var o={};
var idx=s.indexOf("{");
var lt=s.substring(0,idx);
s=s.substring(idx+1,s.length-1);
var mqs=[],rs=[];
var qts=lt.toLowerCase().substring(7).split(",");
for(var i=0;i<qts.length;i++){
mqs[mqs.length]=_13.mediaQuery(qts[i],o);
}
var rts=s.match(_3.BLOCKS_INSIDE);
if(rts!==null){
for(i=0;i<rts.length;i++){
rs[rs.length]=_13.rule(rts[i],o);
}
}
o.getMediaQueries=function(){
return mqs;
};
o.getRules=function(){
return rs;
};
o.getListText=function(){
return lt;
};
o.getCssText=function(){
return s;
};
return o;
},mediaQuery:function(s,mql){
s=s||"";
var not=false,_14;
var exp=[];
var _15=true;
var _16=s.match(_3.NOT_WHITESPACE);
for(var i=0;i<_16.length;i++){
var _17=_16[i];
if(!_14&&(_17==="not"||_17==="only")){
if(_17==="not"){
not=true;
}
}else{
if(!_14){
_14=_17;
}else{
if(_17.charAt(0)==="("){
var _18=_17.substring(1,_17.length-1).split(":");
exp[exp.length]={mediaFeature:_18[0],value:_18[1]||null};
}
}
}
}
return {getList:function(){
return mql||null;
},getValid:function(){
return _15;
},getNot:function(){
return not;
},getMediaType:function(){
return _14;
},getExpressions:function(){
return exp;
}};
},rule:function(s,mql){
var o={};
var idx=s.indexOf("{");
var st=s.substring(0,idx);
var ss=st.split(",");
var ds=[];
var dts=s.substring(idx+1,s.length-1).split(";");
for(var i=0;i<dts.length;i++){
ds[ds.length]=_13.declaration(dts[i],o);
}
o.getMediaQueryList=function(){
return mql||null;
};
o.getSelectors=function(){
return ss;
};
o.getSelectorText=function(){
return st;
};
o.getDeclarations=function(){
return ds;
};
o.getPropertyValue=function(n){
for(var i=0;i<ds.length;i++){
if(ds[i].getProperty()===n){
return ds[i].getValue();
}
}
return null;
};
return o;
},declaration:function(s,r){
var idx=s.indexOf(":");
var p=s.substring(0,idx);
var v=s.substring(idx+1);
return {getRule:function(){
return r||null;
},getProperty:function(){
return p;
},getValue:function(){
return v;
}};
}};
var _19=function(el){
if(typeof el.cssHelperText!=="string"){
return;
}
var o={mediaQueryLists:[],rules:[],selectors:{},declarations:[],properties:{}};
var _1a=o.mediaQueryLists;
var ors=o.rules;
var _1b=el.cssHelperText.match(_3.BLOCKS);
if(_1b!==null){
for(var i=0;i<_1b.length;i++){
if(_1b[i].substring(0,7)==="@media "){
_1a[_1a.length]=_13.mediaQueryList(_1b[i]);
ors=o.rules=ors.concat(_1a[_1a.length-1].getRules());
}else{
ors[ors.length]=_13.rule(_1b[i]);
}
}
}
var oss=o.selectors;
var _1c=function(r){
var ss=r.getSelectors();
for(var i=0;i<ss.length;i++){
var n=ss[i];
if(!oss[n]){
oss[n]=[];
}
oss[n][oss[n].length]=r;
}
};
for(i=0;i<ors.length;i++){
_1c(ors[i]);
}
var ods=o.declarations;
for(i=0;i<ors.length;i++){
ods=o.declarations=ods.concat(ors[i].getDeclarations());
}
var ops=o.properties;
for(i=0;i<ods.length;i++){
var n=ods[i].getProperty();
if(!ops[n]){
ops[n]=[];
}
ops[n][ops[n].length]=ods[i];
}
el.cssHelperParsed=o;
_4[_4.length]=el;
return o;
};
var _1d=function(el,s){
el.cssHelperText=_11(s||el.innerHTML);
return _19(el);
};
var _1e=function(){
_5=true;
_4=[];
var _1f=[];
var _20=function(){
for(var i=0;i<_1f.length;i++){
_19(_1f[i]);
}
var _21=document.getElementsByTagName("style");
for(i=0;i<_21.length;i++){
_1d(_21[i]);
}
_5=false;
_8();
};
var _22=document.getElementsByTagName("link");
for(var i=0;i<_22.length;i++){
var _23=_22[i];
if(_23.getAttribute("rel").indexOf("style")>-1&&_23.href&&_23.href.length!==0&&!_23.disabled){
_1f[_1f.length]=_23;
}
}
if(_1f.length>0){
var c=0;
var _24=function(){
c++;
if(c===_1f.length){
_20();
}
};
var _25=function(_26){
var _27=_26.href;
_c(_27,function(_28){
_28=_11(_28).replace(_3.RELATIVE_URLS,"url("+_27.substring(0,_27.lastIndexOf("/"))+"/$1)");
_26.cssHelperText=_28;
_24();
},_24);
};
for(i=0;i<_1f.length;i++){
_25(_1f[i]);
}
}else{
_20();
}
};
var _29={mediaQueryLists:"array",rules:"array",selectors:"object",declarations:"array",properties:"object"};
var _2a={mediaQueryLists:null,rules:null,selectors:null,declarations:null,properties:null};
var _2b=function(_2c,v){
if(_2a[_2c]!==null){
if(_29[_2c]==="array"){
return (_2a[_2c]=_2a[_2c].concat(v));
}else{
var c=_2a[_2c];
for(var n in v){
if(v.hasOwnProperty(n)){
if(!c[n]){
c[n]=v[n];
}else{
c[n]=c[n].concat(v[n]);
}
}
}
return c;
}
}
};
var _2d=function(_2e){
_2a[_2e]=(_29[_2e]==="array")?[]:{};
for(var i=0;i<_4.length;i++){
_2b(_2e,_4[i].cssHelperParsed[_2e]);
}
return _2a[_2e];
};
domReady(function(){
var els=document.body.getElementsByTagName("*");
for(var i=0;i<els.length;i++){
els[i].checkedByCssHelper=true;
}
if(document.implementation.hasFeature("MutationEvents","2.0")||window.MutationEvent){
document.body.addEventListener("DOMNodeInserted",function(e){
var el=e.target;
if(el.nodeType===1){
_a("DOMElementInserted",el);
el.checkedByCssHelper=true;
}
},false);
}else{
setInterval(function(){
var els=document.body.getElementsByTagName("*");
for(var i=0;i<els.length;i++){
if(!els[i].checkedByCssHelper){
_a("DOMElementInserted",els[i]);
els[i].checkedByCssHelper=true;
}
}
},1000);
}
});
var _2f=function(d){
if(typeof window.innerWidth!="undefined"){
return window["inner"+d];
}else{
if(typeof document.documentElement!="undefined"&&typeof document.documentElement.clientWidth!="undefined"&&document.documentElement.clientWidth!=0){
return document.documentElement["client"+d];
}
}
};
return {addStyle:function(s,_30){
var el=document.createElement("style");
el.setAttribute("type","text/css");
document.getElementsByTagName("head")[0].appendChild(el);
if(el.styleSheet){
el.styleSheet.cssText=s;
}else{
el.appendChild(document.createTextNode(s));
}
el.addedWithCssHelper=true;
if(typeof _30==="undefined"||_30===true){
cssHelper.parsed(function(_31){
var o=_1d(el,s);
for(var n in o){
if(o.hasOwnProperty(n)){
_2b(n,o[n]);
}
}
_a("newStyleParsed",el);
});
}else{
el.parsingDisallowed=true;
}
return el;
},removeStyle:function(el){
return el.parentNode.removeChild(el);
},parsed:function(fn){
if(_5){
_7(fn);
}else{
if(typeof _4!=="undefined"){
if(typeof fn==="function"){
fn(_4);
}
}else{
_7(fn);
_1e();
}
}
},mediaQueryLists:function(fn){
cssHelper.parsed(function(_32){
fn(_2a.mediaQueryLists||_2d("mediaQueryLists"));
});
},rules:function(fn){
cssHelper.parsed(function(_33){
fn(_2a.rules||_2d("rules"));
});
},selectors:function(fn){
cssHelper.parsed(function(_34){
fn(_2a.selectors||_2d("selectors"));
});
},declarations:function(fn){
cssHelper.parsed(function(_35){
fn(_2a.declarations||_2d("declarations"));
});
},properties:function(fn){
cssHelper.parsed(function(_36){
fn(_2a.properties||_2d("properties"));
});
},broadcast:_a,addListener:function(n,fn){
if(typeof fn==="function"){
if(!_9[n]){
_9[n]={listeners:[]};
}
_9[n].listeners[_9[n].listeners.length]=fn;
}
},removeListener:function(n,fn){
if(typeof fn==="function"&&_9[n]){
var ls=_9[n].listeners;
for(var i=0;i<ls.length;i++){
if(ls[i]===fn){
ls.splice(i,1);
i-=1;
}
}
}
},getViewportWidth:function(){
return _2f("Width");
},getViewportHeight:function(){
return _2f("Height");
}};
}();
domReady(function enableCssMediaQueries(){
var _37;
var _38={LENGTH_UNIT:/[0-9]+(em|ex|px|in|cm|mm|pt|pc)$/,RESOLUTION_UNIT:/[0-9]+(dpi|dpcm)$/,ASPECT_RATIO:/^[0-9]+\/[0-9]+$/,ABSOLUTE_VALUE:/^[0-9]*(\.[0-9]+)*$/};
var _39=[];
var _3a=function(){
var id="css3-mediaqueries-test";
var el=document.createElement("div");
el.id=id;
var _3b=cssHelper.addStyle("@media all and (width) { #"+id+" { width: 1px !important; } }",false);
document.body.appendChild(el);
var ret=el.offsetWidth===1;
_3b.parentNode.removeChild(_3b);
el.parentNode.removeChild(el);
_3a=function(){
return ret;
};
return ret;
};
var _3c=function(){
_37=document.createElement("div");
_37.style.cssText="position:absolute;top:-9999em;left:-9999em;"+"margin:0;border:none;padding:0;width:1em;font-size:1em;";
document.body.appendChild(_37);
if(_37.offsetWidth!==16){
_37.style.fontSize=16/_37.offsetWidth+"em";
}
_37.style.width="";
};
var _3d=function(_3e){
_37.style.width=_3e;
var _3f=_37.offsetWidth;
_37.style.width="";
return _3f;
};
var _40=function(_41,_42){
var l=_41.length;
var min=(_41.substring(0,4)==="min-");
var max=(!min&&_41.substring(0,4)==="max-");
if(_42!==null){
var _43;
var _44;
if(_38.LENGTH_UNIT.exec(_42)){
_43="length";
_44=_3d(_42);
}else{
if(_38.RESOLUTION_UNIT.exec(_42)){
_43="resolution";
_44=parseInt(_42,10);
var _45=_42.substring((_44+"").length);
}else{
if(_38.ASPECT_RATIO.exec(_42)){
_43="aspect-ratio";
_44=_42.split("/");
}else{
if(_38.ABSOLUTE_VALUE){
_43="absolute";
_44=_42;
}else{
_43="unknown";
}
}
}
}
}
var _46,_47;
if("device-width"===_41.substring(l-12,l)){
_46=screen.width;
if(_42!==null){
if(_43==="length"){
return ((min&&_46>=_44)||(max&&_46<_44)||(!min&&!max&&_46===_44));
}else{
return false;
}
}else{
return _46>0;
}
}else{
if("device-height"===_41.substring(l-13,l)){
_47=screen.height;
if(_42!==null){
if(_43==="length"){
return ((min&&_47>=_44)||(max&&_47<_44)||(!min&&!max&&_47===_44));
}else{
return false;
}
}else{
return _47>0;
}
}else{
if("width"===_41.substring(l-5,l)){
_46=document.documentElement.clientWidth||document.body.clientWidth;
if(_42!==null){
if(_43==="length"){
return ((min&&_46>=_44)||(max&&_46<_44)||(!min&&!max&&_46===_44));
}else{
return false;
}
}else{
return _46>0;
}
}else{
if("height"===_41.substring(l-6,l)){
_47=document.documentElement.clientHeight||document.body.clientHeight;
if(_42!==null){
if(_43==="length"){
return ((min&&_47>=_44)||(max&&_47<_44)||(!min&&!max&&_47===_44));
}else{
return false;
}
}else{
return _47>0;
}
}else{
if("device-aspect-ratio"===_41.substring(l-19,l)){
return _43==="aspect-ratio"&&screen.width*_44[1]===screen.height*_44[0];
}else{
if("color-index"===_41.substring(l-11,l)){
var _48=Math.pow(2,screen.colorDepth);
if(_42!==null){
if(_43==="absolute"){
return ((min&&_48>=_44)||(max&&_48<_44)||(!min&&!max&&_48===_44));
}else{
return false;
}
}else{
return _48>0;
}
}else{
if("color"===_41.substring(l-5,l)){
var _49=screen.colorDepth;
if(_42!==null){
if(_43==="absolute"){
return ((min&&_49>=_44)||(max&&_49<_44)||(!min&&!max&&_49===_44));
}else{
return false;
}
}else{
return _49>0;
}
}else{
if("resolution"===_41.substring(l-10,l)){
var res;
if(_45==="dpcm"){
res=_3d("1cm");
}else{
res=_3d("1in");
}
if(_42!==null){
if(_43==="resolution"){
return ((min&&res>=_44)||(max&&res<_44)||(!min&&!max&&res===_44));
}else{
return false;
}
}else{
return res>0;
}
}else{
return false;
}
}
}
}
}
}
}
}
};
var _4a=function(mq){
var _4b=mq.getValid();
var _4c=mq.getExpressions();
var l=_4c.length;
if(l>0){
for(var i=0;i<l&&_4b;i++){
_4b=_40(_4c[i].mediaFeature,_4c[i].value);
}
var not=mq.getNot();
return (_4b&&!not||not&&!_4b);
}
};
var _4d=function(mql){
var mqs=mql.getMediaQueries();
var t={};
for(var i=0;i<mqs.length;i++){
if(_4a(mqs[i])){
t[mqs[i].getMediaType()]=true;
}
}
var s=[],c=0;
for(var n in t){
if(t.hasOwnProperty(n)){
if(c>0){
s[c++]=",";
}
s[c++]=n;
}
}
if(s.length>0){
_39[_39.length]=cssHelper.addStyle("@media "+s.join("")+"{"+mql.getCssText()+"}",false);
}
};
var _4e=function(_4f){
for(var i=0;i<_4f.length;i++){
_4d(_4f[i]);
}
if(ua.ie){
document.documentElement.style.display="block";
setTimeout(function(){
document.documentElement.style.display="";
},0);
setTimeout(function(){
cssHelper.broadcast("cssMediaQueriesTested");
},100);
}else{
cssHelper.broadcast("cssMediaQueriesTested");
}
};
var _50=function(){
for(var i=0;i<_39.length;i++){
cssHelper.removeStyle(_39[i]);
}
_39=[];
cssHelper.mediaQueryLists(_4e);
};
var _51=0;
var _52=function(){
var _53=cssHelper.getViewportWidth();
var _54=cssHelper.getViewportHeight();
if(ua.ie){
var el=document.createElement("div");
el.style.position="absolute";
el.style.top="-9999em";
el.style.overflow="scroll";
document.body.appendChild(el);
_51=el.offsetWidth-el.clientWidth;
document.body.removeChild(el);
}
var _55;
var _56=function(){
var vpw=cssHelper.getViewportWidth();
var vph=cssHelper.getViewportHeight();
if(Math.abs(vpw-_53)>_51||Math.abs(vph-_54)>_51){
_53=vpw;
_54=vph;
clearTimeout(_55);
_55=setTimeout(function(){
if(!_3a()){
_50();
}else{
cssHelper.broadcast("cssMediaQueriesTested");
}
},500);
}
};
window.onresize=function(){
var x=window.onresize||function(){
};
return function(){
x();
_56();
};
}();
};
var _57=document.documentElement;
_57.style.marginLeft="-32767px";
setTimeout(function(){
_57.style.marginTop="";
},20000);
return function(){
if(!_3a()){
cssHelper.addListener("newStyleParsed",function(el){
_4e(el.cssHelperParsed.mediaQueryLists);
});
cssHelper.addListener("cssMediaQueriesTested",function(){
if(ua.ie){
_57.style.width="1px";
}
setTimeout(function(){
_57.style.width="";
_57.style.marginLeft="";
},0);
cssHelper.removeListener("cssMediaQueriesTested",arguments.callee);
});
_3c();
_50();
}else{
_57.style.marginLeft="";
}
_52();
};
}());
try{
document.execCommand("BackgroundImageCache",false,true);
}
catch(e){
}
