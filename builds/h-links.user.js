// ==UserScript==
// @name        H-links
// @namespace   dnsev-h
// @author      dnsev-h
// @version     1.1.0
// @description Making your browsing experience on 4chan and friends more pleasurable
// @include     http://boards.4chan.org/*
// @include     https://boards.4chan.org/*
// @include     http://8ch.net/*
// @include     https://8ch.net/*
// @include     http://desustorage.org/*
// @include     https://desustorage.org/*
// @include     http://fgts.jp/*
// @include     https://fgts.jp/*
// @include     http://boards.38chan.net/*
// @homepage    https://dnsev-h.github.io/h-links/
// @supportURL  https://github.com/dnsev-h/h-links/issues
// @updateURL   https://raw.githubusercontent.com/dnsev-h/h-links/stable/builds/h-links.meta.js
// @downloadURL https://raw.githubusercontent.com/dnsev-h/h-links/stable/builds/h-links.user.js
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABBElEQVR4Ae3Zg24FYRBH8b5obQW1bdt2+2AbZx7hNuyZ+ttcLf6T/MrFnBo1Gk3xU4ijitdUQPIDojcDigqI9g1bUEBogAK2DCvIfoACnlBUwIphHtkMUMCT4RYcE180Z5hC4HflAqCA5AbcGi6cY2fP2XRWnDlnEp/u9Wq4xKdj5g3D8MckK0AB54YjZ9fZdJbxZWmM4NO9rgy7zoIz7HQhqQEK+GXpIr+M9tsH9/KwpbudOiQ3QAG7hg0U9cNcr6ED/pj4SzPJClDAhmEJRQV0GJrhjvGClk5ugAKWDLMoKoClg5YLuFeCAxQwa5hAMQEs7cW5ZvIDFKB/MSkgtaPRaDTvICyvC8iXsp8AAAAASUVORK5CYII=
// @icon64      data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAABnRSTlMAAQAAAABTxi4hAAABH0lEQVR4Ae3aRVYkURBG4VcL7cYdJri7O42768JyGltgxLmBlAY09sf5ZiUZd5RSlXLpe1NAjALKn4/4UgUo4KsEZA8GJxKQbRpW8WsCFKCAVcM8vnyAAhRwg1DAvGEKXzJAAQq4MZwjBSabNIyihAu7vKMABXxYwLnhyNl1/jkrzrwz6Yzg2bHuDcd49p4pQx/ydMUDFKCAQ8OOs+GsOHN4sTT68exYJ4YNZ9rpc1qhAAV8VEC+pVNgsi578jyglKXbnL/4sAAFKGDDsIzQDU2HoRnJTblL56AABbxvwLJhFqGAZkMdUp4pYemPC1CAAmYNEwgFuKVLWS5yLAUoIBwwYRhGKICl8wcEKEAB+rOHAhSgfy0qQAEKUIACKvYIACct1/DsfqEAAAAASUVORK5CYII=
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @run-at      document-start
// ==/UserScript==
(function () {
	"use strict";

	var timing = (function () {
		var perf = window.performance,
			now, fn;

		if (!perf || !(now = perf.now || perf.mozNow || perf.msNow || perf.oNow || perf.webkitNow)) {
			perf = Date;
			now = perf.now;
		}

		fn = function () { return now.call(perf); };
		fn.start = now.call(perf);
		return fn;
	})();

	// begin_debug

	var d = document;
	var browser = {
		is_opera: /presto/i.test("" + navigator.userAgent),
		is_firefox: /firefox/i.test("" + navigator.userAgent)
	};
	var categories = {
		"Artist CG Sets": { "short": "artistcg",  "name": "Artist CG"  },
		"Asian Porn":     { "short": "asianporn", "name": "Asian Porn" },
		"Cosplay":        { "short": "cosplay",   "name": "Cosplay"    },
		"Doujinshi":      { "short": "doujinshi", "name": "Doujinshi"  },
		"Game CG Sets":   { "short": "gamecg",    "name": "Game CG"    },
		"Image Sets":     { "short": "imageset",  "name": "Image Set"  },
		"Manga":          { "short": "manga",     "name": "Manga"      },
		"Misc":           { "short": "misc",      "name": "Misc"       },
		"Non-H":          { "short": "non-h",     "name": "Non-H"      },
		"Private":        { "short": "private",   "name": "Private"    },
		"Western":        { "short": "western",   "name": "Western"    }
	};
	var domains = {
		exhentai: "exhentai.org",
		gehentai: "g.e-hentai.org",
		ehentai: "e-hentai.org",
		nhentai: "nhentai.net",
		hitomi: "hitomi.la"
	};
	var domain_info = {
		"exhentai.org": { tag: "Ex", g_domain: "exhentai.org", type: "ehentai" },
		"e-hentai.org": { tag: "EH", g_domain: "g.e-hentai.org", type: "ehentai" },
		"nhentai.net": { tag: "n", g_domain: "nhentai.net", type: "nhentai" },
		"hitomi.la": { tag: "Hi", g_domain: "hitomi.la", type: "hitomi" }
	};
	var options = {
		general: [
			// [ name, default, label, description, old_name, info? ]
			[ "automatic_processing", true,
				"Automatic link processing", "Get data and format links automatically",
				"Automatic Processing"
			],
			[ "changelog_on_update", true,
				"Show changelog on update", "Show the changelog after an update",
				"Show Changelog on Update"
			],
			[ "external_resources", true,
				"Allow external resources", "Enable the usage of web-fonts provided by Google servers",
				"Use Extenral Resources"
			],
			[ "image_leeching_disabled", false,
				"Hide referrer for thumbnails", "Thumbnails fetching should not send referrer information",
				"Disable Image Leeching"
			],
			[ "rewrite_links", "none",
				"Rewrite link URLs", "Rewrite all E*Hentai links to use a specific site",
				"Rewrite Links",
				{
					type: "select",
					options: [ // [ value, label_text, description? ]
						[ "none", "Disabled" ],
						[ "smart", "Smart", "All links lead to " + domains.gehentai + " unless they have fjording tags" ],
						[ domains.ehentai, domains.gehentai ],
						[ domains.exhentai, domains.exhentai ]
					]
				}
			],
		],
		details: [
			[ "enabled", true,
				"Enabled", "Show details for gallery links on hover",
				"Gallery Details"
			],
			[ "extended_info", true,
				"Extended info", "Fetch complete gallery info for E*Hentai, including tag namespaces",
				"Extended Info"
			],
			[ "hover_position", -0.25,
				"Hovering position", "Change the horizontal offset of the gallery details from the cursor",
				"Details Hover Position",
				{
					type: "select",
					options: [ // [ value, label_text, description? ]
						[ -0.25, "Default", "Offset slightly from the cursor" ],
						[ 0.0, "ExLinks", "Use the original ExLinks style positioning" ]
					],
					set: function (v) { return parseFloat(v) || 0.0; }
				}
			],
		],
		actions: [
			[ "enabled", true,
				"Enabled", "Generate gallery actions for links",
				"Gallery Actions"
			],
			[ "close_on_click", true,
				"Close on click", "Close gallery actions after clicking anywhere",
				null
			],
		],
		sauce: [
			[ "enabled", true,
				"Enabled", "Add ExSauce reverse image search to posts containing images",
				"ExSauce"
			],
			[ "expunged", false,
				"Search expunged", "Search expunged galleries for source",
				"Search Expunged"
			],
			[ "label", "",
				"Custom label", "Use a custom label instead of the site name (e-hentai/exhentai)",
				"Custom Label Text",
				{ type: "textbox" }
			],
			[ "lookup_domain", domains.exhentai,
				"Lookup domain", "The site to use for the reverse image search",
				"Lookup Domain",
				{
					type: "select",
					options: [ // [ value, label_text, description? ]
						[ domains.ehentai, domains.gehentai ],
						[ domains.exhentai, domains.exhentai ]
					]
				}
			],
		],
		filter: [
			[ "enabled", true,
				"Enabled", "Enable filtering of galleries",
				null
			],
			[ "full_highlighting", false,
				"Full highlighting", "Highlight of all the text instead of just the matching portion",
				"Full Highlighting"
			],
			[ "good_tag_marker", "!",
				"Good tag marker", "Text to mark a good [Ex]/[EH] tag with",
				"Good Tag Marker",
				{ type: "textbox" },
			],
			[ "bad_tag_marker", "",
				"Bad tag marker", "Text to mark a bad [Ex]/[EH] tag with",
				"Bad Tag Marker",
				{ type: "textbox" },
			],
			[ "filters",
				( //{
					"# Highlight all doujinshi and manga galleries with (C88) in the name:\n" +
					"# /\\(C88\\)/i;only:doujinshi,manga;link-color:red;color:#FF0000;title\n" +
					"# Highlight \"english\" and \"translated\" tags in non-western non-non-h galleries:\n" +
					"# /english|translated/i;not:western,non-h;colors:#4080F0;tag\n" +
					"# Highlight galleries tagged with \"touhou project\":\n" +
					"# /touhou project/i;underlines:rgba(255,128,64,1);tag;title\n" +
					"# Highlight releases translated by {5 a.m.}:\n" +
					"# /\\{?5\\s*a[\\.,]?m[\\.,]?\\}?/i;title;bgs:#3BC620;colors:#FDFA18;\n" +
					"# Don't highlight anything uploaded by \"CGrascal\"\n" +
					"# /CGrascal/i;bad:yes;uploader;title;"
				), //}
				"Filters", "",
				"Filters",
				{ type: "textarea" },
			],
		],
		debug: [
			[ "enabled", false,
				"Enabled", "Enable logging to the browser console",
				"Debug Mode"
			],
			[ "cache_mode", "local",
				"Caching mode", "Change how your browser caches link information",
				function (config_old) {
					if (config_old["Disable Caching"]) return "none";
					if (config_old["Disable Local Storage Cache"]) return "session";
					return "local";
				},
				{
					type: "select",
					options: [ // [ value, label_text, description? ]
						[ "local", "Local storage", "Data is cached per website" ],
						[ "session", "Session storage", "Data is cached per browser tab" ],
						[ "none", "Disabled", "Data is not cached" ],
					]
				}
			],
		],
	};
	var config = { version: null, settings_version: 1 };

	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;
	var $$ = function (selector, root) {
		return (root || d).querySelectorAll(selector);
	};
	var $ = (function () {

		// Inspired by 4chan X and jQuery API: https://api.jquery.com/ (functions are not chainable)
		var Module = function (selector, root) {
			return (root || d).querySelector(selector);
		};

		Module.ready = (function () {

			var callbacks = [],
				check_interval = null,
				check_interval_time = 250;

			var callback_check = function () {
				if (
					(document.readyState === "interactive" || document.readyState === "complete") &&
					callbacks !== null
				) {
					var cbs = callbacks,
						cb_count = cbs.length,
						i;

					callbacks = null;

					for (i = 0; i < cb_count; ++i) {
						cbs[i].call(null);
					}

					window.removeEventListener("load", callback_check, false);
					window.removeEventListener("DOMContentLoaded", callback_check, false);
					document.removeEventListener("readystatechange", callback_check, false);

					if (check_interval !== null) {
						clearInterval(check_interval);
						check_interval = null;
					}

					return true;
				}

				return false;
			};

			window.addEventListener("load", callback_check, false);
			window.addEventListener("DOMContentLoaded", callback_check, false);
			document.addEventListener("readystatechange", callback_check, false);

			return function (cb) {
				if (callbacks === null) {
					cb.call(null);
				}
				else {
					callbacks.push(cb);
					if (check_interval === null && callback_check() !== true) {
						check_interval = setInterval(callback_check, check_interval_time);
					}
				}
			};

		})();

		Module.frag = function (content) {
			var frag = d.createDocumentFragment(),
				div = $.node_simple("div"),
				n, next;

			div.innerHTML = content;
			for (n = div.firstChild; n !== null; n = next) {
				next = n.nextSibling;
				frag.appendChild(n);
			}
			return frag;
		};
		Module.prepend = function (parent, child) {
			return parent.insertBefore(child, parent.firstChild);
		};
		Module.add = function (parent, child) {
			return parent.appendChild(child);
		};
		Module.before = function (root, next, node) {
			return root.insertBefore(node, next);
		};
		Module.after = function (root, prev, node) {
			return root.insertBefore(node, prev.nextSibling);
		};
		Module.replace = function (root, elem) {
			return root.parentNode.replaceChild(elem, root);
		};
		Module.remove = function (elem) {
			return elem.parentNode.removeChild(elem);
		};
		Module.tnode = function (text) {
			return d.createTextNode(text);
		};
		Module.node = function (tag, class_name, text) {
			var elem = d.createElement(tag);
			elem.className = class_name;
			if (text !== undefined) {
				elem.textContent = text;
			}
			return elem;
		};
		Module.node_ns = function (namespace, tag, class_name) {
			var elem = d.createElementNS(namespace, tag);
			elem.setAttribute("class", class_name);
			return elem;
		};
		Module.node_simple = function (tag) {
			return d.createElement(tag);
		};
		Module.link = function (href, class_name, text) {
			var elem = d.createElement("a");
			if (href !== undefined) {
				elem.href = href;
				elem.target = "_blank";
				elem.rel = "noreferrer";
			}
			if (class_name !== undefined) {
				elem.className = class_name;
			}
			if (text !== undefined) {
				elem.textContent = text;
			}
			return elem;
		};
		Module.on = function (elem, eventlist, handler) {
			var event, i, ii;
			if (eventlist instanceof Array) {
				for (i = 0, ii = eventlist.length; i < ii; ++i) {
					event = eventlist[i];
					elem.addEventListener(event[0], event[1], false);
				}
			}
			else {
				elem.addEventListener(eventlist, handler, false);
			}
		};
		Module.off = function (elem, eventlist, handler) {
			var event, i, ii;
			if (eventlist instanceof Array) {
				for (i = 0, ii = eventlist.length; i < ii; ++i) {
					event = eventlist[i];
					elem.removeEventListener(event[0], event[1], false);
				}
			}
			else {
				elem.removeEventListener(eventlist, handler, false);
			}
		};
		Module.test = function (elem, selector) {
			try {
				if (elem.matches) return elem.matches(selector);
				return elem.matchesSelector(selector);
			}
			catch (e) {}
			return false;
		};
		Module.unwrap = function (node) {
			var par = node.parentNode,
				next, n;

			if (par !== null) {
				next = node.nextSibling;
				while ((n = node.firstChild) !== null) {
					par.insertBefore(n, next);
				}
				par.removeChild(node);
			}
		};

		Module.scroll_focus = function (element) {
			// Focus
			var n = $.node_simple("textarea");
			$.prepend(element, n);
			n.focus();
			n.blur();
			$.remove(n);

			// Scroll to top
			element.scrollTop = 0;
			element.scrollLeft = 0;
		};
		Module.clamp = function (value, min, max) {
			return Math.min(max, Math.max(min, value));
		};
		Module.is_left_mouse = function (event) {
			return (event.which === undefined || event.which === 1);
		};
		Module.push_many = function (target, new_entries) {
			var max_push = 1000;
			if (new_entries.length < max_push) {
				Array.prototype.push.apply(target, new_entries);
			}
			else {
				for (var i = 0, ii = new_entries.length; i < ii; i += max_push) {
					Array.prototype.push.apply(target, Array.prototype.slice.call(new_entries, i, i + max_push));
				}
			}
		};
		Module.bind = function (fn, self) {
			if (arguments.length > 2) {
				var args = Array.prototype.slice.call(arguments, 2);

				return function () {
					var full_args = Array.prototype.slice.call(args);
					Array.prototype.push.apply(full_args, arguments);

					return fn.apply(self, full_args);
				};
			}
			else {
				return function () {
					return fn.apply(self, arguments);
				};
			}
		};

		return Module;

	})();
	var Debug = (function () {

		var started = false,
			timer_names = null;

		var dummy_fn = function () {};
		var log = dummy_fn;
		var timer_log = function (label, timer) {
			var t = timing(),
				value;

			if (typeof(timer) === "string") timer = timer_names[timer];

			value = (timer === undefined) ? "???ms" : (t - timer).toFixed(3) + "ms";

			if (!started) return [ label, value ];
			log(label, value);
		};

		var init = function () {
			started = true;

			if (!config.debug.enabled) {
				timer_log = dummy_fn;
				Module.timer_log = timer_log;
				return;
			}

			// Debug functions
			timer_names = {};
			log = function () {
				var args = [ "H-links " + Main.version.join(".") + ":" ].concat(Array.prototype.slice.call(arguments));
				console.log.apply(console, args);
			};
			Debug.log = log;
			Debug.timer = function (name, dont_format) {
				var t1 = timing(),
					t2;

				t2 = timer_names[name];
				timer_names[name] = t1;

				if (dont_format) {
					return (t2 === undefined) ? -1 : (t1 - t2);
				}
				return (t2 === undefined) ? "???ms" : (t1 - t2).toFixed(3) + "ms";
			};
		};

		// Exports
		var Module = {
			log: log,
			timer: dummy_fn,
			timer_log: timer_log,
			init: init
		};

		return Module;

	})();
	var Helper = (function () {

		// Private
		var re_full_domain = /^(?:[\w\-]+):\/*([\w\-]+(?:\.[\w\-]+)*)/i,
			re_short_domain = /^(?:[\w\-]+):\/*(?:[\w-]+\.)*([\w-]+\.[\w]+)/i,
			re_change_domain = /^([\w\-]+:\/*)([\w\-]+(?:\.[\w\-]+)*)([\w\W]*)$/i;

		// Public
		var regex_escape = function (text) {
			return text.replace(/[\$\(\)\*\+\-\.\/\?\[\\\]\^\{\|\}]/g, "\\$&");
		};
		var json_parse_safe = function (text, def) {
			try {
				return JSON.parse(text);
			}
			catch (e) {
				return def;
			}
		};
		var html_parse_safe = function (text, def) {
			try {
				return (new DOMParser()).parseFromString(text, "text/html");
			}
			catch (e) {
				return def;
			}
		};
		var get_url_info = function (url) {
			var match = /^(https?):\/*((?:[\w-]+\.)*)([\w-]+\.[\w]+)((?:[\/\?\#][\w\W]*)?)/.exec(url),
				domain, remaining, m;

			if (match === null) return null;

			domain = match[3].toLowerCase();
			remaining = match[4];

			if (domain === domains.exhentai || domain === domains.ehentai) {
				m = /^\/g\/(\d+)\/([0-9a-f]+)/.exec(remaining);
				if (m !== null) {
					return {
						site: "ehentai",
						type: "gallery",
						gid: parseInt(m[1], 10),
						token: m[2],
						domain: domain
					};
				}

				m = /^\/s\/([0-9a-f]+)\/(\d+)\-(\d+)/.exec(remaining);
				if (m !== null) {
					return {
						site: "ehentai",
						type: "page",
						gid: parseInt(m[2], 10),
						page: parseInt(m[3], 10),
						page_token: m[1],
						domain: domain
					};
				}
			}
			else if (domain === domains.nhentai) {
				m = /^\/g\/(\d+)/.exec(remaining);
				if (m !== null) {
					return {
						site: "nhentai",
						type: "gallery",
						gid: parseInt(m[1], 10),
						domain: domain
					};
				}
			}
			else if (domain === domains.hitomi) {
				m = /^\/(?:galleries|reader|smalltn)\/(\d+)/.exec(remaining);
				if (m !== null) {
					return {
						site: "hitomi",
						type: "gallery",
						gid: parseInt(m[1], 10),
						domain: domain
					};
				}
			}

			return null;
		};
		var get_full_domain = function (url) {
			var m = re_full_domain.exec(url);
			return (m === null) ? "" : m[1];
		};
		var get_domain = function (url) {
			var m = re_short_domain.exec(url);
			return (m === null) ? "" : m[1].toLowerCase();
		};
		var change_url_domain = function (url, new_domain) {
			var m = re_change_domain.exec(url);
			return (m === null) ? url : m[1] + new_domain + m[3];
		};
		var title_case = function (text) {
			return text.replace(/\b\w/g, function (m) {
				return m.toUpperCase();
			});
		};
		var category = function (name) {
			var c = categories[name];
			return (c !== undefined) ? c : categories.Misc;
		};

		var get_id_from_node = function (node) {
			var a = node.getAttribute("data-hl-id"),
				i;
			return (a && (i = a.indexOf("_")) >= 0) ? [ a.substr(0, i), a.substr(i + 1) ] : null;
		};
		var get_id_from_node_full = function (node) {
			return node.getAttribute("data-hl-id") || "";
		};
		var get_info_from_node = function (node) {
			var attr = node.getAttribute("data-hl-info");
			try {
				return JSON.parse(attr);
			}
			catch (e) {}
			return null;
		};
		var get_tag_button_from_link = function (node) {
			// Assume the button is the previous (or previous-previous) sibling
			if (
				(node = node.previousSibling) !== null &&
				(node.classList || ((node = node.previousSibling) !== null && node.classList)) &&
				node.classList.contains("hl-site-tag")
			) {
				return node;
			}
			return null;
		};
		var get_link_from_tag_button = function (node) {
			// Assume the link is the next (or next-next) sibling
			if (
				(node = node.nextSibling) !== null &&
				(node.classList || ((node = node.nextSibling) !== null && node.classList)) &&
				node.classList.contains("hl-linkified-gallery")
			) {
				return node;
			}
			return null;
		};
		var get_exresults_from_exsauce = function (node) {
			var container = Post.get_post_container(node);

			if (
				container !== null &&
				(node = $(".hl-exsauce-results[data-hl-image-index='" + node.getAttribute("data-hl-image-index") + "']", container)) !== null &&
				Post.get_post_container(node) === container
			) {
				return node;
			}

			return null;
		};

		// Exports
		return {
			regex_escape: regex_escape,
			json_parse_safe: json_parse_safe,
			html_parse_safe: html_parse_safe,
			get_url_info: get_url_info,
			get_full_domain: get_full_domain,
			get_domain: get_domain,
			change_url_domain: change_url_domain,
			title_case: title_case,
			category: category,
			get_id_from_node: get_id_from_node,
			get_id_from_node_full: get_id_from_node_full,
			get_info_from_node: get_info_from_node,
			get_tag_button_from_link: get_tag_button_from_link,
			get_link_from_tag_button: get_link_from_tag_button,
			get_exresults_from_exsauce: get_exresults_from_exsauce
		};

	})();
	var Post = (function () {

		// Private
		var file_ext = function (url) {
			var m = /\.[^\.]*$/.exec(url);
			return (m === null) ? "" : m[0].toLowerCase();
		};
		var file_name = function (url) {
			url = url.split("/");
			return url[url.length - 1];
		};

		var get_op_post_files_container_tinyboard = function (node) {
			while (true) {
				if ((node = node.previousSibling) === null) return null;
				if (node.classList && node.classList.contains("files")) return node;
			}
		};

		var post_selector = {
			"4chan": ".postContainer,.post.inlined,#quote-preview",
			"foolz": "article:not(.backlink_container)",
			"fuuka": ".content>div[id],.content>table",
			"tinyboard": ".post"
		};
		var post_body_selector = {
			"4chan": "blockquote",
			"foolz": ".text",
			"fuuka": "blockquote>p",
			"tinyboard": ".body"
		};
		var body_links_selector = {
			"4chan": "a:not(.quotelink)",
			"foolz": "a:not(.backlink)",
			"fuuka": "a:not(.backlink)",
			"tinyboard": "a:not([onclick])"
		};
		var post_parent_find = {
			"4chan": function (node) {
				while ((node = node.parentNode) !== null) {
					if (node.classList.contains("postContainer")) return node;
					// 4chan-inline
					if (node.classList.contains("post") && (node.classList.contains("inlined") || node.id === "quote-preview")) return node;
				}
				return null;
			},
			"foolz": function (node) {
				while ((node = node.parentNode) !== null) {
					if (node.tagName === "ARTICLE") return node;
				}
				return null;
			},
			"fuuka": function (node) {
				while ((node = node.parentNode) !== null) {
					if (
						node.tagName === "TABLE" || // Reply
						(node.tagName === "DIV" && node.id && node.parentNode.classList.contains("content")) // OP
					) {
						return node;
					}
				}
				return null;
			},
			"tinyboard": function (node) {
				while ((node = node.parentNode) !== null) {
					if (node.classList.contains("post")) {
						return node;
					}
					else if (node.classList.contains("thread")) {
						return $(".post.op", node);
					}
				}
				return null;
			}
		};
		var get_file_info = {
			"4chan": function (post) {
				var n, ft, img, a1, url, i;

				if (
					(n = $(".file", post)) === null ||
					!belongs_to[Config.mode].call(null, n, post) ||
					(ft = $(".fileText", n)) === null ||
					(img = $("img", n)) === null ||
					(a1 = $("a", n)) === null
				) {
					return [];
				}

				url = a1.href;
				if ((i = url.indexOf("#")) >= 0) url = url.substr(0, i);

				return [{
					image: img,
					image_link: img.parentNode,
					text_link: a1,
					options: ft,
					url: url,
					type: file_ext(url),
					name: file_name(url),
					md5: img.getAttribute("data-md5") || null
				}];
			},
			"foolz": function (post) {
				var n, ft, img, a1, url, i;

				if (
					(n = $(".thread_image_box", post)) === null ||
					!belongs_to[Config.mode].call(null, n, post) ||
					(ft = $(".post_file_controls", post)) === null ||
					(img = $("img", n)) === null ||
					(a1 = $(".post_file_filename", post)) === null
				) {
					return [];
				}

				url = a1.href;
				if ((i = url.indexOf("#")) >= 0) url = url.substr(0, i);

				return [{
					image: img,
					image_link: img.parentNode,
					text_link: a1,
					options: ft,
					url: url,
					type: file_ext(url),
					name: file_name(url),
					md5: img.getAttribute("data-md5") || null
				}];
			},
			"fuuka": function (post) {
				var n, img, a1, url, i;

				if (
					(img = $("a>img.thumb", post)) === null ||
					!belongs_to[Config.mode].call(null, img, post)
				) {
					return [];
				}

				a1 = img.parentNode;
				n = a1.parentNode;
				url = a1.href;
				if ((i = url.indexOf("#")) >= 0) url = url.substr(0, i);

				return [{
					image: img,
					image_link: a1,
					text_link: null,
					options: n,
					url: url,
					type: file_ext(url),
					name: file_name(url),
					md5: img.getAttribute("data-md5") || null
				}];
			},
			"tinyboard": function (post) {
				var results = [],
					imgs, infos, img, array, ft, a1, n, url, i, ii, j;

				if (post.classList.contains("op")) {
					n = get_op_post_files_container_tinyboard(post);
					if (n === null) return results;

					imgs = $$("a>img", n);
					infos = $$(".fileinfo", n);
					ii = Math.min(imgs.length, infos.length);
				}
				else {
					imgs = $$("a>img", post);
					array = [];
					for (i = 0, ii = imgs.length; i < ii; ++i) {
						img = imgs[i];
						if (belongs_to[Config.mode].call(null, img, post)) {
							array.push(img);
						}
					}
					imgs = array;

					infos = $$(".fileinfo", post);
					ii = Math.min(imgs.length, infos.length);
				}

				for (i = 0; i < ii; ++i) {
					img = imgs[i];
					n = infos[i];

					if (
						(ft = $(".unimportant", n)) === null ||
						(a1 = $("a", n)) === null
					) {
						continue;
					}

					url = img.parentNode.href || a1.href;
					if ((j = url.indexOf("#")) >= 0) url = url.substr(0, j);

					results.push({
						image: img,
						image_link: img.parentNode,
						text_link: a1,
						options: ft,
						url: url,
						type: file_ext(url),
						name: file_name(url),
						md5: img.getAttribute("data-md5") || null
					});
				}

				return results;
			}
		};
		var belongs_to_default = function (node, post) {
			return (Module.get_post_container(node) === post);
		};
		var belongs_to_re_non_digit = /\D+/g;
		var belongs_to = {
			"4chan": function (node, post) {
				var id1 = node.id.replace(belongs_to_re_non_digit, ""),
					id2 = post.id.replace(belongs_to_re_non_digit, "");

				return (id1 && id1 === id2);
			},
			"foolz": belongs_to_default,
			"fuuka": belongs_to_default,
			"tinyboard": belongs_to_default
		};
		var create_image_meta_link_default = function (file_info, node) {
			var par = file_info.options;
			$.add(par, $.tnode(" "));
			$.add(par, node);
		};
		var create_image_meta_link = {
			"4chan": create_image_meta_link_default,
			"foolz": function (file_info, node) {
				var par = file_info.options,
					next;

				for (next = par.lastChild; next !== null; next = next.previousSibling) {
					if (next.tagName === "A" && next.hasAttribute("download")) break;
				}

				node.classList.add("btnr");
				node.classList.add("parent");
				$.before(par, next, node);
			},
			"fuuka": function (file_info, node) {
				var par = file_info.options,
					t = " [",
					i = 0,
					j = (par.tagName === "DIV" ? 1 : 2),
					next, n;

				for (next = par.firstChild; next !== null; next = next.nextSibling) {
					if (next.tagName === "BR" && ++i === j) break;
				}

				if (
					next !== null &&
					(n = next.previousSibling) !== null &&
					n.nodeType === Node.TEXT_NODE
				) {
					n.nodeValue = n.nodeValue.replace(/\]\s*$/, "]") + t;
				}
				else {
					$.before(par, next, $.tnode(t));
				}

				$.before(par, next, node);
				$.before(par, next, $.tnode("]"));
			},
			"tinyboard": create_image_meta_link_default
		};

		// Exports
		var Module = {
			get_post_container: function (node) {
				return post_parent_find[Config.mode].call(null, node);
			},
			get_text_body: function (node) {
				return $(post_body_selector[Config.mode], node);
			},
			is_post: function (node) {
				return $.test(node, post_selector[Config.mode]);
			},
			get_all_posts: function (parent) {
				return $$(post_selector[Config.mode], parent);
			},
			get_file_info: function (post) {
				return get_file_info[Config.mode].call(null, post);
			},
			get_body_links: function (post) {
				return $$(body_links_selector[Config.mode], post);
			},
			create_image_meta_link: function (file_info, node) {
				return create_image_meta_link[Config.mode].call(null, file_info, node);
			},
			get_op_post_files_container_tinyboard: get_op_post_files_container_tinyboard
		};

		return Module;

	})();
	var CreateURL = (function () {

		// Private
		var to_gallery = {
			ehentai: function (data, domain) {
				return "http://" + domain_info[domain].g_domain + "/g/" + data.gid + "/" + data.token + "/";
			},
			nhentai: function (data) {
				return "http://" + domains.nhentai + "/g/" + data.gid + "/";
			},
			hitomi: function (data) {
				return "https://" + domains.hitomi + "/galleries/" + data.gid + ".html";
			}
		};
		var to_uploader = {
			ehentai: function (data, domain) {
				return "http://" + domain_info[domain].g_domain + "/uploader/" + (data.uploader || "Unknown").replace(/\s+/g, "+");
			},
			nhentai: function () {
				return "http://" + domains.nhentai + "/";
			},
			hitomi: function () {
				return "https://" + domains.hitomi + "/";
			}
		};
		var to_category = {
			ehentai: function (data, domain) {
				return "http://" + domain_info[domain].g_domain + "/" + Helper.category(data.category).short;
			},
			nhentai: function (data) {
				return "http://" + domains.nhentai + "/category/" + data.category.toLowerCase() + "/";
			},
			hitomi: function (data) {
				return "https://" + domains.hitomi + "/type/" + data.category.toLowerCase() + "-all-1.html";
			}
		};
		var to_tag = {
			ehentai: function (tag, full_domain) {
				return "http://" + full_domain + "/tag/" + tag.replace(/\s+/g, "+");
			},
			nhentai: function (tag, full_domain) {
				return "http://" + full_domain + "/tag/" + tag.replace(/\s+/g, "-") + "/";
			},
			hitomi: function (tag, full_domain) {
				return "https://" + full_domain + "/tag/" + tag + "-all-1.html";
			}
		};
		var to_tag_ns = {
			ehentai: function (tag, namespace, full_domain) {
				return "http://" + full_domain + "/tag/" + namespace + ":" + tag.replace(/\s+/g, "+");
			},
			nhentai: function (tag, namespace, full_domain) {
				if (namespace === "tags") namespace = "tag";
				return "http://" + full_domain + "/" + namespace + "/" + tag.replace(/\s+/g, "-") + "/";
			},
			hitomi: function (tag, namespace, full_domain) {
				if (namespace === "male" || namespace === "female") {
					return "https://" + full_domain + "/tag/" + namespace + ":" + tag + "-all-1.html";
				}
				else if (namespace === "artist") {
					return "https://" + full_domain + "/artist/" + tag + "-all-1.html";
				}
				else if (namespace === "parody") {
					return "https://" + full_domain + "/series/" + tag + "-all-1.html";
				}
				else if (namespace === "language") {
					return "https://" + full_domain + "/index-" + tag + "-1.html";
				}
				else {
					return "https://" + full_domain + "/tag/" + tag + "-all-1.html";
				}
			}
		};

		// Exports
		return {
			to_gallery: function (data, domain) {
				var type = domain_info[domain].type;
				return to_gallery[type].call(null, data, domain);
			},
			to_uploader: function (data, domain) {
				var type = domain_info[domain].type;
				return to_uploader[type].call(null, data, domain);
			},
			to_category: function (data, domain) {
				var type = domain_info[domain].type;
				return to_category[type].call(null, data, domain);
			},
			to_tag: function (tag, domain_type, full_domain) {
				return to_tag[domain_type].call(null, tag, full_domain);
			},
			to_tag_ns: function (tag, namespace, domain_type, full_domain) {
				return to_tag_ns[domain_type].call(null, tag, namespace, full_domain);
			}
		};

	})();
	var HttpRequest = (function () {
		try {
			if (GM_xmlhttpRequest && typeof(GM_xmlhttpRequest) === "function") {
				return function (data) {
					Debug.log("HttpRequest:", data.method, data.url, { data: data });
					return GM_xmlhttpRequest(data);
				};
			}
		}
		catch (e) {}

		// Fallback
		return function (data) {
			Debug.log("HttpRequest:", data.method, data.url, { data: data });
			var onerror = (data && data.onerror && typeof(data.onerror) === "function") ? data.onerror : null;
			setTimeout(function () {
				if (onerror !== null) {
					onerror.call(null, {});
				}
			}, 10);
		};
	})();
	var UI = (function () {

		// Private
		var details_nodes = {},
			actions_nodes = {},
			actions_nodes_active = {},
			actions_nodes_active_count = 0,
			actions_nodes_index = 0,
			actions_close_timeout = null;

		var gallery_link_events_data = {
			link: null,
			mouse_x: 0,
			mouse_y: 0
		};
		var gallery_link_events = {
			mouseover: function (event) {
				var full_id = Helper.get_id_from_node_full(this),
					details = details_nodes[full_id],
					domain, data, id;

				if (details === undefined) {
					id = Helper.get_id_from_node(this);
					if (
						id === null ||
						(data = API.get_gallery(id[0], id[1])) === null ||
						!((domain = Helper.get_domain(this.href)) in domain_info)
					) {
						return;
					}

					details = create_details(data, domain);
					details_nodes[full_id] = details;
				}

				details.classList.remove("hl-details-hidden");

				gallery_link_events_data.link = this;
				gallery_link_events_data.mouse_x = event.clientX;
				gallery_link_events_data.mouse_y = event.clientY;

				update_details_position(details, this, event.clientX, event.clientY);
			},
			mouseout: function () {
				var full_id = Helper.get_id_from_node_full(this),
					details = details_nodes[full_id],
					domain, data, id;

				if (details === undefined) {
					id = Helper.get_id_from_node(this);
					if (
						id === null ||
						(data = API.get_gallery(id[0], id[1])) === null ||
						!((domain = Helper.get_domain(this.href)) in domain_info)
					) {
						return;
					}

					details = create_details(data, domain);
					details_nodes[full_id] = details;
				}

				details.classList.add("hl-details-hidden");

				gallery_link_events_data.link = null;
			},
			mousemove: function (event) {
				var details = details_nodes[Helper.get_id_from_node_full(this)];

				if (details === undefined) return;

				gallery_link_events_data.mouse_x = event.clientX;
				gallery_link_events_data.mouse_y = event.clientY;

				update_details_position(details, this, event.clientX, event.clientY);
			}
		};
		var gallery_toggle_actions = function (event) {
			if ($.is_left_mouse(event) && config.actions.enabled) {
				event.preventDefault();

				var index = this.getAttribute("hl-actions-index"),
					actions, tag_bg, data, link, id;

				if (!index) {
					index = "" + actions_nodes_index;
					++actions_nodes_index;
					this.setAttribute("hl-actions-index", index);
				}

				if (this.classList.toggle("hl-site-tag-active")) {
					// Create bg
					tag_bg = $(".hl-site-tag-bg", this);
					if (tag_bg === null) tag_bg = create_tag_bg(this);

					// Show
					actions = actions_nodes[index];
					if (actions !== undefined) {
						actions.classList.remove("hl-actions-hidden");
						Popup.hovering(actions);
						activate_actions(actions, index);
					}
					else {
						// Create
						if (
							(link = Helper.get_link_from_tag_button(this)) !== null &&
							(id = Helper.get_id_from_node(link)) !== null &&
							(data = API.get_gallery(id[0], id[1])) !== null
						) {
							actions = create_actions(data, link, index);
							actions_nodes[index] = actions;
							activate_actions(actions, index);
						}
						else {
							return;
						}
					}

					// Position
					update_actions_position(actions, this, tag_bg, d.documentElement.getBoundingClientRect());
				}
				else {
					// Hide
					actions = actions_nodes[index];
					if (actions !== undefined) {
						close_actions(actions, index);
					}
				}
			}
		};
		var gallery_fetch_event = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();

				var link, info;

				Linkifier.change_link_events(this, null);

				if (
					(link = Helper.get_link_from_tag_button(this)) !== null &&
					(info = Helper.get_info_from_node(link)) !== null
				) {
					Linkifier.load_link(link, info);
				}
			}
		};
		var gallery_error_event = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();
				return false;
			}
		};

		var create_details = function (data, domain) {
			var g_domain = domain_info[domain].g_domain,
				category = Helper.category(data.category),
				theme = Theme.classes,
				file_size = (data.total_size / 1024 / 1024).toFixed(2),
				content, n1, n2, n3;

			// Body
			content = $.node("div", "hl-details hl-hover-shadow" + theme);
			content.setAttribute("data-hl-id", data.type + "_" + data.gid);
			Theme.bg(content);

			// Image
			$.add(content, n1 = $.node("div", "hl-details-thumbnail" + theme));
			API.get_thumbnail(data, $.bind(function (err, url) {
				if (err === null) {
					this.style.backgroundImage = "url('" + url + "')";
				}
			}, n1));

			// Sidebar
			$.add(content, n1 = $.node("div", "hl-details-side-panel"));

			$.add(n1, n2 = $.node("div", "hl-button hl-button-eh hl-button-" + category.short + theme));
			$.add(n2, $.node("div", "hl-noise", category.name));

			if (data.rating >= 0) {
				$.add(n1, n2 = $.node("div", "hl-details-side-box hl-details-side-box-rating" + theme));
				$.add(n2, n3 = $.node("div", "hl-details-rating hl-stars-container"));
				$.add(n3, create_rating_stars(data.rating));
				$.add(n2, $.node("div", "hl-details-rating-text", "(Avg. " + data.rating.toFixed(2) + ")"));
			}

			$.add(n1, n2 = $.node("div", "hl-details-side-box hl-details-side-box-rating" + theme));
			$.add(n2, $.node("div", "hl-details-file-count", data.file_count + " image" + (data.file_count === 1 ? "" : "s")));
			if (data.total_size >= 0) {
				$.add(n2, $.node("div", "hl-details-file-size", "(" + file_size + " MB)"));
			}

			if (data.torrent_count >= 0) {
				$.add(n1, n2 = $.node("div", "hl-details-side-box hl-details-side-box-torrents" + theme));
				$.add(n2, n3 = $.node("div", "hl-details-side-box-inner"));
				$.add(n3, $.node("strong", "", "Torrents:"));
				$.add(n3, $.node("span", "", " " + data.torrent_count));
			}

			if (data.removed === true) {
				$.add(n1, n2 = $.node("div", "hl-details-side-box hl-details-side-box-visible" + theme));
				$.add(n2, n3 = $.node("div", "hl-details-side-box-inner"));
				$.add(n3, $.node("strong", "hl-details-side-box-error" + theme, "Removed"));
			}
			else if (data.visible !== null) {
				$.add(n1, n2 = $.node("div", "hl-details-side-box hl-details-side-box-visible" + theme));
				$.add(n2, n3 = $.node("div", "hl-details-side-box-inner"));
				$.add(n3, $.node("strong", "", "Visible:"));
				$.add(n3, $.node("span", "", data.visible ? " Yes" : " No"));
			}

			// Title
			$.add(content, n1 = $.node("div", "hl-details-title-container" + theme));
			$.add(n1, n2 = $.link("#", "hl-details-title" + theme, data.title));
			Filter.highlight("title", n2, data, Filter.None);
			if (data.title_jpn !== null) {
				$.add(n1, n2 = $.node("div", "hl-details-title-jp" + theme, data.title_jpn));
				Filter.highlight("title", n2, data, Filter.None);
			}

			// Upload info
			$.add(content, n1 = $.node("div", "hl-details-upload-info" + theme));
			$.add(n1, $.tnode("Uploaded by"));
			$.add(n1, n2 = $.node("strong", "hl-details-uploader", data.uploader));
			Filter.highlight("uploader", n2, data, Filter.None);
			$.add(n1, $.tnode("on"));
			$.add(n1, $.node("strong", "hl-details-upload-date", format_date(new Date(data.upload_date))));

			// Tags
			$.add(content, n1 = $.node("div", "hl-details-tag-block" + theme));
			$.add(n1, $.node("strong", "hl-details-tag-block-label", "Tags:"));
			$.add(n1, n2 = $.node("span", "hl-details-tags hl-tags"));
			n2.setAttribute("data-hl-id", data.type + "_" + data.gid);
			$.add(n2, create_tags_best(g_domain, data));

			// End
			$.add(content, $.node("div", "hl-details-clear"));

			// Full info
			if (config.details.extended_info && data.type === "ehentai" && !data.full) {
				API.get_ehentai_gallery_full(g_domain, data, function (err, data) {
					if (err === null) {
						update_full(data);
					}
					else {
						Debug.log("Error requesting full information: " + err);
					}
				});
			}

			// Fonts
			Main.insert_custom_fonts();
			Popup.hovering(content);
			return content;
		};
		var create_actions = function (data, link, index) {
			var theme = Theme.classes,
				domain = Helper.get_domain(link.href),
				g_domain = domain_info[domain].g_domain,
				gid = data.gid,
				token = data.token,
				type = data.type,
				actions = $.node("div", "hl-actions hl-hover-shadow" + theme),
				n1, n2, n3;

			$.add(actions, n1 = $.node("div", "hl-actions-inner" + theme));
			$.add(n1, n2 = $.node("div", "hl-actions-table" + theme));

			var gen_entry = function (container, label, url, text) {
				var n1, n2, n3;
				$.add(container, n1 = $.node("div", "hl-actions-table-row" + theme));
				$.add(n1, n2 = $.node("div", "hl-actions-table-cell" + theme));
				if (label !== null) $.add(n2, $.node("div", "hl-actions-table-header", label));
				$.add(n1, n2 = $.node("div", "hl-actions-table-cell" + theme));
				$.add(n2, n3 = $.link(url, "hl-actions-option" + theme, text));
				$.on(n3, "click", $.bind(on_actions_link_click, n3, actions, index));
				return n3;
			};
			var gen_sep = function (container) {
				var n1, n2;
				$.add(container, n1 = $.node("div", "hl-actions-table-row" + theme));
				$.add(n1, n2 = $.node("div", "hl-actions-table-cell" + theme));
				$.add(n2, $.node("div", "hl-actions-table-sep"));
			};

			if (type === "ehentai") {
				gen_entry(n2, "View on:", CreateURL.to_gallery(data, domains.ehentai), "E-Hentai");
				gen_entry(n2, null, CreateURL.to_gallery(data, domains.exhentai), "ExHentai");

				gen_sep(n2);

				n3 = gen_entry(n2, "Uploader:", CreateURL.to_uploader(data, domain), data.uploader);
				n3.classList.add("hl-actions-uploader");
				Filter.highlight("uploader", n3, data, Filter.None);

				gen_sep(n2);

				gen_entry(n2, "Download:", "http://" + g_domain + "/gallerytorrents.php?gid=" + gid + "&t=" + token, "Torrent (" + data.torrent_count + ")");
				gen_entry(n2, null, "http://" + g_domain + "/archiver.php?gid=" + gid + "&t=" + token + "&or=" + data.archiver_key, "Archiver");
				n3 = gen_entry(n2, null, "http://" + g_domain + "/hathdler.php?gid=" + gid + "&t=" + token, "via H@H");
				n3.removeAttribute("target");

				gen_sep(n2);

				gen_entry(n2, "Other:", "http://" + g_domain + "/gallerypopups.php?gid=" + gid + "&t=" + token + "&act=addfav", "Favorite");
				gen_entry(n2, null, "http://" + domains.gehentai + "/stats.php?gid=" + gid + "&t=" + token, "Stats");
			}
			else if (type === "nhentai") {
				gen_entry(n2, "View on:", CreateURL.to_gallery(data, domain), "nhentai.net");
			}
			else if (type === "hitomi") {
				gen_entry(n2, "View on:", CreateURL.to_gallery(data, domain), "hitomi.la");
			}

			// Prepare
			$.on(actions, "click", on_actions_click);
			Theme.bg(actions);
			Popup.hovering(actions);

			// Done
			return actions;
		};
		var pad = function (n, sep) {
			return (n < 10 ? "0" : "") + n + sep;
		};
		var create_tags = function (site, data) {
			var tagfrag = d.createDocumentFragment(),
				domain = data.type,
				tags = data.tags,
				theme = Theme.classes,
				last = null,
				tag, link, i, ii;

			for (i = 0, ii = tags.length; i < ii; ++i) {
				tag = $.node("span", "hl-tag-block" + theme);
				link = $.link(CreateURL.to_tag(tags[i], domain, site), "hl-tag", tags[i]);

				Filter.highlight("tags", link, data, Filter.None);

				$.add(tag, link);
				$.add(tag, last = $.tnode(","));
				$.add(tagfrag, tag);
			}
			if (last !== null) $.remove(last);

			return tagfrag;
		};
		var create_tags_full = function (site, data) {
			var tagfrag = d.createDocumentFragment(),
				domain = data.type,
				tags_ns = data.tags_ns,
				theme = Theme.classes,
				tag = null,
				namespace, namespace_style, tags, link, tf, i, ii;

			for (namespace in tags_ns) {
				tags = tags_ns[namespace];
				ii = tags.length;
				if (ii === 0) continue;
				namespace_style = theme + " hl-tag-namespace-" + namespace.replace(/\s+/g, "-");

				tag = $.node("span", "hl-tag-namespace-block" + namespace_style);
				link = $.node("span", "hl-tag-namespace", namespace);
				tf = $.node("span", "hl-tag-namespace-first");
				$.add(tag, link);
				$.add(tag, $.tnode(":"));
				$.add(tf, tag);
				$.add(tagfrag, tf);

				for (i = 0; i < ii; ++i) {
					tag = $.node("span", "hl-tag-block" + namespace_style);
					link = $.link(CreateURL.to_tag_ns(tags[i], namespace, domain, site), "hl-tag", tags[i]);

					Filter.highlight("tags", link, data, Filter.None);

					$.add(tag, link);
					if (i < ii - 1) {
						$.add(tag, $.tnode(","));
					}
					else {
						tag.classList.add("hl-tag-block-last-of-namespace");
					}
					$.add(tf, tag);
					tf = tagfrag;
				}
			}

			if (tag !== null) {
				tag.classList.add("hl-tag-block-last");
			}

			return tagfrag;
		};
		var create_tags_best = function (site, data) {
			if (data.full) {
				for (var k in data.tags_ns) {
					return create_tags_full(site, data);
				}
			}
			return create_tags(site, data);
		};
		var update_full = function (data) {
			var domain = domains.exhentai,
				full_id = data.type + "_" + data.gid,
				g_domain, tagfrag, nodes, link, tags, last, i, ii, j, jj, n, f;

			if (data.removed === true) {
				if (
					(n = details_nodes[data.type + "_" + data.gid]) !== null &&
					(link = $(".hl-details-side-box-visible>.hl-details-side-box-inner", n)) !== null
				) {
					link.innerHTML = "";
					n = $.node("strong", "hl-details-side-box-error" + Theme.classes, "Removed");
					link.appendChild(n);
				}
			}

			nodes = $$(".hl-tags[data-hl-id='" + full_id + "']");
			ii = nodes.length;

			if (ii === 0 || Object.keys(data.tags_ns).length === 0) return;

			tagfrag = create_tags_full(domain, data);

			i = 0;
			while (true) {
				n = nodes[i];
				f = tagfrag;
				last = (++i >= ii);

				if (
					(link = $("a[href]", n)) !== null &&
					Helper.get_domain(link.href) !== domain
				) {
					g_domain = Helper.get_full_domain(link.href);
					f = last ? tagfrag : tagfrag.cloneNode(true);
					tags = $$("a[href]", f);
					for (j = 0, jj = tags.length; j < jj; ++j) {
						tags[j].href = Helper.change_url_domain(tags[j].href, g_domain);
					}
				}
				else if (!last) {
					f = tagfrag.cloneNode(true);
				}

				n.innerHTML = "";
				$.add(n, f);

				if (last) break;
			}

			// Reposition any open details
			if (
				(n = details_nodes[full_id]) !== undefined &&
				(link = gallery_link_events_data.link) !== null &&
				Helper.get_id_from_node_full(link) === full_id
			) {
				update_details_position(n, link, gallery_link_events_data.mouse_x, gallery_link_events_data.mouse_y);
			}
		};
		var update_details_position = function (details, link, mouse_x, mouse_y) {
			var w = window,
				de = d.documentElement,
				win_width = (de.clientWidth || w.innerWidth || 0),
				win_height = (de.clientHeight || w.innerHeight || 0),
				rect = details.getBoundingClientRect(),
				link_rect = link.getBoundingClientRect(),
				is_low = (link_rect.top + link_rect.height / 2 >= win_height / 2), // (mouse_y >= win_height / 2)
				offset = 20;

			mouse_x += rect.width * (config.details.hover_position || 0);
			mouse_x = Math.max(1, Math.min(win_width - rect.width - 1, mouse_x));
			mouse_y += is_low ? -(rect.height + offset) : offset;

			details.style.left = mouse_x + "px";
			details.style.top = mouse_y + "px";
		};
		var close_actions = function (actions, index) {
			var ns = $$(".hl-site-tag.hl-site-tag-active[hl-actions-index='" + index + "']"),
				i, ii;

			for (i = 0, ii = ns.length; i < ii; ++i) {
				ns[i].classList.remove("hl-site-tag-active");
			}

			actions.classList.add("hl-actions-hidden");
			deactivate_actions(index);
		};
		var close_all_actions = function () {
			for (var index in actions_nodes_active) {
				close_actions(actions_nodes_active[index], index);
			}
		};
		var update_actions_position = function (actions, tag, tag_bg, de_rect, xpos, ypos) {
			// Position
			var rect = tag_bg.getBoundingClientRect(),
				below, right, x, y;

			// Positioning
			if (xpos === "right") {
				right = true;
			}
			else if (xpos === "left") {
				right = false;
			}
			else {
				right = (rect.left + rect.width / 2 <= (d.documentElement.clientWidth || window.innerWidth || 0) / 2);
				xpos = right ? "right" : "left";
			}

			if (ypos === "below") {
				below = true;
			}
			else if (ypos === "above") {
				below = false;
			}
			else {
				below = (rect.top + rect.height / 2 <= (d.documentElement.clientHeight || window.innerHeight || 0) / 2);
				ypos = below ? "below" : "above";
			}

			// Coordinates
			actions.style.maxWidth = "";
			if (right) {
				x = rect.left - de_rect.left;
			}
			else {
				actions.style.left = "0";
				actions.style.maxWidth = rect.right + "px";
				x = rect.right - actions.getBoundingClientRect().width - de_rect.left;
			}

			actions.style.left = x + "px";
			tag.setAttribute("data-hl-actions-hpos", xpos);
			actions.setAttribute("data-hl-actions-hpos", xpos);

			if (below) {
				y = rect.bottom - de_rect.top - 0.0625;
			}
			else {
				y = rect.top - actions.getBoundingClientRect().height - de_rect.top + 0.0625;
			}

			actions.style.top = y + "px";
			tag.setAttribute("data-hl-actions-vpos", ypos);
			actions.setAttribute("data-hl-actions-vpos", ypos);
		};
		var update_active_actions_position = function () {
			var de_rect = d.documentElement.getBoundingClientRect(),
				index, actions, tag, tag_bg, xpos, ypos;

			for (index in actions_nodes_active) {
				actions = actions_nodes_active[index];
				if (
					(tag = $(".hl-site-tag.hl-site-tag-active[hl-actions-index='" + index + "']")) !== null &&
					(tag_bg = $(".hl-site-tag-bg", tag)) !== null
				) {
					xpos = actions.getAttribute("data-hl-actions-hpos");
					ypos = actions.getAttribute("data-hl-actions-vpos");
					update_actions_position(actions, tag, tag_bg, de_rect, xpos, ypos);
				}
			}
		};

		var activate_actions = function (node, index) {
			if (config.actions.close_on_click && actions_nodes_active_count !== 0) {
				close_all_actions();
			}

			actions_nodes_active[index] = node;

			if (actions_close_timeout !== null) clearTimeout(actions_close_timeout);
			actions_close_timeout = setTimeout(function () { actions_close_timeout = null; }, 1);

			if (++actions_nodes_active_count === 1) {
				$.on(window, "resize", on_window_resize);
				$.on(d.documentElement, "click", on_document_click);
			}
		};
		var deactivate_actions = function (index) {
			if (actions_nodes_active[index] === undefined) return;

			delete actions_nodes_active[index];
			if (--actions_nodes_active_count === 0) {
				$.off(window, "resize", on_window_resize);
				$.off(d.documentElement, "click", on_document_click);
				if (actions_close_timeout !== null) {
					clearTimeout(actions_close_timeout);
					actions_close_timeout = null;
				}
			}
		};
		var on_window_resize = function () {
			update_active_actions_position();
		};
		var on_document_click = function (event) {
			if (actions_close_timeout === null) {
				if (config.actions.close_on_click) {
					if ($.is_left_mouse(event)) {
						close_all_actions();
					}
				}
				else {
					// Re-position
					setTimeout(update_active_actions_position, 1);
				}
			}
		};
		var on_actions_click = function (event) {
			if ($.is_left_mouse(event)) {
				event.stopPropagation();
			}
		};
		var on_actions_link_click = function (actions, index, event) {
			if ($.is_left_mouse(event)) {
				event.stopPropagation();

				if (config.actions.close_on_click) {
					close_actions(actions, index);
				}
			}
		};
		var create_tag_bg = function (parent) {
			var tag_bg = $.node("div", "hl-site-tag-bg" + Theme.classes),
				outline = $.node("div", "hl-site-tag-bg-shadow hl-hover-shadow" + Theme.classes),
				inner = $.node("div", "hl-site-tag-bg-inner" + Theme.classes);

			Theme.bg(inner);

			$.add(tag_bg, inner);

			$.before(parent, parent.firstChild, tag_bg);
			$.before(parent, parent.firstChild, outline);

			return tag_bg;
		};

		// Public
		var create_rating_stars = function (rating) {
			var frag = d.createDocumentFragment(),
				star, tmp, i;

			rating = Math.round(rating * 2);

			for (i = 0; i < 5; ) {
				tmp = $.clamp(rating - (i * 2), 0, 2);
				star = (tmp === 2 ? "full" : (tmp === 1 ? "half" : "none"));
				++i;
				$.add(frag, $.node("div", "hl-star hl-star-" + i + " hl-star-" + star));
			}

			return frag;
		};
		var button = function (url, domain) {
			var button = $.link(url, "hl-site-tag" + Theme.classes),
				text = $.node("span", "hl-site-tag-text", button_text(domain));
			$.add(button, text);
			return button;
		};
		var button_get_inner = function (button) {
			return ((button = button.lastChild) !== null && button.tagName === "SPAN") ? button : null;
		};
		var update_button_text = function (button, domain) {
			if ((button = button_get_inner(button)) !== null) {
				button.textContent = button_text(domain);
			}
		};
		var mark_button_text = function (button, text) {
			if ((button = button_get_inner(button)) !== null) {
				button.textContent = button.textContent.replace(/\]\s*$/, text + "]");
			}
		};
		var button_text = function (domain) {
			var d = domain_info[domain];
			return (d !== undefined ? "[" + d.tag + "]" : "[?]");
		};
		var format_date = function (d) {
			return d.getUTCFullYear() + "-" +
				pad(d.getUTCMonth() + 1, "-") +
				pad(d.getUTCDate(), " ") +
				pad(d.getUTCHours(), ":") +
				pad(d.getUTCMinutes(), "");
		};

		var cleanup_post = function (post) {
			var nodes, n, i, ii;
			nodes = $$(".hl-exsauce-results:not(.hl-exsauce-results-hidden)", post);
			for (i = 0, ii = nodes.length; i < ii; ++i) {
				nodes[i].classList.add("hl-exsauce-results-hidden");
			}
			nodes = $$(".hl-actions:not(.hl-actions-hidden)", post);
			for (i = 0, ii = nodes.length; i < ii; ++i) {
				nodes[i].classList.add("hl-actions-hidden");
			}
			nodes = $$(".hl-site-tag[hl-actions-index]", post);
			for (i = 0, ii = nodes.length; i < ii; ++i) {
				n = nodes[i];
				n.classList.remove("hl-site-tag-active");
				n.removeAttribute("hl-actions-index");
			}
		};
		var cleanup_post_removed = function (post) {
			var nodes, index, n, i, ii;
			nodes = $$(".hl-site-tag[hl-actions-index]", post);
			for (i = 0, ii = nodes.length; i < ii; ++i) {
				index = nodes[i].getAttribute("hl-actions-index") || "";
				n = actions_nodes[index];
				if (n !== undefined) {
					if (n.parentNode !== null) $.remove(n);
					delete actions_nodes[index];
					deactivate_actions(index);
				}
			}
		};

		var init = function () {
			Linkifier.register_link_events({
				gallery_link: gallery_link_events,
				gallery_toggle_actions: gallery_toggle_actions,
				gallery_fetch: gallery_fetch_event,
				gallery_error: gallery_error_event
			});
		};

		// Exports
		return {
			create_rating_stars: create_rating_stars,
			button: button,
			button_get_inner: button_get_inner,
			update_button_text: update_button_text,
			mark_button_text: mark_button_text,
			button_text: button_text,
			format_date: format_date,
			cleanup_post: cleanup_post,
			cleanup_post_removed: cleanup_post_removed,
			init: init
		};

	})();
	var API = (function () {

		// Caching
		var cache_prefix = "hlinks-cache-",
			cache_storage = window.localStorage,
			cache_objects = {
				md5_to_hash: {},
				url_to_hash: {},
				lookup: {},
				errors: {}
			},
			ttl_1_hour = 60 * 60 * 1000,
			ttl_1_day = 24 * ttl_1_hour,
			ttl_1_year = 365 * ttl_1_day;

		var cache_set = function (key, data, ttl) {
			cache_storage.setItem(cache_prefix + key, JSON.stringify({
				expires: Date.now() + ttl,
				data: data
			}));
		};
		var cache_get = function (key) {
			var json = Helper.json_parse_safe(cache_storage.getItem(cache_prefix + key), null);

			if (
				json !== null &&
				typeof(json) === "object" &&
				Date.now() < json.expires &&
				typeof(json.data) === "object"
			) {
				return json.data;
			}

			cache_storage.removeItem(key);
			return null;
		};
		var cache_set_object = function (object_name) {
			cache_storage.setItem(cache_prefix + object_name, JSON.stringify({
				expires: null,
				data: cache_objects[object_name]
			}));
		};
		var cache_get_object = function (object_name) {
			var json = Helper.json_parse_safe(cache_storage.getItem(cache_prefix + object_name), null),
				obj, target;

			if (
				json !== null &&
				typeof(json) === "object" &&
				(obj = json.data) !== null &&
				typeof(obj) === "object"
			) {
				target = cache_objects[object_name];
				return cache_merge_objects(target, obj);
			}

			cache_storage.removeItem(object_name);
			return false;
		};
		var cache_merge_objects = function (dest, obj) {
			var now = Date.now(),
				update = false,
				entry, k;

			for (k in obj) {
				entry = obj[k];
				if (now < entry.expires) {
					dest[k] = entry;
				}
				else {
					update = true;
				}
			}

			return update;
		};
		var cache_cleanup = function () {
			var storage = cache_storage,
				re_matcher = new RegExp("^" + Helper.regex_escape(cache_prefix) + "(([en]hentai|hitomi)_gallery)-([^-]+)"),
				removes = [],
				time = Date.now(),
				count = 0,
				key, json, m, i, ii;

			for (i = 0, ii = storage.length; i < ii; ++i) {
				key = storage.key(i);
				if ((m = re_matcher.exec(key)) !== null) {
					json = Helper.json_parse_safe(storage.getItem(key), null);
					if (json === null || typeof(json) !== "object" || !(time < json.expires)) { // jshint ignore:line
						removes.push(key);
					}
				}
			}

			for (i = 0, ii = removes.length; i < ii; ++i) {
				storage.removeItem(removes[i]);
			}
			count += ii;

			return count;
		};
		var cache_clear = function () {
			var storage_types = [ window.localStorage, window.sessionStorage ],
				re_matcher = new RegExp("^" + Helper.regex_escape(cache_prefix)),
				removes = [],
				count = 0,
				storage, key, m, i, ii, j, jj;

			for (i = 0, ii = storage_types.length; i < ii; ++i) {
				storage = storage_types[i];

				for (j = 0, jj = storage.length; j < jj; ++j) {
					key = storage.key(j);
					if ((m = re_matcher.exec(key)) !== null) {
						removes.push(key);
					}
				}

				for (j = 0, jj = removes.length; j < jj; ++j) {
					storage.removeItem(removes[j]);
				}
				count += jj;
			}

			return count;
		};
		var cache_init = function () {
			// Cache mode
			if (config.debug.cache_mode === "none") {
				cache_storage = (function () {
					var data = {};

					var fn = {
						length: 0,
						key: function (index) {
							return Object.keys(data)[index];
						},
						getItem: function (key) {
							if (Object.prototype.hasOwnProperty.call(data, key)) {
								return data[key];
							}
							return null;
						},
						setItem: function (key, value) {
							if (!Object.prototype.hasOwnProperty.call(data, key)) {
								++fn.length;
							}
							data[key] = value;
						},
						removeItem: function (key) {
							if (Object.prototype.hasOwnProperty.call(data, key)) {
								delete data[key];
								--fn.length;
							}
						},
						clear: function () {
							data = {};
							fn.length = 0;
						}
					};
					return fn;
				})();
			}
			else if (config.debug.cache_mode === "session") {
				cache_storage = window.sessionStorage;
			}

			// Clean
			cache_cleanup();

			// Load
			var k;
			for (k in cache_objects) {
				if (cache_get_object(k)) {
					cache_set_object(k);
				}
			}
		};



		// Databasing
		var saved_gallery_data = {
				ehentai: {},
				nhentai: {},
				hitomi: {}
			};

		var saved_gallery_namespace_exists = function (namespace) {
			return (namespace in saved_gallery_data);
		};
		var get_saved_gallery = function (namespace, gid) {
			var db = saved_gallery_data[namespace],
				data = db[gid];

			if (data !== undefined) return data;

			data = cache_get(namespace + "_gallery-" + gid);
			if (data !== null) {
				db[data.gid] = data;
				return data;
			}

			return null;
		};
		var set_saved_gallery = function (data) {
			var namespace = data.type;
			saved_gallery_data[namespace][data.gid] = data;
			cache_set(namespace + "_gallery-" + data.gid, data, ttl_1_hour * (data.upload_date >= Date.now() - ttl_1_day ? 1 : 12));
		};
		var set_saved_error = function (id_list, error, cache) {
			var id = id_list.join("-");
			cache_objects.errors[id] = {
				expires: (cache ? Date.now() + ttl_1_hour * 12 : 0),
				data: error
			};

			if (cache) {
				cache_set_object("errors");
			}
		};
		var get_saved_error = function (id_list) {
			var id = id_list.join("-"),
				value = cache_objects.errors[id];

			return (value !== undefined) ? value.data : null;
		};

		var hash_get_sha1_from_md5 = function (md5) {
			var value = cache_objects.md5_to_hash[md5];
			return (value !== undefined) ? value.data : null;
		};
		var hash_get_sha1_from_url = function (url) {
			var value = cache_objects.url_to_hash[url];
			return (value !== undefined) ? value.data : null;
		};
		var hash_set_md5_to_sha1 = function (md5, sha1) {
			cache_objects.md5_to_hash[md5] = {
				expires: Date.now() + ttl_1_year,
				data: sha1
			};

			cache_set_object("md5_to_hash");
		};
		var hash_set_url_to_sha1 = function (url, sha1) {
			cache_objects.url_to_hash[url] = {
				expires: Date.now() + ttl_1_day,
				data: sha1
			};

			cache_set_object("url_to_hash");
		};

		var lookup_get_results = function (hash) {
			var value = cache_objects.lookup[hash];
			return (value !== undefined) ? value.data : null;
		};
		var lookup_set_results = function (data) {
			cache_objects.lookup[data.hash] = {
				expires: Date.now() + ttl_1_day,
				data: data
			};

			cache_set_object("lookup");
		};



		// Private
		var temp_div = $.node_simple("div"),
			re_protocol = /^https?\:/i,
			saved_thumbnails = {
				ehentai: {},
				nhentai: {},
				hitomi: {}
			},
			nhentai_tag_namespaces = {
				parodies: "parody",
				characters: "character",
				artists: "artist",
				groups: "group"
			};

		var Flags = {
			None: 0x0,
			ThumbnailNoLeech: 0x1
		};

		var create_empty_gallery_info = function () {
			return {
				gid: 0,
				token: null,
				type: "",
				title: "",
				title_jpn: null,
				uploader: "",
				category: "",
				thumbnail: null,

				flags: 0,
				upload_date: 0,
				file_count: 0,
				total_size: -1,
				favorites: -1,
				rating: -1,
				torrent_count: -1,

				full: false,
				visible: null,
				removed: null,
				archiver_key: null,

				tags: null,
				tags_ns: null
			};
		};
		var uint8_array_to_url = function (data, mime) {
			try {
				var blob = new Blob([ data ], { type: mime });
				return window.URL.createObjectURL(blob) || null;
			}
			catch (e) {}
			return null;
		};
		var header_string_parse = function (header_str) {
			var lines = header_str.split("\r\n"),
				re_line = /^([^:]*):\s(.*)$/i,
				headers = {},
				i, m;

			for (i = 0; i < lines.length; ++i) {
				if ((m = re_line.exec(lines[i]))) {
					headers[m[1].toLowerCase()] = m[2];
				}
			}

			return headers;
		};

		var ehentai_simple_string = function (value, default_value) {
			return (typeof(value) !== "string" || value.length === 0) ? default_value : value;
		};
		var ehentai_normalize_string = function (value, default_value) {
			if (typeof(value) !== "string" || value.length === 0) {
				return default_value;
			}
			temp_div.innerHTML = value;
			value = temp_div.textContent;
			temp_div.textContent = "";
			return value;
		};
		var ehentai_normalize_info = function (info) {
			if (info.error !== undefined) {
				return { error: info.error };
			}

			var data = create_empty_gallery_info(),
				t;

			data.gid = parseInt(info.gid, 10) || 0;
			data.token = ehentai_simple_string(info.token, null);
			data.type = "ehentai";
			data.archiver_key = ehentai_simple_string(info.archiver_key, null);
			data.title = ehentai_normalize_string(info.title, "");
			data.title_jpn = ehentai_normalize_string(info.title_jpn, null);
			data.uploader = ehentai_normalize_string(info.uploader, null);
			data.category = ehentai_simple_string(info.category, "");
			data.thumbnail = ehentai_simple_string(info.thumb, null);
			data.upload_date = (parseInt(info.posted, 10) || 0) * 1000;
			data.file_count = parseInt(info.filecount, 10) || 0;
			data.total_size = parseInt(info.filesize, 10) || 0;
			data.rating = parseFloat(info.rating) || 0.0;
			data.torrent_count = parseInt(info.torrentcount, 10) || 0;
			data.visible = !info.expunged;
			t = info.tags;
			data.tags = Array.isArray(t) ? t : [];

			return data;
		};
		var ehentai_parse_info = function (html, data) {
			// Tags
			var updated_tag_count = 0,
				tags, tags_array, pattern, par, tds, namespace, ns, i, ii, j, jj, m, n, t;

			if (
				(n = $("title", html)) !== null &&
				/^\s*Gallery\s+Not\s+Available/i.test(n.textContent) &&
				$("#continue", html) !== null
			) {
				data.removed = true;
				data.tags_ns = {};
			}
			else {
				tags = {};
				tags_array = [];
				pattern = /(.+):/;

				data.removed = false;
				data.tags_ns = tags;
				data.tags = tags_array;

				par = $$("#taglist tr", html);
				for (i = 0, ii = par.length; i < ii; ++i) {
					// Class
					tds = $$("td", par[i]);
					jj = tds.length;
					if (jj === 0) continue;

					// Namespace
					namespace = ((m = pattern.exec(tds[0].textContent)) ? m[1].trim() : "");
					if (!(namespace in tags)) {
						ns = [];
						tags[namespace] = ns;
					}
					else {
						ns = tags[namespace];
					}

					// Tags
					tds = $$("div", tds[jj - 1]);
					for (j = 0, jj = tds.length; j < jj; ++j) {
						// Create tag
						if ((n = $("a", tds[j])) !== null) {
							// Add tag
							t = n.textContent.trim();
							ns.push(t);
							tags_array.push(t);
						}
					}

					// Remove if empty
					if (ns.length === 0) {
						delete tags[namespace];
					}
					else {
						++updated_tag_count;
					}
				}
			}

			// Done
			data.full = true;
			return data;
		};
		var nhentai_normalize_category = function (category) {
			return Helper.title_case(category);
		};
		var nhentai_normalize_tag_namespace = function (namespace) {
			return nhentai_tag_namespaces[namespace] || namespace;
		};
		var nhentai_parse_info = function (html) {
			var info = $("#info", html),
				data, nodes, tags, tag_ns, tag_ns_list, t, m, n, i, ii, j, jj;

			if (info === null) {
				return { error: "Could not find info" };
			}

			// Create data
			data = create_empty_gallery_info();
			data.type = "nhentai";
			data.uploader = "nhentai";
			data.full = true;
			data.tags = [];
			data.tags_ns = {};

			// Image/gid
			if ((n = $("#cover>a", html)) !== null) {
				m = /\/g\/(\d+)/.exec(n.getAttribute("href") || "");
				if (m !== null) {
					data.gid = parseInt(m[1], 10);
				}

				if ((n = $("img", n)) !== null) {
					data.thumbnail = n.getAttribute("src") || null;
					if (data.thumbnail !== null && !re_protocol.test(data.thumbnail)) {
						data.thumbnail = "http:" + data.thumbnail;
					}
				}
			}

			// Image count
			data.file_count = $$("#thumbnail-container>.thumb-container", html).length;

			// Titles
			if ((n = $("h1", info)) !== null) {
				data.title = n.textContent.trim();
			}
			if ((n = $("h2", info)) !== null) {
				data.title_jpn = n.textContent.trim();
			}

			// Tags
			if ((nodes = $$(".field-name", info)).length > 0) {
				for (i = 0, ii = nodes.length; i < ii; ++i) {
					tag_ns = nhentai_normalize_tag_namespace((
						(n = nodes[i].firstChild) !== null &&
						n.nodeType === Node.TEXT_NODE
					) ? n.nodeValue.trim().replace(/:/, "").toLowerCase() : "");

					tags = $$(".tag", nodes[i]);

					if (tag_ns === "category") {
						if (
							tags.length > 0 &&
							(n = tags[0].firstChild) !== null &&
							n.nodeType === Node.TEXT_NODE
						) {
							data.category = nhentai_normalize_category(n.nodeValue.trim());
						}
						tags = [];
					}

					if (tags.length > 0) {
						if (tag_ns in data.tags_ns) {
							tag_ns_list = data.tags_ns[tag_ns];
						}
						else {
							tag_ns_list = [];
							data.tags_ns[tag_ns] = tag_ns_list;
						}

						for (j = 0, jj = tags.length; j < jj; ++j) {
							if (
								(n = tags[j].firstChild) !== null &&
								n.nodeType === Node.TEXT_NODE
							) {
								// Add tag
								t = n.nodeValue.trim();
								tag_ns_list.push(t);
								data.tags.push(t);
							}
						}
					}
				}
			}

			// Date
			if ((n = $("time[datetime]", info)) !== null) {
				m = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)\.(\d{6})/i.exec(n.getAttribute("datetime") || "");
				if (m !== null) {
					data.upload_date = new Date(
						parseInt(m[1], 10),
						parseInt(m[2], 10) - 1,
						parseInt(m[3], 10),
						parseInt(m[4], 10),
						parseInt(m[5], 10),
						parseInt(m[6], 10),
						Math.floor(parseInt(m[7], 10) / 1000)
					).getTime();
				}
			}

			// Favorite count
			if ((n = $(".buttons>.btn.btn-primary>span>.nobold", info)) !== null) {
				m = /\d+/.exec(n.textContent);
				if (m !== null) {
					data.favorites = parseInt(m[0], 10);
				}
			}

			return data;
		};
		var hitomi_normalize_category = function (category) {
			return Helper.title_case(category);
		};
		var hitomi_parse_info = function (html) {
			var info = $(".content", html),
				cellmap = {},
				re_gender = /\s*(\u2640|\u2642)$/, // \u2640 = female, \u2642 = male
				tags_full, tags, tag_list, info2, data, nodes, cells, t, m, n, i, ii, j;

			if (
				info === null ||
				(info2 = $(".gallery", info)) === null
			) {
				return { error: "Could not find info" };
			}

			// Create data
			data = create_empty_gallery_info();
			data.type = "hitomi";
			data.flags |= Flags.ThumbnailNoLeech;
			data.uploader = "hitomi.la";
			data.full = true;
			data.tags = tags = [];
			data.tags_ns = tags_full = {};

			// Image/gid
			if ((n = $(".cover>a", html)) !== null) {
				m = /\/reader\/(\d+)/.exec(n.getAttribute("href") || "");
				if (m !== null) {
					data.gid = parseInt(m[1], 10);
				}

				if ((n = $("img", n)) !== null) {
					t = n.getAttribute("src") || null;
					if (t !== null) {
						if (!re_protocol.test(t)) {
							t = "https:" + t;
						}
						data.thumbnail = t; // no cross origin
					}
				}
			}

			// Image count
			data.file_count = $$(".thumbnail-list>li", html).length;

			// Title
			if ((n = $("h1", info2)) !== null) {
				data.title = n.textContent.trim();
			}

			// Cell info
			cells = $$(".gallery-info>table td", info2);
			for (i = 0; i < cells.length; i += 2) {
				cellmap[cells[i].textContent.trim().toLowerCase()] = cells[i + 1];
			}

			// Language
			if ((n = cellmap.language) !== undefined) {
				t = n.textContent.trim();
				if (t.length > 0 && t !== "N/A") {
					tags_full.language = [ t ];
					tags.push(t);
				}
			}

			// Parody
			if ((n = cellmap.series) !== undefined) {
				t = n.textContent.trim();
				if (t.length > 0 && t !== "N/A") {
					tags_full.parody = [ t ];
					tags.push(t);
				}
			}

			// Character
			if ((n = cellmap.characters) !== undefined) {
				if ((nodes = $$("li>a", n)).length > 0) {
					tag_list = [];

					for (i = 0, ii = nodes.length; i < ii; ++i) {
						t = nodes[i].textContent.trim();
						if (t.length > 0) {
							tag_list.push(t);
							tags.push(t);
						}
					}

					if (tag_list.length > 0) {
						tags_full.character = tag_list;
					}
				}
			}

			// Group
			if ((n = cellmap.group) !== undefined) {
				t = n.textContent.trim();
				if (t.length > 0 && t !== "N/A") {
					tags_full.group = [ t ];
					tags.push(t);
				}
			}

			// Artists
			if ((nodes = $$("h2>ul>li>a", info2)).length > 0) {
				tag_list = [];

				for (i = 0, ii = nodes.length; i < ii; ++i) {
					t = nodes[i].textContent.trim();
					if (t.length > 0) {
						tag_list.push(t);
						tags.push(t);
					}
				}

				if (tag_list.length > 0) {
					tags_full.artist = tag_list;
				}
			}

			// Type
			if ((n = cellmap.type) !== undefined) {
				t = n.textContent.trim();
				if (t.length > 0 && t !== "N/A") {
					data.category = hitomi_normalize_category(t);
				}
			}

			// Tags
			if ((n = cellmap.tags) !== undefined) {
				if ((nodes = $$("li>a", n)).length > 0) {
					tag_list = [ [], [], [] ]; // male, female, tags

					for (i = 0, ii = nodes.length; i < ii; ++i) {
						t = nodes[i].textContent.trim();
						if (t.length > 0) {
							if ((m = re_gender.exec(t)) === null) {
								j = 2;
							}
							else if (m[1] === "\u2640") { // female
								t = t.substr(0, m.index);
								j = 1;
							}
							else { // male
								t = t.substr(0, m.index);
								j = 0;
							}
							tag_list[j].push(t);
						}
					}

					if (tag_list[0].length > 0) {
						Array.prototype.push.apply(tags, tag_list[0]);
						tags_full.male = tag_list[0];
					}
					if (tag_list[1].length > 0) {
						Array.prototype.push.apply(tags, tag_list[1]);
						tags_full.female = tag_list[1];
					}
					if (tag_list[2].length > 0) {
						Array.prototype.push.apply(tags, tag_list[2]);
						tags_full.tags = tag_list[2];
					}
				}
			}

			// Date
			if ((n = $(".date", info)) !== null) {
				m = /^(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+)/i.exec(n.textContent.trim());
				if (m !== null) {
					data.upload_date = new Date(
						parseInt(m[1], 10),
						parseInt(m[2], 10) - 1,
						parseInt(m[3], 10),
						parseInt(m[4], 10),
						parseInt(m[5], 10),
						parseInt(m[6], 10),
						0
					).getTime();
				}
			}

			return data;
		};

		var ehentai_parse_lookup_results = function (xhr, is_similarity_scan, hash, url, md5) {
			var final_url = xhr.finalUrl,
				text = xhr.responseText,
				err = null,
				html, results, links, link, m, n, i, ii;

			// Similarity scan checking
			if (is_similarity_scan) {
				m = /f_shash=(([0-9a-f]{40}|corrupt)(?:;(?:[0-9a-f]{40}|monotone))*)/.exec(final_url);
				if (m !== null && m[2] !== "corrupt") {
					hash = m[1];
					if (/monotone/.test(hash)) {
						err = "Similarity lookup does not work on monotone images";
					}
				}
				else {
					if (/please\s+wait\s+a\s+bit\s+longer\s+between\s+each\s+file\s+search/i.test(text)) {
						err = "Wait longer between lookups";
					}
					else {
						Debug.log("An error occured while reverse image searching", xhr);
						err = "Unknown error";
						html = Helper.html_parse_safe(text, null);
						if (html !== null) {
							n = $("#iw", html);
							if (n !== null) err = n.textContent.trim();
						}
					}
				}

				if (err !== null) return { error: err };

				// Save hash
				if (md5 === null) {
					hash_set_url_to_sha1(url, hash);
				}
				else {
					hash_set_md5_to_sha1(md5, hash);
				}
			}

			// Get html
			html = Helper.html_parse_safe(text, null);

			// Process
			results = [];
			links = $$("div.it5 a,div.id2 a", html);
			for (i = 0, ii = links.length; i < ii; ++i) {
				link = links[i];
				results.push({
					url: link.href,
					title: link.textContent
				});
			}

			// Done
			return {
				url: final_url,
				hash: hash,
				results: results
			};
		};
		var ehentai_create_lookup_url = function (sha1) {
			var url = "http://",
				di = domain_info[config.sauce.lookup_domain];
			url += (di === undefined ? "" : di.g_domain);
			url += "/?f_doujinshi=1&f_manga=1&f_artistcg=1&f_gamecg=1&f_western=1&f_non-h=1&f_imageset=1&f_cosplay=1&f_asianporn=1&f_misc=1&f_search=Search+Keywords&f_apply=Apply+Filter&f_shash=";
			url += sha1;
			url += "&fs_similar=0";
			if (config.sauce.expunged) url += "&fs_exp=1";
			return url;
		};

		var get_image = function (url, callback, progress_callback) {
			// Note that the Uint8Array's length is longer than image_length
			// callback(err, image_data, image_length);
			var xhr_data = {
				method: "GET",
				url: url,
				overrideMimeType: "text/plain; charset=x-user-defined",
				onload: function (xhr) {
					if (xhr.status === 200) {
						var text = xhr.responseText,
							ta = new Uint8Array(text.length + 1),
							content_type = header_string_parse(xhr.responseHeaders)["content-type"] || "text/plain",
							i, ii;

						for (i = 0, ii = text.length; i < ii; ++i) {
							ta[i] = text.charCodeAt(i);
						}

						callback(null, ta, ii, content_type, xhr.finalUrl);
					}
					else {
						callback(xhr.status, null, 0, null, null);
					}
				},
				onerror: function () {
					callback("connection error", null, 0, null, null);
				},
				onabort: function () {
					callback("aborted", null, 0, null, null);
				}
			};

			if (progress_callback !== undefined) {
				xhr_data.onprogress = function (xhr) {
					progress_callback.call(null, "progress", xhr.lengthComputable, xhr.loaded, xhr.total);
				};
			}

			HttpRequest(xhr_data);
		};
		var get_sha1_hash = function (url, md5, callback) {
			var sha1 = null;

			if (md5 !== null) {
				sha1 = hash_get_sha1_from_md5(md5);
				if (sha1 === null) {
					sha1 = hash_get_sha1_from_url(url);
				}
			}
			else {
				sha1 = hash_get_sha1_from_url(url);
			}

			if (callback === undefined) {
				return sha1;
			}

			if (sha1 !== null) {
				callback.call(null, null, sha1);
			}
			else {
				get_image(url, function (err, data) {
					if (err === null) {
						var sha1 = SHA1.hash(data, data.length - 1);

						if (md5 === null) {
							hash_set_url_to_sha1(url, sha1);
						}
						else {
							hash_set_md5_to_sha1(md5, sha1);
						}

						callback.call(null, null, sha1);
					}
					else {
						callback.call(null, err, null);
					}
				});
			}

			return null;
		};



		// API request base code
		var RequestGroup = function () {
			this.active = false;
			this.timeout = null;
			this.types = [];
		};
		var RequestType = function (count, delay_okay, delay_error, group, namespace, type) {
			this.count = count;
			this.delay_okay = delay_okay;
			this.delay_error = delay_error;
			this.queue = [];
			this.unique = {};

			this.group = group;
			this.group.types.push(this);

			this.namespace = namespace;
			this.type = type;

			this.delay_modify = null;
			this.get_data = null;
			this.set_data = null;
			this.setup_xhr = null;
			this.parse_response = null;
		};
		var RequestData = function (id, data, callback, progress_callback) {
			this.id = id;
			this.data = data;
			this.callbacks = [ callback ];
			this.progress_callbacks = [];
			if (progress_callback !== undefined) this.progress_callbacks.push(progress_callback);
		};

		RequestGroup.prototype.run = function (use_delay) {
			if (this.active) return;

			var type, i, ii;
			for (i = 0, ii = this.types.length; i < ii; ++i) {
				type = this.types[i];
				if (type.queue.length > 0) {
					this.active = true;
					if (use_delay && type.count > 1) {
						setTimeout(function () { type.run(); }, 1); // jshint ignore:line
					}
					else {
						type.run();
					}
					break;
				}
			}
		};
		RequestGroup.prototype.complete = function (delay) {
			if (delay <= 0) {
				this.active = false;
				this.run(false);
			}
			else {
				var self = this;
				setTimeout(function () {
					self.active = false;
					self.run(false);
				}, delay);
			}
		};

		RequestType.get_all_progress_callbacks = function (entries) {
			var progress_callbacks = null,
				cbs, i, ii;

			for (i = 0, ii = entries.length; i < ii; ++i) {
				cbs = entries[i].progress_callbacks;
				if (cbs.length > 0) {
					if (progress_callbacks === null) {
						progress_callbacks = cbs.slice(0);
					}
					else {
						$.push_many(progress_callbacks, cbs);
					}
				}
			}

			return progress_callbacks;
		};
		RequestType.prototype.add = function (unique_id, info, callback, progress_callback) {
			// Check if data already exists
			var data, err, u;

			data = this.get_data.call(this, info);
			if (data !== null) {
				if (callback === undefined) return data;
				callback.call(null, null, data);
				return true;
			}

			if (callback === undefined) return null;

			err = get_saved_error([ this.namespace, this.type, unique_id ]);
			if (err !== null) {
				callback.call(null, err, null);
				return true;
			}

			// Add
			u = this.unique[unique_id];
			if (u === undefined) {
				u = new RequestData(unique_id, info, callback, progress_callback);
				this.unique[unique_id] = u;
				this.queue.push(u);
			}
			else {
				u.callbacks.push(callback);
				if (progress_callback !== undefined) u.progress_callbacks.push(progress_callback);
			}

			// Run (if not already running)
			this.group.run(true);
			return false;
		};
		RequestType.prototype.run = function () {
			var self = this,
				entries = this.queue.splice(0, this.count),
				progress_callbacks = RequestType.get_all_progress_callbacks(entries),
				xhr_data, i, ii;

			xhr_data = this.setup_xhr.call(this, entries);

			xhr_data.onload = function (xhr) {
				var response = self.parse_response.call(self, xhr, entries);

				if (typeof(response) === "string") {
					// Error
					self.process_response_error(entries, response);
				}
				else {
					// Valid
					self.process_response(entries, response);
				}

				self.request_complete(entries, false);
			};
			xhr_data.onerror = function () {
				self.process_response_error(entries, "Connection error");
				self.request_complete(entries, true);
			};
			xhr_data.onabort = function () {
				self.process_response_error(entries, "Connection aborted");
				self.request_complete(entries, true);
			};

			if (progress_callbacks !== null) {
				xhr_data.onprogress = function (xhr) {
					for (var i = 0, ii = progress_callbacks.length; i < ii; ++i) {
						progress_callbacks[i].call(null, "progress", xhr.lengthComputable, xhr.loaded, xhr.total);
					}
				};
			}

			if (xhr_data.data !== undefined) {
				xhr_data.upload = {};
				xhr_data.upload.onerror = function () {
					self.process_response_error(entries, "Upload connection error");
					self.request_complete(entries, true);
				};
				xhr_data.upload.onabort = function () {
					self.process_response_error(entries, "Upload connection aborted");
					self.request_complete(entries, true);
				};
				if (progress_callbacks !== null) {
					xhr_data.upload.onprogress = xhr_data.onprogress;
					xhr_data.upload.onload = function () {
						for (var i = 0, ii = progress_callbacks.length; i < ii; ++i) {
							progress_callbacks[i].call(null, "download");
						}
					};
				}
			}

			if (progress_callbacks !== null) {
				for (i = 0, ii = progress_callbacks.length; i < ii; ++i) {
					progress_callbacks[i].call(null, "upload");
				}
			}

			HttpRequest(xhr_data);
		};
		RequestType.prototype.process_response_error = function (entries, error) {
			var i, ii;
			for (i = 0, ii = entries.length; i < ii; ++i) {
				entries[i].run_callbacks(error, null, false, this);
			}
		};
		RequestType.prototype.process_response = function (entries, datas) {
			var i = 0,
				ii = Math.min(datas.length, entries.length),
				data, err;

			for (; i < ii; ++i) {
				data = datas[i];
				if ((err = data.error) !== undefined) {
					entries[i].run_callbacks(err, null, true, this);
				}
				else {
					entries[i].run_callbacks(null, data, false, this);
				}
			}

			ii = entries.length;
			if (i < ii) {
				err = "Data not found";
				for (; i < ii; ++i) {
					entries[i].run_callbacks(err, null, false, this);
				}
			}
		};
		RequestType.prototype.request_complete = function (entries, error) {
			var delay = error ? this.delay_error : this.delay_okay,
				i, ii;
			for (i = 0, ii = entries.length; i < ii; ++i) {
				delete this.unique[entries[i].id];
			}

			if (this.delay_modify !== null) delay = this.delay_modify.call(this, delay, entries);
			this.group.complete(delay);
		};

		RequestData.prototype.run_callbacks = function (err, data, cache_error, request_type) {
			// Cache
			if (err === null) {
				request_type.set_data.call(request_type, data);
			}
			else {
				set_saved_error([ request_type.namespace, request_type.type, this.id ], err, cache_error);
			}

			// Callbacks
			var i, ii;
			for (i = 0, ii = this.callbacks.length; i < ii; ++i) {
				this.callbacks[i].call(null, err, data);
			}
		};



		// API request specializations
		var group_ehentai = new RequestGroup(),
			group_ehentai_full = new RequestGroup(),
			group_lookup = new RequestGroup(),
			group_nhentai = new RequestGroup(),
			group_hitomi = new RequestGroup(),
			rt_ehentai_gallery_page = new RequestType(25, 200, 5000, group_ehentai, "ehentai", "page"),
			rt_ehentai_gallery = new RequestType(25, 200, 5000, group_ehentai, "ehentai", "gallery"),
			rt_ehentai_gallery_full = new RequestType(1, 200, 5000, group_ehentai_full, "ehentai", "full"),
			rt_ehentai_lookup = new RequestType(1, 3000, 5000, group_lookup, "ehentai", "lookup"),
			rt_nhentai_gallery = new RequestType(1, 200, 5000, group_nhentai, "nhentai", "gallery"),
			rt_hitomi_gallery = new RequestType(1, 200, 5000, group_hitomi, "hitomi", "gallery");

		rt_ehentai_gallery.get_data = function (info) {
			var data = get_saved_gallery(this.namespace, info[0]);
			return (data !== null && data.token === info[1]) ? data : null;
		};
		rt_ehentai_gallery.set_data = function (data) {
			set_saved_gallery(data);
		};
		rt_ehentai_gallery.setup_xhr = function (entries) {
			var gidlist = [],
				i, ii;

			for (i = 0, ii = entries.length; i < ii; ++i) {
				gidlist.push(entries[i].data);
			}

			return {
				method: "POST",
				url: "http://" + domains.gehentai + "/api.php",
				headers: { "Content-Type": "application/json" },
				data: JSON.stringify({
					method: "gdata",
					gidlist: gidlist
				})
			};
		};
		rt_ehentai_gallery.parse_response = function (xhr) {
			var response = Helper.json_parse_safe(xhr.responseText, null),
				datas, i, ii;
			if (response !== null) {
				if (typeof(response) === "object") {
					if (typeof(response.error) === "string") {
						return response.error;
					}
					else if (Array.isArray(response.gmetadata)) {
						response = response.gmetadata;
						datas = [];
						for (i = 0, ii = response.length; i < ii; ++i) {
							datas.push(ehentai_normalize_info(response[i]));
						}
						return datas;
					}
				}
				else if (typeof(response) === "string") {
					return response;
				}
			}
			return "Invalid response";
		};

		rt_ehentai_gallery_page.get_data = function (info) {
			var data = get_saved_gallery(this.namespace, info[0]);
			if (data !== null) {
				return {
					gid: data.gid,
					token: data.token
				};
			}
			return null;
		};
		rt_ehentai_gallery_page.set_data = function () {
		};
		rt_ehentai_gallery_page.setup_xhr = function (entries) {
			var pagelist = [],
				i, ii;

			for (i = 0, ii = entries.length; i < ii; ++i) {
				pagelist.push(entries[i].data);
			}

			return {
				method: "POST",
				url: "http://" + domains.gehentai + "/api.php",
				headers: { "Content-Type": "application/json" },
				data: JSON.stringify({
					method: "gtoken",
					pagelist: pagelist
				})
			};
		};
		rt_ehentai_gallery_page.parse_response = function (xhr) {
			var response = Helper.json_parse_safe(xhr.responseText, null);
			if (response !== null) {
				if (typeof(response) === "object") {
					if (typeof(response.error) === "string") {
						return response.error;
					}
					else if (Array.isArray(response.tokenlist)) {
						return response.tokenlist;
					}
				}
				else if (typeof(response) === "string") {
					return response;
				}
			}
			return "Invalid response";
		};

		rt_ehentai_gallery_full.get_data = function (info) {
			var data = get_saved_gallery(this.namespace, info[0]);
			return (data !== null && data.token === info[1] && data.full) ? data : null;
		};
		rt_ehentai_gallery_full.set_data = function (data) {
			set_saved_gallery(data);
		};
		rt_ehentai_gallery_full.setup_xhr = function (entries) {
			var e = entries[0].data;
			return {
				method: "GET",
				url: "http://" + e[0] + "/g/" + e[1].gid + "/" + e[1].token + "/",
			};
		};
		rt_ehentai_gallery_full.parse_response = function (xhr, entries) {
			var html = Helper.html_parse_safe(xhr.responseText, null);
			if (html !== null) {
				return [ ehentai_parse_info(html, entries[0].data[1]) ];
			}
			return "Invalid response";
		};

		rt_ehentai_lookup.delay_modify = function (delay, entries) {
			return (entries[0].data[0] ? delay : 0);
		};
		rt_ehentai_lookup.get_data = function (info) {
			return (info[1] === null ? null : lookup_get_results(info[1]));
		};
		rt_ehentai_lookup.set_data = function (data) {
			lookup_set_results(data);
		};
		rt_ehentai_lookup.setup_xhr = function (entries) {
			var e = entries[0].data;
			if (e[0]) {
				var blob = e[2],
					form_data = new FormData(),
					ext = (blob.type || "").split("/");

				e[2] = null;

				ext = "." + ext[ext.length - 1];

				form_data.append("sfile", blob, "image" + ext);
				form_data.append("fs_similar", "on");
				if (config.sauce.expunged) {
					form_data.append("fs_exp", "on");
				}

				return {
					method: "POST",
					url: "http://ul." + config.sauce.lookup_domain + "/image_lookup.php",
					data: form_data
				};
			}
			else {
				return {
					method: "GET",
					url: ehentai_create_lookup_url(e[1])
				};
			}
		};
		rt_ehentai_lookup.parse_response = function (xhr, entries) {
			var data = entries[0].data;
			return [ ehentai_parse_lookup_results(xhr, data[0], data[1], data[3], data[4]) ];
		};

		rt_nhentai_gallery.get_data = function (info) {
			return get_saved_gallery(this.namespace, info[0]);
		};
		rt_nhentai_gallery.set_data = function (data) {
			set_saved_gallery(data);
		};
		rt_nhentai_gallery.setup_xhr = function (entries) {
			return {
				method: "GET",
				url: "http://" + domains.nhentai + "/g/" + entries[0].data[0] + "/",
			};
		};
		rt_nhentai_gallery.parse_response = function (xhr) {
			var html = Helper.html_parse_safe(xhr.responseText, null);
			if (html !== null) {
				return [ nhentai_parse_info(html) ];
			}
			return "Invalid response";
		};

		rt_hitomi_gallery.get_data = function (info) {
			return get_saved_gallery(this.namespace, info[0]);
		};
		rt_hitomi_gallery.set_data = function (data) {
			set_saved_gallery(data);
		};
		rt_hitomi_gallery.setup_xhr = function (entries) {
			return {
				method: "GET",
				url: "https://" + domains.hitomi + "/galleries/" + entries[0].data[0] + ".html",
			};
		};
		rt_hitomi_gallery.parse_response = function (xhr) {
			var html = Helper.html_parse_safe(xhr.responseText, null);
			if (html !== null) {
				return [ hitomi_parse_info(html) ];
			}
			return "Invalid response";
		};



		// Public
		var get_ehentai_gallery = function (gid, token, callback) {
			var info = [ gid, token ];
			return rt_ehentai_gallery.add(info.join("_"), info, callback);
		};
		var get_ehentai_gallery_page = function (gid, page_token, page, callback) {
			var info = [ gid, page_token, page ];
			return rt_ehentai_gallery_page.add(info.join("_"), info, callback);
		};
		var get_ehentai_gallery_full = function (domain, data, callback) {
			return rt_ehentai_gallery_full.add("" + data.gid, [ domain, data ], callback);
		};
		var get_nhentai_gallery = function (gid, callback) {
			return rt_nhentai_gallery.add("" + gid, [ gid ], callback);
		};
		var get_hitomi_gallery = function (gid, callback) {
			return rt_hitomi_gallery.add("" + gid, [ gid ], callback);
		};

		var get_gallery = function (site, gid) {
			if (saved_gallery_namespace_exists(site)) {
				return get_saved_gallery(site, gid);
			}
			return null;
		};
		var get_gallery_from_link_info = function (link_info, callback) {
			if (link_info.site === "ehentai") {
				if (link_info.type === "gallery") {
					get_ehentai_gallery(link_info.gid, link_info.token, callback);
					return true;
				}
				if (link_info.type === "page") {
					get_ehentai_gallery_page(link_info.gid, link_info.page_token, link_info.page, function (err, data) {
						if (err === null) {
							get_ehentai_gallery(data.gid, data.token, callback);
						}
						else {
							callback.call(null, err, null);
						}
					});
					return true;
				}
			}
			else if (link_info.site === "nhentai") {
				if (link_info.type === "gallery") {
					get_nhentai_gallery(link_info.gid, callback);
					return true;
				}
			}
			else if (link_info.site === "hitomi") {
				if (link_info.type === "gallery") {
					get_hitomi_gallery(link_info.gid, callback);
					return true;
				}
			}

			return false;
		};

		var get_thumbnail = function (data, callback) {
			var thumbnail = data.thumbnail,
				url, cache, gid;

			if (thumbnail === null) {
				callback.call(null, "No thumbnail", null);
			}

			// Use direct URL
			if ((data.flags & API.Flags.ThumbnailNoLeech) === 0 && !config.general.image_leeching_disabled)  {
				callback.call(null, null, thumbnail);
				return;
			}

			// Cached
			cache = saved_thumbnails[data.type];
			if (cache === undefined) {
				callback.call(null, "Malformed data", null);
				return;
			}

			gid = data.gid;
			url = cache[gid];
			if (url !== undefined) {
				callback.call(null, null, url);
				return;
			}

			// Fetch
			get_image(thumbnail, function (err, data, data_length, mime_type) {
				if (err === null) {
					var img_url = uint8_array_to_url(data.subarray(0, data_length), mime_type);

					if (img_url !== null) {
						cache[gid] = img_url;
						callback.call(null, null, img_url);
					}
					else {
						callback.call(null, "Failed to load image", null);
					}
				}
				else {
					callback.call(null, err, null);
				}
			});
		};

		var lookup_on_ehentai = function (url, md5, use_similar, callback, progress_callback) {
			if (use_similar) {
				// Fast mode
				var sha1, results;
				if (
					(sha1 = get_sha1_hash(url, md5)) !== null &&
					(results = rt_ehentai_lookup.add(url, [ true, sha1, null, url, md5 ])) !== null
				) {
					// Already exists
					callback.call(null, null, results);
				}
				else {
					get_image(url, function (err, data, data_length, mime_type, url) {
						if (progress_callback !== undefined) {
							progress_callback.call(null, "image");
						}

						if (err === null) {
							var blob = new Blob([ data.subarray(0, data_length) ], { type: mime_type });

							rt_ehentai_lookup.add(url, [ true, sha1, blob, url, md5 ], callback, progress_callback);
						}
						else {
							callback.call(null, err, null);
						}
					}, progress_callback);
				}
			}
			else {
				get_sha1_hash(url, md5, function (err, sha1) {
					if (progress_callback !== undefined) {
						progress_callback.call(null, "image");
					}

					if (err === null) {
						rt_ehentai_lookup.add(url, [ false, sha1, null, url, md5 ], callback, progress_callback);
					}
					else {
						callback.call(null, err, null);
					}
				});
			}
		};

		var init = function () {
			// Clean
			cache_init();
		};



		// Exports
		return {
			Flags: Flags,
			get_ehentai_gallery: get_ehentai_gallery,
			get_ehentai_gallery_page: get_ehentai_gallery_page,
			get_ehentai_gallery_full: get_ehentai_gallery_full,
			get_nhentai_gallery: get_nhentai_gallery,
			get_hitomi_gallery: get_hitomi_gallery,
			get_gallery: get_gallery,
			get_gallery_from_link_info: get_gallery_from_link_info,
			get_thumbnail: get_thumbnail,
			lookup_on_ehentai: lookup_on_ehentai,
			cache_clear: cache_clear,
			init: init
		};

	})();
	var SHA1 = (function () {

		// SHA-1 JS implementation originally created by Chris Verness; http://movable-type.co.uk/scripts/sha1.html
		// Private
		var f = function (s, x, y, z) {
			switch (s) {
				case 0: return (x & y) ^ (~x & z);
				case 1: return x ^ y ^ z;
				case 2: return (x & y) ^ (x & z) ^ (y & z);
				case 3: return x ^ y ^ z;
			}
		};
		var rotl = function (x, n) {
			return (x << n) | (x >>> (32 - n));
		};
		var hex = function (str) {
			var s = "",
				v, i;
			for (i = 7; i >= 0; --i) {
				v = (str >>> (i * 4)) & 0xf;
				s += v.toString(16);
			}
			return s;
		};

		// Public
		var hash = function (data, data_length) {
			var H0, H1, H2, H3, H4, K, M, N, W, T,
				a, b, c, d, e, i, j, l, s;

			K = new Uint32Array([ 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xCA62C1D6 ]);
			data[data_length] = 0x80; // this is valid because the typed array always contains 1 extra padding byte

			l = data.length / 4 + 2;
			N = Math.ceil(l / 16);
			M = [];

			for (i = 0; i < N; ++i) {
				M[i] = [];
				for (j = 0; j < 16; ++j) {
					M[i][j] =
						(data[i * 64 + j * 4] << 24) |
						(data[i * 64 + j * 4 + 1] << 16) |
						(data[i * 64 + j * 4 + 2] << 8) |
						(data[i * 64 + j * 4 + 3]);
				}
			}

			M[N - 1][14] = Math.floor(((data.length - 1) * 8) / Math.pow(2, 32));
			M[N - 1][15] = ((data.length - 1) * 8) & 0xffffffff;

			H0 = 0x67452301;
			H1 = 0xefcdab89;
			H2 = 0x98badcfe;
			H3 = 0x10325476;
			H4 = 0xc3d2e1f0;

			W = [];

			for (i = 0; i < N; ++i) {
				for (j = 0; j < 16; ++j) {
					W[j] = M[i][j];
				}
				for (j = 16; j < 80; ++j) {
					W[j] = rotl(W[j - 3] ^ W[j - 8] ^ W[j - 14] ^ W[j - 16], 1);
				}

				a = H0;
				b = H1;
				c = H2;
				d = H3;
				e = H4;

				for (j = 0; j < 80; ++j) {
					s = Math.floor(j / 20);
					T = (rotl(a, 5) + f(s, b, c, d) + e + K[s] + W[j]) & 0xffffffff;
					e = d;
					d = c;
					c = rotl(b, 30);
					b = a;
					a = T;
				}

				H0 = (H0 + a) & 0xffffffff;
				H1 = (H1 + b) & 0xffffffff;
				H2 = (H2 + c) & 0xffffffff;
				H3 = (H3 + d) & 0xffffffff;
				H4 = (H4 + e) & 0xffffffff;
			}

			return hex(H0) + hex(H1) + hex(H2) + hex(H3) + hex(H4);
		};

		// Exports
		return {
			hash: hash
		};

	})();
	var Sauce = (function () {

		// Private
		var hover_nodes = {},
			hover_nodes_id = 0;

		var ui_events = {
			click: function (event) {
				event.preventDefault();

				var results = Helper.get_exresults_from_exsauce(this),
					hover;

				if (results !== null) {
					hover = hover_nodes[this.getAttribute("data-hl-sauce-hover-id") || ""];
					if (hover === undefined) return;

					if (results.classList.toggle("hl-exsauce-results-hidden")) {
						hover.classList.remove("hl-exsauce-hover-hidden");
						ui_events.mousemove.call(this, event);
					}
					else {
						hover.classList.add("hl-exsauce-hover-hidden");
					}
				}
			},
			mouseover: function () {
				var results = Helper.get_exresults_from_exsauce(this),
					hover;

				if (results === null || results.classList.contains("hl-exsauce-results-hidden")) {
					hover = hover_nodes[this.getAttribute("data-hl-sauce-hover-id") || ""];
					if (hover === undefined) return;

					hover.classList.remove("hl-exsauce-hover-hidden");
				}
			},
			mouseout: function () {
				var hover = hover_nodes[this.getAttribute("data-hl-sauce-hover-id") || ""];
				if (hover !== undefined) {
					hover.classList.add("hl-exsauce-hover-hidden");
				}
			},
			mousemove: function (event) {
				var hover = hover_nodes[this.getAttribute("data-hl-sauce-hover-id") || ""];

				if (hover === undefined || hover.classList.contains("hl-exsauce-hover-hidden")) return;

				hover.style.left = "0";
				hover.style.top = "0";

				var w = window,
					de = d.documentElement,
					x = event.clientX,
					y = event.clientY,
					win_width = (de.clientWidth || w.innerWidth || 0),
					win_height = (de.clientHeight || w.innerHeight || 0),
					rect = hover.getBoundingClientRect();

				x -= rect.width / 2;
				x = Math.max(1, Math.min(win_width - rect.width - 1, x));
				y += 20;
				if (y + rect.height >= win_height) {
					y = event.clientY - (rect.height + 20);
				}

				hover.style.left = x + "px";
				hover.style.top = y + "px";
			}
		};

		var create_hover = function (id, data) {
			var results = data.results,
				hover, i, ii;

			hover = $.node("div", "hl-exsauce-hover hl-exsauce-hover-hidden hl-hover-shadow" + Theme.classes);
			Theme.bg(hover);
			hover.setAttribute("data-hl-sauce-hover-id", id);

			for (i = 0, ii = results.length; i < ii; ) {
				$.add(hover, $.link(results[i].url, "hl-exsauce-hover-link", results[i].title));
				if (++i < ii) $.add(hover, $.node_simple("br"));
			}

			Popup.hovering(hover);
			hover_nodes[id] = hover;

			return hover;
		};
		var format = function (a, data) {
			var count = data.results.length,
				theme = Theme.classes,
				index = a.getAttribute("data-hl-image-index") || "",
				results, link, par, url, n, i, ii;

			a.classList.add("hl-exsauce-link-valid");
			a.textContent = "Found: " + count;
			a.href = data.url;
			a.target = "_blank";
			a.rel = "noreferrer";

			if (count > 0) {
				if (
					(n = Post.get_post_container(a)) !== null &&
					(n = Post.get_text_body(n)) !== null &&
					(par = n.parentNode) !== null
				) {
					results = $.node("div", "hl-exsauce-results" + theme);
					results.setAttribute("data-hl-image-index", index);
					$.add(results, $.node("strong", "hl-exsauce-results-title", "Reverse Image Search Results"));
					$.add(results, $.node("span", "hl-exsauce-results-sep", "|" ));
					$.add(results, $.node("span", "hl-exsauce-results-label", "View on:"));
					$.add(results, $.link(a.href, "hl-exsauce-results-link", (config.sauce.lookup_domain === domains.exhentai) ? "ExHentai" : "E-Hentai"));
					$.add(results, $.node_simple("br"));

					for (i = 0, ii = data.results.length; i < ii; ++i) {
						url = data.results[i].url;
						link = Linkifier.create_link(results, null, url, url, true);
						if (i < ii - 1) $.add(results, $.node_simple("br"));
					}

					$.before(par, n, results);
				}

				a.setAttribute("data-hl-sauce-hover-id", hover_nodes_id);
				create_hover(hover_nodes_id, data);
				++hover_nodes_id;

				Linkifier.change_link_events(a, "exsauce_toggle");
			}
		};

		var error_events = {
			click: function (event) {
				event.preventDefault();

				var link = this,
					events = this.getAttribute("data-hl-exsauce-events") || null;

				if (events === null) return;

				Linkifier.change_link_events(link, null);

				setTimeout(function () {
					Linkifier.change_link_events(link, events);
					link.click();
				}, 1);
			},
			mouseover: ui_events.mouseover,
			mouseout: ui_events.mouseout,
			mousemove: ui_events.mousemove
		};
		var create_error = function (node, error) {
			var id = hover_nodes_id,
				hover;

			// Create hover
			hover = $.node("div", "hl-exsauce-hover hl-exsauce-hover-hidden hl-hover-shadow" + Theme.classes);
			Theme.bg(hover);
			hover.setAttribute("data-hl-sauce-hover-id", id);

			$.add(hover, $.node("span", "hl-exsauce-hover-link", error));

			Popup.hovering(hover);
			hover_nodes[id] = hover;

			// Link
			node.classList.add("hl-exsauce-link-error");
			node.setAttribute("data-hl-sauce-hover-id", id);
			node.textContent = "Error";
			node.removeAttribute("title");
			++hover_nodes_id;

			// Events
			Linkifier.change_link_events(node, "exsauce_error");
		};
		var remove_error = function (node) {
			var events = Linkifier.get_link_events(node),
				id = node.getAttribute("data-hl-sauce-hover-id"),
				hover = hover_nodes[id];

			Linkifier.change_link_events(node, null);
			node.classList.remove("hl-exsauce-link-error");
			node.setAttribute("data-hl-exsauce-events", events);
			node.removeAttribute("data-hl-sauce-hover-id");

			if (hover !== undefined) {
				if (hover.parentNode !== null) $.remove(hover);
				delete hover_nodes[id];
			}
		};

		var fetch_generic = function (link, use_similar) {
			var url = link.href,
				md5 = link.getAttribute("data-md5") || null,
				progress;

			if (use_similar) {
				link.textContent = "Downloading";

				progress = function (state) {
					if (state === "image") {
						link.textContent = "Waiting";
					}
					else if (state === "upload") {
						link.textContent = "Uploading";
					}
					else if (state === "download") {
						link.textContent = "Checking";
					}
				};
			}
			else {
				link.textContent = "Downloading";

				progress = function (state) {
					if (state === "image") {
						link.textContent = "Waiting";
					}
					else if (state === "upload") {
						link.textContent = "Checking";
					}
				};
			}

			remove_error(link);

			API.lookup_on_ehentai(url, md5, use_similar, function (err, data) {
				if (err === null) {
					format(link, data);
				}
				else {
					create_error(link, err);
				}
			}, progress);
		};

		// Public
		var label = function () {
			var label = config.sauce.label;

			if (label.length === 0) {
				label = (config.sauce.lookup_domain === domains.exhentai) ? "ExHentai" : "E-Hentai";
			}

			return label;
		};
		var fetch = function (event) {
			event.preventDefault();

			fetch_generic(this, false);
		};
		var fetch_similar = function (event) {
			event.preventDefault();

			fetch_generic(this, true);
		};

		var init = function () {
			Linkifier.register_link_events({
				exsauce_fetch: fetch,
				exsauce_fetch_similarity: fetch_similar,
				exsauce_toggle: ui_events,
				exsauce_error: error_events
			});
		};

		// Exports
		return {
			label: label,
			init: init
		};

	})();
	var Linkifier = (function () {

		// Private
		var re_url = /(?:https?:\/*)?(?:(?:forums|gu|g|u)?\.?e[x\-]hentai\.org|nhentai\.net|hitomi\.la)\/[^<>\s\'\"]*/ig,
			re_url_class_ignore = /(?:\binlined?\b|\bhl-)/,
			re_fjord = /abortion|bestiality|incest|lolicon|shotacon|toddlercon/,
			re_protocol = /^https?\:/i;

		// Linkification
		var deep_dom_wrap = (function () {

			// Internal helper class
			var Offset = function (text_offset, node) {
				this.text_offset = text_offset;
				this.node = node;
				this.node_text_length = node.nodeValue.length;
			};



			// Main function
			var deep_dom_wrap = function (container, tag, matcher, element_checker, setup_function, quick) {
				var text = "",
					offsets = [],
					d = document,
					count = 0,
					match_pos = 0,
					node, par, next, check, match,
					pos_start, pos_end, offset_start, offset_end,
					prefix, suffix, link_base, link_node, relative_node, relative_par, clone, i, n1, n2, len, offset_current, offset_node;


				// Create a string of the container's contents (similar to but not exactly the same as node.textContent)
				// Also lists all text nodes into the offsets array
				par = container;
				node = container.firstChild;
				if (node === null) return 0; // Quick exit for empty container
				while (true) {
					if (node !== null) {
						if (node.nodeType === 3) { // TEXT_NODE
							// Add to list and text
							offsets.push(new Offset(text.length, node));
							text += node.nodeValue;
						}
						else if (node.nodeType === 1) { // ELEMENT_NODE
							// Action callback
							check = element_checker.call(null, node);
							// Line break
							if ((check & deep_dom_wrap.EL_TYPE_LINE_BREAK) !== 0) {
								text += "\n";
							}
							// Parse
							if ((check & deep_dom_wrap.EL_TYPE_NO_PARSE) === 0) {
								par = node;
								node = node.firstChild;
								continue;
							}
						}

						// Next
						node = node.nextSibling;
					}
					else {
						// Done?
						if (par === container) break;

						// Move up
						node = par;
						par = node.parentNode;
						node = node.nextSibling;
					}
				}

				// Quick mode: just find all the matches
				if (quick) {
					// Match the text
					match = matcher.call(null, text, match_pos);
					if (match === null) return count;

					++count;

					match_pos = match[1];
				}

				// Loop to find all links
				while (true) {
					// Match the text
					match = matcher.call(null, text, match_pos);
					if (match === null) break;
					++count;



					// Find the beginning and ending text nodes
					pos_start = match[0];
					pos_end = match[1];

					for (offset_start = 1; offset_start < offsets.length; ++offset_start) {
						if (offsets[offset_start].text_offset > pos_start) break;
					}
					for (offset_end = offset_start; offset_end < offsets.length; ++offset_end) {
						if (offsets[offset_end].text_offset > pos_end) break;
					}
					--offset_start;
					--offset_end;



					// Vars to create the link
					prefix = text.substr(offsets[offset_start].text_offset, pos_start - offsets[offset_start].text_offset);
					suffix = text.substr(pos_end, offsets[offset_end].text_offset + offsets[offset_end].node_text_length - pos_end);
					link_base = d.createElement(tag);
					link_node = link_base;
					relative_node = null;

					// Prefix update
					i = offset_start;
					offset_current = offsets[i];
					offset_node = offset_current.node;
					if (prefix.length > 0) {
						// Insert prefix
						n1 = d.createTextNode(prefix);
						offset_node.parentNode.insertBefore(n1, offset_node);

						// Update text
						offset_node.nodeValue = offset_node.nodeValue.substr(prefix.length);

						// Set first relative
						relative_node = n1;
						relative_par = n1.parentNode;

						// Update offset for next search
						len = prefix.length;
						offset_current.text_offset += len;
						offset_current.node_text_length -= len;
					}
					else {
						// Set first relative
						relative_node = offset_node.previousSibling;
						relative_par = offset_node.parentNode;
					}

					// Loop over ELEMENT_NODEs; add TEXT_NODEs to the link, remove empty nodes where necessary
					// The only reason the par variable is necessary is because some nodes are removed during this process
					for (; i < offset_end; ++i) {
						// Next
						node = offsets[i].node;
						next = node.nextSibling;
						par = node.parentNode;

						// Add text
						link_node.appendChild(node);

						// Node loop
						while (true) {
							if (next) {
								if (next.nodeType === Node.TEXT_NODE) {
									// Done
									break;
								}
								else if (next.nodeType === Node.ELEMENT_NODE) {
									// Deeper
									node = next;
									next = node.firstChild;
									par = node;

									// Update link node
									clone = node.cloneNode(false);
									link_node.appendChild(clone);
									link_node = clone;

									continue;
								}
								else {
									// Some other node type; continue anyway
									node = next;
									next = node.nextSibling;

									// Update link node
									link_node.appendChild(node);

									continue;
								}
							}

							// Shallower
							node = par;
							next = node.nextSibling;
							par = node.parentNode;

							if (node.firstChild === null) par.removeChild(node);

							// Update link node
							if (link_node !== link_base) {
								// Simply move up tree (link_node still has a parent)
								link_node = link_node.parentNode;
							}
							else {
								// Create a new wrapper node (link_node has no parent; it's the link_base)
								clone = node.cloneNode(false);
								for (n1 = link_base.firstChild; n1; n1 = n2) {
									n2 = n1.nextSibling;
									clone.appendChild(n1);
								}
								link_base.appendChild(clone);
								link_node = link_base;

								// Placement relatives
								relative_node = (next !== null) ? next.previousSibling : null;
								relative_par = par;
							}
						}
					}

					// Suffix update
					offset_current = offsets[i];
					offset_node = offset_current.node;
					if (suffix.length > 0) {
						// Insert suffix
						n1 = d.createTextNode(suffix);
						if ((n2 = offset_node.nextSibling) !== null) {
							offset_node.parentNode.insertBefore(n1, n2);
						}
						else {
							offset_node.parentNode.appendChild(n1);
						}

						// Update text
						len = offset_node.nodeValue.length - suffix.length;
						offset_node.nodeValue = offset_node.nodeValue.substr(0, len);

						// Update offset for next search
						offset_current.text_length += len;
						offset_current.node_text_length -= len;
						offset_current.node = n1;
					}

					// Add the last segment
					par = offset_node.parentNode;
					link_node.appendChild(offset_node);



					// Setup function
					if (setup_function !== null) setup_function.call(null, link_base, match);



					// Find the proper relative node
					relative_node = (relative_node !== null) ? relative_node.nextSibling : relative_par.firstChild;

					// Insert link
					if (relative_node !== null) {
						// Insert before it
						relative_par.insertBefore(link_base, relative_node);
					}
					else {
						// Add to end
						relative_par.appendChild(link_base);
					}

					// Remove empty suffix tags
					while (par.firstChild === null) {
						node = par;
						par = par.parentNode;
						par.removeChild(node);
					}



					// Update match position
					offsets[offset_end].text_offset = pos_end;
					match_pos = pos_end;
				}

				// Done
				return count;
			};



			// Element type constants
			deep_dom_wrap.EL_TYPE_PARSE = 0;
			deep_dom_wrap.EL_TYPE_NO_PARSE = 1;
			deep_dom_wrap.EL_TYPE_LINE_BREAK = 2;



			// Return the function
			return deep_dom_wrap;

		})();

		var linkify = function (container, results) {
			deep_dom_wrap(
				container,
				"a",
				function (text, pos) {
					re_url.lastIndex = pos;
					var m = re_url.exec(text);
					if (m === null) return null;
					return [ m.index , m.index + m[0].length, m ];
				},
				function (node) {
					if (node.tagName === "BR" || node.tagName === "A") {
						return deep_dom_wrap.EL_TYPE_NO_PARSE | deep_dom_wrap.EL_TYPE_LINE_BREAK;
					}
					else if (node.tagName === "WBR") {
						return deep_dom_wrap.EL_TYPE_NO_PARSE;
					}
					else if (node.tagName === "DIV") {
						if (re_url_class_ignore.test(node.className)) {
							return deep_dom_wrap.EL_TYPE_NO_PARSE | deep_dom_wrap.EL_TYPE_LINE_BREAK;
						}
						return deep_dom_wrap.EL_TYPE_LINE_BREAK;
					}
					return deep_dom_wrap.EL_TYPE_PARSE;
				},
				function (node, match) {
					var url = match[2][0];
					if (!re_protocol.test(url)) url = "http://" + url.replace(/^\/+/, "");
					node.href = url;
					node.target = "_blank";
					node.rel = "noreferrer";
					results.push(node);
				},
				false
			);
		};

		var parse_text_for_urls = function (text) {
			var urls = [],
				m;

			re_url.lastIndex = 0;

			while ((m = re_url.exec(text)) !== null) {
				urls.push(m[0]);
			}

			return urls;
		};

		// Link creation and processing
		var create_link = function (parent, next, url, text, auto_process) {
			var link = $.link(url, "hl-linkified", text);

			$.before(parent, next, link);

			preprocess_link(link, auto_process);

			return link;
		};
		var preprocess_link = function (node, auto_load) {
			var url, info, rewrite, button, par;

			if (
				(par = node.parentNode) === null ||
				(info = Helper.get_url_info((url = node.href))) === null
			) {
				node.classList.remove("hl-linkified-gallery");
				node.removeAttribute("data-hl-linkified-status");
			}
			else {
				if (info.site === "ehentai") {
					rewrite = config.general.rewrite_links;
					if (
						(rewrite === domains.exhentai || rewrite === domains.ehentai) &&
						info.domain !== rewrite
					) {
						info.domain = rewrite;
						url = Helper.change_url_domain(url, domain_info[rewrite].g_domain);
						node.href = url;
					}
				}

				node.classList.add("hl-linkified");
				node.classList.add("hl-linkified-gallery");
				node.setAttribute("data-hl-linkified-status", "processed");

				node.setAttribute("data-hl-info", JSON.stringify(info));
				node.setAttribute("data-hl-id", info.site + "_" + info.gid);

				button = UI.button(url, info.domain);

				change_link_events(node, "gallery_link");
				change_link_events(button, "gallery_fetch");

				$.before(par, node, button);

				if (auto_load) load_link(node, info);
			}
		};
		var load_link = function (link, info) {
			API.get_gallery_from_link_info(info, function (err, data) {
				if (err === null) {
					format_link(link, data);
				}
				else {
					format_link_error(link, err);
				}
			});
		};
		var format_link = function (link, data) {
			if (link.parentNode === null) return;

			var button = Helper.get_tag_button_from_link(link),
				listeners = event_listeners.format,
				domain, fjord, ex, hl, c;

			// Smart links
			if (config.general.rewrite_links === "smart") {
				domain = Helper.get_domain(link.href);
				ex = (domain === domains.exhentai);
				if (ex || domain === domains.ehentai) {
					fjord = re_fjord.test(data.tags.join(","));
					if (fjord !== ex) {
						domain = fjord ? domains.exhentai : domains.ehentai;
						link.href = Helper.change_url_domain(link.href, domain_info[domain].g_domain);
						if (button !== null) {
							button.href = link.href;
							UI.update_button_text(button, domain);
						}
					}
				}
			}

			// Link title
			link.textContent = data.title;
			link.setAttribute("data-hl-linkified-status", "formatted");

			// Button
			if (button !== null) {
				hl = Filter.check(link, data);
				if (hl[0] !== Filter.None) {
					c = (hl[0] === Filter.Good) ? config.filter.good_tag_marker : config.filter.bad_tag_marker;
					UI.mark_button_text(button, c);
					Filter.highlight_tag(button, link, hl);
				}
				change_link_events(button, "gallery_toggle_actions");
			}

			// Event
			if (listeners.length > 0) {
				trigger(listeners, { link: link });
			}
		};
		var format_link_error = function (link, error) {
			var text = " (" + error.trim().replace(/\.$/, "") + ")",
				button = Helper.get_tag_button_from_link(link),
				n;

			if (button !== null) {
				change_link_events(button, "gallery_error");
				button.classList.add("hl-linkified-error");
			}

			link.classList.add("hl-linkified-error");
			link.setAttribute("data-hl-linkified-status", "formatted_error");
			n = $(".hl-linkified-error-message", link);
			if (n === null) {
				$.add(link, $.node("span", "hl-linkified-error-message", text));
			}
			else {
				n.textContent = text;
			}
		};

		// Post queue
		var post_queue = {
			posts: [],
			timer: null,
			group_size: 25,
			delay: 50
		};
		var queue_posts = function (posts, flags) {
			if ((flags & queue_posts.Flags.Flush) !== 0) {
				// Flush
				parse_posts(post_queue.posts);
				post_queue.posts = [];

				// Clear timer
				if (post_queue.timer !== null) {
					clearTimeout(post_queue.timer);
					post_queue.timer = null;
				}
			}

			if ((flags & queue_posts.Flags.UseDelay) === 0) {
				// Immediate
				parse_posts(posts);
			}
			else {
				// Queue
				$.push_many(post_queue.posts, posts);

				// Run queue
				if (post_queue.timer === null) {
					dequeue_posts();
				}
			}
		};
		queue_posts.Flags = {
			None: 0x0,
			UseDelay: 0x1,
			Flush: 0x2,
		};
		var dequeue_posts = function () {
			var posts = post_queue.posts.splice(0, post_queue.group_size);

			if (posts.length === 0) {
				// Done
				post_queue.timer = null;
			}
			else {
				// Run
				parse_posts(posts);

				// Timer for next
				post_queue.timer = setTimeout(dequeue_posts, post_queue.delay);
			}
		};

		var setup_post_exsauce = function (post) {
			var index = 0,
				event, file_infos, file_info, sauce, i, ii;

			// File info
			file_infos = Post.get_file_info(post);
			for (i = 0, ii = file_infos.length; i < ii; ++i) {
				file_info = file_infos[i];

				// Create if not found
				sauce = $(".hl-exsauce-link", file_info.options);
				if (sauce !== null) $.remove(sauce);

				if (/^\.(png|gif|jpe?g)$/i.test(file_info.type)) {
					event = "exsauce_fetch";
					sauce = $.link(file_info.url, "hl-exsauce-link", Sauce.label());
					sauce.setAttribute("data-hl-filename", file_info.name);
					sauce.setAttribute("data-hl-image-index", index);
					if (file_info.md5 !== null) {
						sauce.setAttribute("data-md5", file_info.md5.replace(/=+/g, ""));
					}
					if (/^\.jpe?g$/i.test(file_info.type) && !Config.is_tinyboard) {
						if (browser.is_firefox) {
							event = "exsauce_fetch_similarity";
							sauce.title = "This will only work on colored images";
						}
						else {
							event = "exsauce_error";
							sauce.title = "Reverse Image Search doesn't work for .jpg images because 4chan manipulates them on upload";
							sauce.classList.add("hl-exsauce-link-disabled");
						}
					}

					change_link_events(sauce, event);

					Post.create_image_meta_link(file_info, sauce);

					++index;
				}
			}
		};
		var parse_post = function (post) {
			var auto_load_links = config.general.automatic_processing,
				post_body, post_links, links, link, i, ii;

			// Exsauce
			if (config.sauce.enabled && !browser.is_opera) {
				setup_post_exsauce(post);
			}

			if ((post_body = Post.get_text_body(post)) !== null) {
				// Content
				re_url.lastIndex = 0;
				if (!Config.linkify || re_url.test(post_body.innerHTML)) {
					links = [];
					post_links = Post.get_body_links(post_body);
					for (i = 0, ii = post_links.length; i < ii; ++i) {
						link = post_links[i];
						if (link.classList.contains("hl-site-tag")) {
							$.remove(link);
						}
						else {
							re_url.lastIndex = 0;
							if (re_url.test(link.href)) {
								link.classList.add("hl-linkified");
								link.classList.add("hl-linkified-gallery");
								link.target = "_blank";
								link.rel = "noreferrer";
								link.setAttribute("data-hl-linkified-status", "unprocessed");
								links.push(link);
							}
						}
					}

					if (Config.linkify) {
						linkify(post_body, links);
					}

					for (i = 0, ii = links.length; i < ii; ++i) {
						preprocess_link(links[i], auto_load_links);
					}
				}
				post.classList.add("hl-post-linkified");
			}
		};
		var parse_posts = function (posts) {
			var post, i, ii;

			Debug.timer("process");

			for (i = 0, ii = posts.length; i < ii; ++i) {
				post = posts[i];
				if (post.classList.contains("hl-post-linkified")) {
					UI.cleanup_post(post);
					apply_link_events(post, true);
				}
				else {
					parse_post(post);
				}
			}

			Debug.log("Total posts=" + posts.length + "; time=" + Debug.timer("process"));
		};

		// Link events
		var link_events = {};
		var register_link_events = function (events) {
			var count = 0,
				k;

			for (k in events) {
				if (!Object.prototype.hasOwnProperty.call(link_events, k)) {
					link_events[k] = events[k];
					++count;
				}
			}

			return count;
		};
		var get_link_events = function (node) {
			return node.getAttribute("data-hl-link-events") || null;
		};
		var set_link_events = function (node, new_events) {
			var events = link_events[new_events],
				k;

			if (events) {
				if (typeof(events) === "function") {
					$.on(node, "click", events);
				}
				else {
					// Array
					for (k in events) {
						$.on(node, k, events[k]);
					}
				}
			}
		};
		var apply_link_events = function (node, check_children) {
			var nodes = check_children ? $$("a.hl-link-events", node) : [ node ],
				events, i, ii;

			for (i = 0, ii = nodes.length; i < ii; ++i) {
				node = nodes[i];
				events = node.getAttribute("data-hl-link-events");
				set_link_events(node, events);
			}
		};
		var change_link_events = function (node, new_events) {
			var old_events = node.getAttribute("data-hl-link-events"),
				events, k;

			events = link_events[old_events];
			if (events) {
				if (typeof(events) === "function") {
					$.off(node, "click", events);
				}
				else {
					// Array
					for (k in events) {
						$.off(node, k, events[k]);
					}
				}
			}

			if (new_events === null) {
				node.classList.remove("hl-link-events");
				node.removeAttribute("data-hl-link-events");
			}
			else {
				node.classList.add("hl-link-events");
				node.setAttribute("data-hl-link-events", new_events);
				set_link_events(node, new_events);
			}
		};

		// Links
		var get_links = function (parent) {
			return $$("a.hl-linkified-gallery[href]", parent);
		};
		var get_links_formatted = function (parent) {
			return $$("a.hl-linkified-gallery[data-hl-linkified-status=formatted]", parent);
		};

		// Events
		var event_listeners = {
			format: []
		};
		var on = function (event_name, callback) {
			var listeners = event_listeners[event_name];
			if (!listeners) return false;
			listeners.push(callback);
			return true;
		};
		var off = function (event_name, callback) {
			var listeners = event_listeners[event_name],
				i, ii;
			if (listeners) {
				for (i = 0, ii = listeners.length; i < ii; ++i) {
					if (listeners[i] === callback) {
						listeners.splice(i, 1);
						return true;
					}
				}
			}
			return false;
		};
		var trigger = function (listeners, data) {
			var i, ii;
			for (i = 0, ii = listeners.length; i < ii; ++i) {
				listeners[i].call(null, data);
			}
		};

		// Fixing
		var relinkify_posts = function (posts) {
			var post, links, i, ii, j, jj;

			for (i = 0, ii = posts.length; i < ii; ++i) {
				post = posts[i];
				post.classList.remove("hl-post-linkified");

				links = $$(".hl-site-tag", post);
				for (j = 0, jj = links.length; j < jj; ++j) {
					$.remove(links[j]);
				}

				links = $$(".hl-link-events", post);
				for (j = 0, jj = links.length; j < jj; ++j) {
					change_link_events(links[j], null);
				}
			}

			queue_posts(posts, queue_posts.Flags.Flush | queue_posts.Flags.UseDelay);
		};
		var fix_broken_4chanx_linkification = function (node, event_links) {
			// Somehow one of the links gets cloned, and then they all get wrapped inside another link
			var fix = [],
				n = node.nextSibling,
				link, events, i, ii;

			if (n !== null && n.tagName === "A" && n.classList.contains("hl-linkified")) {
				$.remove(n);
			}

			n = node.previousSibling;
			if (n !== null && n.tagName === "A" && n.classList.contains("hl-site-tag")) {
				$.remove(n);
			}

			for (i = 0, ii = event_links.length; i < ii; ++i) {
				link = event_links[i];
				events = get_link_events(link);
				change_link_events(link, null);

				if (link.classList.contains("hl-site-tag")) {
					$.remove(link);
				}
				else if (link.classList.contains("hl-linkified")) {
					fix.push(link, events);
				}
			}

			$.unwrap(node);

			for (i = 0, ii = fix.length; i < ii; i += 2) {
				link = fix[i];
				preprocess_link(link, config.general.automatic_processing);
			}
		};

		// Exports
		return {
			parse_text_for_urls: parse_text_for_urls,
			create_link: create_link,
			load_link: load_link,
			queue_posts: queue_posts,
			get_link_events: get_link_events,
			change_link_events: change_link_events,
			register_link_events: register_link_events,
			get_links: get_links,
			get_links_formatted: get_links_formatted,
			relinkify_posts: relinkify_posts,
			fix_broken_4chanx_linkification: fix_broken_4chanx_linkification,
			on: on,
			off: off
		};

	})();
	var Settings = (function () {

		// Private
		var config_temp = null,
			export_url = null,
			popup = null;

		var html_options = function () {
			return '<div class="hl-settings-heading"><div><span class="hl-settings-heading-cell hl-settings-heading-title">General</span> <span class="hl-settings-heading-cell hl-settings-heading-subtitle">Note: you must reload the page after saving for some changes to take effect</span></div></div><div class="hl-settings-group hl-settings-group-general hl-theme"></div><div class="hl-settings-heading"><div><span class="hl-settings-heading-cell hl-settings-heading-title">Gallery Details</span></div></div><div class="hl-settings-group hl-settings-group-details hl-theme"></div><div class="hl-settings-heading"><div><span class="hl-settings-heading-cell hl-settings-heading-title">Gallery Actions</span></div></div><div class="hl-settings-group hl-settings-group-actions hl-theme"></div><div class="hl-settings-heading"><div><span class="hl-settings-heading-cell hl-settings-heading-title">ExSauce</span></div></div><div class="hl-settings-group hl-settings-group-sauce hl-theme"></div><div class="hl-settings-heading"><div><span class="hl-settings-heading-cell hl-settings-heading-title">Filtering</span> <span class="hl-settings-heading-cell hl-settings-heading-subtitle"><a class="hl-settings-filter-guide-toggle">Click here to toggle the guide</a></span></div></div><div class="hl-settings-filter-guide hl-settings-group hl-theme">Lines starting with <code>/</code> will be treated as <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions" target="_blank" rel="noreferrer nofollow">regular expressions</a>. <span style="opacity: 0.75">(This is very similar to 4chan-x style filtering)</span><br>Lines starting with <code>#</code> are comments and will be ignored.<br>Lines starting with neither <code>#</code> nor <code>/</code> will be treated as a case-insensitive string to match anywhere.<br>For example, <code>/touhou/i</code> will highlight entries containing the string `<code>touhou</code>`, case-insensitive.<br><br>The lower a filter appears in this list, the greater its priority will be.<br><br>You can use these additional settings with each regular expression, separating them with semicolons:<br><ul><li><strong>Apply the filter to different scopes:</strong><br><code>tags;</code>, <code>title;</code> or <code>uploader;</code>. By default the scope is <code>title;tags;</code><br></li><li><strong>Force a gallery to not be highlighted:</strong> <span style="opacity: 0.75">If omitted, the gallery will be highlighted as normal</span><br><code>bad:no;</code>, <code>bad:yes;</code>, or just <code>bad;</code></li><li><strong>Only apply the filter to certain categories.</strong><br><code>only:doujinshi,manga;</code>.<div style="font-size: 0.9em; margin-top: 0.1em; opacity: 0.75">Categories: <span>artistcg, asianporn, cosplay, doujinshi, gamecg, imageset, manga, misc, <span style="white-space: nowrap">non-h</span>, private, western</span></div></li><li><strong>Only apply the filter if it <em>is not</em> a certain category:</strong><br><code>not:western,non-h;</code>.</li><li><strong>Apply a colored decoration to the matched text:</strong><br><code>color:red;</code>, <code>underline:#0080f0;</code>, or <code>background:rgba(0,255,0,0.5);</code></li><li><strong>Apply a colored decoration to the [Ex] or [EH] tag:</strong><br><code>link-color:blue;</code>, <code>link-underline:#bf48b5;</code>, or <code>link-background:rgba(220,200,20,0.5);</code></li><li><strong>Apply a colored decoration to <em>BOTH</em> the matched text and tag:</strong><br><code>colors:blue;</code>, <code>underlines:#bf48b5;</code>, or <code>backgrounds:rgba(220,200,20,0.5);</code></li><li><strong>Disable any coloring, including the default:</strong><br><code>no-colors;</code> or <code>nocolor;</code></li></ul>Additionally, some settings have aliases. If multiple are used, only the main one will be used.<br><ul><li><code>tags: tag</code></li><li class="hl-settings-li-no-space"><code>only: category, cat</code></li><li class="hl-settings-li-no-space"><code>not: no</code></li><li><code>colors: cs</code></li><li class="hl-settings-li-no-space"><code>underlines: us</code></li><li class="hl-settings-li-no-space"><code>backgrounds: bgs</code></li><li><code>color: c</code></li><li class="hl-settings-li-no-space"><code>underline: u</code></li><li class="hl-settings-li-no-space"><code>background: bg</code></li><li><code>link-color: link-c, lc</code></li><li class="hl-settings-li-no-space"><code>link-underline: link-u, lu</code></li><li class="hl-settings-li-no-space"><code>link-background: link-bg, lbg</code></li><li><code>no-colors: no-color, nocolors, nocolor</code></li></ul>For easy <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#Color_keywords" target="_blank" rel="noreferrer nofollow">HTML color</a> selection, you can use the following helper to select a color:<br><br><div><input type="color" value="#808080" class="hl-settings-color-input"><input type="text" value="#808080" class="hl-settings-color-input" readonly="readonly"><input type="text" value="rgba(128,128,128,1)" class="hl-settings-color-input" readonly="readonly"></div></div><div class="hl-settings-group hl-settings-group-filter hl-theme"></div><div class="hl-settings-heading"><div><span class="hl-settings-heading-cell hl-settings-heading-title">Debugging</span></div></div><div class="hl-settings-group hl-settings-group-debug hl-theme"></div>';
		};
		var create_export_data = function () {
			return {
				config: Config.get_saved_settings(),
				easy_list: EasyList.get_saved_settings()
			};
		};
		var import_settings = function (data) {
			if (data !== null && typeof(data) === "object") {
				var v = data.config;
				if (typeof(v) !== "object") v = null;
				Config.set_saved_settings(v);

				v = data.easy_list;
				if (typeof(v) !== "object") v = null;
				EasyList.set_saved_settings(v);
			}
		};
		var gen = function (container, theme, option_type) {
			var config_scope = config_temp[option_type],
				entry, table, row, cell, label, input, event,
				args, values, id, name, desc, type, value, obj, label_text, ext, i, ii, j, jj, n, v;

			// [ name, default, label, description, old_name, formatter, info? ]
			args = options[option_type];
			if (arguments.length > 3) args = Array.prototype.concat.call(args, Array.prototype.slice.call(arguments, 3));

			for (i = 0, ii = args.length; i < ii; ++i) {
				obj = args[i];
				name = obj[0];
				label_text = obj[2];
				desc = obj[3];
				ext = (obj.length > 5 ? obj[5] : null);
				if (ext === null || (type = ext.type) === undefined) type = "checkbox";
				value = (name === null ? null : config_scope[name]);
				id = "hl-settings-" + option_type + "-" + i;
				event = "change";

				$.add(container, entry = $.node("div", "hl-settings-entry" + theme));
				$.add(entry, table = $.node("div", "hl-settings-entry-table"));
				$.add(table, row = $.node("div", "hl-settings-entry-row"));

				$.add(row, cell = $.node("span", "hl-settings-entry-cell"));
				$.add(cell, label = $.node("label", "hl-settings-entry-label"));
				label.htmlFor = id;
				$.add(label, $.node("strong", "hl-settings-entry-label-name", label_text + ":"));
				if (desc.length > 0) {
					n = $.node("span", "hl-settings-entry-label-description");
					n.innerHTML = " " + desc;
					$.add(label, n);
				}

				if (type === "checkbox") {
					$.add(row, cell = $.node("span", "hl-settings-entry-cell"));
					$.add(cell, input = $.node("input", "hl-settings-entry-input" + theme));
					input.type = "checkbox";
					input.id = id;
					input.checked = value;
				}
				else if (type === "select") {
					$.add(row, cell = $.node("span", "hl-settings-entry-cell"));
					$.add(cell, input = $.node("select", "hl-settings-entry-input" + theme));

					values = ext.options;
					for (j = 0, jj = values.length; j < jj; ++j) {
						v = values[j];
						$.add(input, n = $.node("option", "hl-settings-entry-input-option", v[1]));
						n.value = v[0];
						n.selected = (v[0] === value);
						if (v.length > 2) n.title = v[2];
					}
				}
				else if (type === "textbox") {
					$.add(row, cell = $.node("span", "hl-settings-entry-cell"));
					$.add(cell, input = $.node("input", "hl-settings-entry-input" + theme));
					input.type = "text";
					input.id = id;
					input.value = value;
				}
				else if (type === "textarea") {
					$.add(table, row = $.node("div", "hl-settings-entry-row"));
					$.add(row, cell = $.node("span", "hl-settings-entry-cell"));
					$.add(cell, input = $.node("textarea", "hl-settings-entry-input" + theme));
					input.wrap = "off";
					input.spellcheck = false;
					input.id = id;
					input.value = value;
				}
				else if (type === "button") {
					$.add(row, cell = $.node("span", "hl-settings-entry-cell"));
					$.add(cell, input = $.node("button", "hl-settings-entry-input" + theme, ext.text || ""));
					event = "click";
				}

				$.on(input, event, $.bind(on_change, input, type, option_type, name, ext));
			}
		};

		var on_change = function (option_type, scope, name, extra, event) {
			var fn, v;

			if (name !== null) {
				if (option_type === "checkbox") {
					v = this.checked;
				}
				else if (option_type === "select" || option_type === "textbox" || option_type === "textarea") {
					v = this.value;
				}

				fn = (extra === null ? undefined : extra.set);
				if (fn !== undefined) fn.call(null, v);

				config_temp[scope][name] = v;
			}

			if (extra !== null && (fn = extra.on_change) !== undefined) {
				fn.call(this, event);
			}
		};
		var on_cache_clear_click = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();

				var clears = API.cache_clear();
				Debug.log("Cleared cache; entries_removed=" + clears);
				this.textContent = "Cleared!";
			}
		};
		var on_changelog_click = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();
				close(event);
				Changelog.open(null);
			}
		};
		var on_export_click = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();
				close();
				open_export();
			}
		};
		var on_save_click = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();

				config = config_temp;
				config_temp = null;

				Config.save();
				close();
			}
		};
		var on_cancel_click = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();

				close();
			}
		};
		var on_toggle_filter_guide = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();

				try {
					var n = this.parentNode.parentNode.parentNode.nextSibling;
					if (n.classList.contains("hl-settings-filter-guide")) {
						n.classList.toggle("hl-settings-filter-guide-visible");
					}
				}
				catch (e) {}
			}
		};
		var on_color_helper_change = function () {
			var n = this.nextSibling,
				m;

			if (n !== null) {
				n.value = this.value.toUpperCase();
				n = n.nextSibling;
				if (n !== null) {
					m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(this.value);
					if (m !== null) {
						n.value = "rgba(" + parseInt(m[1], 16) + "," + parseInt(m[2], 16) + "," + parseInt(m[3], 16) + ",1)";
					}
				}
			}
		};
		var on_settings_open_click = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();

				open();
			}
		};

		// Public
		var ready = function () {
			Navigation.insert_link("main", "H-links", Main.homepage, " hl-nav-link-settings", on_settings_open_click);

			var n = $.link(Main.homepage, "hl-nav-link", "H-links Settings");
			$.on(n, "click", on_settings_open_click);
			HeaderBar.insert_menu_link(n);
		};
		var open = function () {
			var theme = Theme.classes,
				n;

			// Config
			config_temp = JSON.parse(JSON.stringify(config));

			// Popup
			popup = Popup.create("settings", [[{
				small: true,
				setup: function (container) {
					var n;
					$.add(container, $.link(Main.homepage, "hl-settings-title" + theme, "H-links"));
					$.add(container, n = $.link(Changelog.url, "hl-settings-version" + theme, Main.version.join(".")));
					$.on(n, "click", on_changelog_click);
				}
			}, {
				align: "right",
				setup: function (container) {
					var n;
					$.add(container, n = $.link("https://github.com/dnsev-h/h-links/issues", "hl-settings-button" + theme));
					$.add(n, $.node("span", "hl-settings-button-text", "Issues"));

					$.add(container, n = $.link(Changelog.url, "hl-settings-button" + theme));
					$.add(n, $.node("span", "hl-settings-button-text", "Changelog"));
					$.on(n, "click", on_changelog_click);

					$.add(container, n = $.link("#", "hl-settings-button" + theme));
					$.add(n, $.node("span", "hl-settings-button-text", "Export"));
					$.on(n, "click", on_export_click);

					$.add(container, n = $.link("#", "hl-settings-button" + theme));
					$.add(n, $.node("span", "hl-settings-button-text", "Save settings"));
					$.on(n, "click", on_save_click);

					$.add(container, n = $.link("#", "hl-settings-button" + theme));
					$.add(n, $.node("span", "hl-settings-button-text", "Cancel"));
					$.on(n, "click", on_cancel_click);
				}
			}], {
				body: true,
				setup: function (container) {
					var n = $.frag(html_options());
					Theme.apply(n);

					$.add(container, n);
				}
			}]);

			// Settings
			gen($(".hl-settings-group-general", popup), theme, "general");
			gen($(".hl-settings-group-details", popup), theme, "details");
			gen($(".hl-settings-group-actions", popup), theme, "actions");
			gen($(".hl-settings-group-sauce", popup), theme, "sauce");
			gen($(".hl-settings-group-filter", popup), theme, "filter");
			gen($(".hl-settings-group-debug", popup), theme, "debug",
				[ null, null,
					"Clear cache data", "Clear all cached gallery data",
					null,
					{ type: "button", text: "Clear", on_change: on_cache_clear_click },
				]
			);

			// Events
			$.on(popup, "click", on_cancel_click);
			$.on($("input.hl-settings-color-input[type=color]", popup), "change", on_color_helper_change);
			$.on($(".hl-settings-filter-guide-toggle", popup), "click", on_toggle_filter_guide);

			// Add to body
			Popup.open(popup);

			// Focus
			n = $(".hl-popup-cell-size-scroll", popup);
			if (n !== null) $.scroll_focus(n);
		};
		var open_export = function () {
			var theme = Theme.classes,
				nodes = {
					textarea: null
				},
				export_data_string, n;

			// Config
			export_data_string = JSON.stringify(create_export_data(), null, 2);
			export_url = window.URL.createObjectURL(new Blob([ export_data_string ], { type: "application/json" }));

			// Popup
			popup = Popup.create("settings", [[{
				small: true,
				setup: function (container) {
					$.add(container, $.link(Main.homepage, "hl-settings-title" + theme, "H-links"));
					$.add(container, $.node("span", "hl-settings-title-info" + theme, " - Settings export"));
				}
			}, {
				align: "right",
				setup: function (container) {
					var d = new Date(),
						pad, n, fn;

					pad = function (s, len) {
						s = "" + s;
						while (s.length < len) s = "0" + s;
						return s;
					};

					fn = $.node("input", "hl-settings-file-input");
					fn.type = "file";
					fn.accept = ".json";
					$.add(container, fn);
					$.on(fn, "change", function () {
						var files = this.files,
							reader;
						if (files.length > 0 && /\.json$/i.test(files[0].name)) {
							reader = new FileReader();
							reader.addEventListener("load", function () {
								var d = Helper.json_parse_safe(this.result, null);
								if (d !== null) {
									nodes.textarea.value = JSON.stringify(d, null, 2);
									nodes.textarea.classList.add("hl-settings-export-textarea-changed");
								}
							}, false);
							reader.readAsText(files[0]);
						}
						this.value = null;
					});

					$.add(container, n = $.link(undefined, "hl-settings-button" + theme));
					$.add(n, $.node("span", "hl-settings-button-text", "Import"));
					$.on(n, "click", function (event) {
						event.preventDefault();
						fn.click();
					});

					$.add(container, n = $.link(export_url, "hl-settings-button" + theme));
					n.removeAttribute("target");
					n.setAttribute("download",
						"H-links".toLowerCase() + "-settings-" +
						Main.version.join(".") + "-" +
						pad(d.getFullYear(), 4) + "." +
						pad(d.getMonth() + 1, 2) + "." +
						pad(d.getDate(), 2) + "-" +
						pad(d.getHours(), 2) + "." +
						pad(d.getMinutes(), 2) + ".json"
					);
					$.add(n, $.node("span", "hl-settings-button-text", "Export"));

					$.add(container, n = $.link("#", "hl-settings-button" + theme));
					$.add(n, $.node("span", "hl-settings-button-text", "Save settings"));
					$.on(n, "click", function (event) {
						if ($.is_left_mouse(event)) {
							event.preventDefault();
							var v = Helper.json_parse_safe(nodes.textarea.value, null);
							if (v !== null) {
								nodes.textarea.classList.remove("hl-settings-export-textarea-error");
								import_settings(v);
							}
							else {
								nodes.textarea.classList.add("hl-settings-export-textarea-error");
							}
							nodes.textarea.classList.remove("hl-settings-export-textarea-changed");
						}
					});

					$.add(container, n = $.link("#", "hl-settings-button" + theme));
					$.add(n, $.node("span", "hl-settings-button-text", "Cancel"));
					$.on(n, "click", on_cancel_click);
				}
			}], {
				padding: false,
				setup: function (container) {
					var n1, n2, n3;

					$.add(container, n1 = $.node("div", "hl-settings-export-message", "Disclaimer: changing these settings can easily break things. Edit at your own risk. ("));

					$.add(n1, n2 = $.node("label", "hl-settings-export-label"));
					$.add(n2, n3 = $.node("input", "hl-settings-export-checkbox"));
					$.add(n2, $.node("span", "hl-settings-export-label-text", "Enable editing"));
					$.add(n2, $.node("span", "hl-settings-export-label-text", "Editing enabled"));
					n3.type = "checkbox";
					n3.checked = false;
					$.on(n3, "change", function () {
						nodes.textarea.readOnly = !this.checked;
					});

					$.add(n1, $.tnode(")"));

					$.add(container, n1);
				}
			}, {
				body: true,
				padding: false,
				setup: function (container) {
					var n;

					n = $.node("textarea", "hl-settings-export-textarea" + theme);
					n.spellcheck = false;
					n.wrap = "off";
					n.value = export_data_string;
					n.readOnly = true;
					$.on(n, "input", function () {
						this.classList.add("hl-settings-export-textarea-changed");
					});

					nodes.textarea = n;

					$.add(container, n);
				}
			}]);
			$.on(popup, "click", on_cancel_click);

			// Add to body
			Popup.open(popup);

			// Focus
			n = $(".hl-settings-export-textarea", popup);
			if (n !== null) n.focus();
		};
		var close = function () {
			config_temp = null;
			if (popup !== null) {
				Popup.close(popup);
				popup = null;
			}
			if (export_url !== null) {
				window.URL.revokeObjectURL(export_url);
				export_url = null;
			}
		};

		// Exports
		return {
			ready: ready,
			open: open,
			open_export: open_export,
			close: close
		};

	})();
	var Config = (function () {

		// Private
		var settings_key = "hlinks-settings";

		// Public
		var storage = (function () {
			try {
				if (!(
					GM_setValue && typeof(GM_setValue) === "function" &&
					GM_getValue && typeof(GM_getValue) === "function" &&
					GM_deleteValue && typeof(GM_deleteValue) === "function" &&
					GM_listValues && typeof(GM_listValues) === "function"
				)) {
					throw "";
				}
			}
			catch (e) {
				return window.localStorage;
			}

			return {
				getItem: function (key) {
					return GM_getValue(key, null);
				},
				setItem: function (key, value) {
					GM_setValue(key, value);
				},
				key: function (index) {
					return GM_listValues()[index];
				},
				removeItem: function (key) {
					GM_deleteValue(key);
				},
				clear: function () {
					var v = GM_listValues(), i, ii;
					for (i = 0, ii = v.length; i < ii; ++i) GM_deleteValue(v[i]);
				},
				get length() {
					return GM_listValues().length;
				}
			};
		})();

		var init = function () {
			var update = false,
				temp, temp_scope, info, scope, entry, value, i, ii, k, t;

			if (
				(temp = get_saved_settings()) === null ||
				typeof(temp) !== "object"
			) {
				temp = {};
				Main.version_change = 2;
			}

			if (typeof(temp.settings_version) === "number") {
				// New settings
				for (k in options) {
					config[k] = scope = {};
					info = options[k];
					ii = info.length;

					temp_scope = temp[k];
					if (typeof(temp_scope) !== "object" || temp_scope === null) temp_scope = {};

					for (i = 0; i < ii; ++i) {
						entry = info[i];
						t = entry[0]; // name
						value = temp_scope[t];
						if (value === undefined) {
							value = entry[1]; // default
							update = true;
						}
						scope[t] = value;
					}
				}
			}
			else {
				// Load from old version
				update = true;
				for (k in options) {
					config[k] = scope = {};
					info = options[k];
					for (i = 0, ii = info.length; i < ii; ++i) {
						entry = info[i];
						t = entry[4]; // old_name
						if (
							t === null ||
							(value = (typeof(t) === "string" ? temp[t] : t.call(null, temp))) === undefined
						) {
							value = entry[1]; // default
						}
						scope[entry[0]] = value;
					}
				}
			}

			// Version change
			value = temp.version;
			if (value === undefined) value = [];
			i = Main.version_compare(Main.version, value);
			if (i !== 0) {
				update = true;
				if (Main.version_change === 0) {
					Main.version_change = i;
				}
			}

			// Save changes
			if (update) save();
		};
		var ready = function () {
			var domain = Helper.get_domain(window.location.href);

			if (domain === "4chan.org") {
				Module.mode = "4chan";
				Module.is_4chan = true;
				Module.is_4chan_x3 = d.documentElement.classList.contains("fourchan-x");
			}
			else if (domain === "desustorage.org" || domain === "fgts.jp") {
				if (d.doctype.publicId) {
					Module.mode = "fuuka";
					Module.is_fuuka = true;
				}
				else {
					Module.mode = "foolz";
					Module.is_foolz = true;
				}
				Module.linkify = false;
			}
			else { // assume tinyboard
				Module.mode = "tinyboard";
				Module.is_tinyboard = true;
				Module.linkify = false;
				if ($("form[name=postcontrols]") === null) return false;
			}

			return true;
		};
		var save = function () {
			config.version = Main.version;
			storage.setItem(settings_key, JSON.stringify(config));
			config.version = null;
		};
		var get_saved_settings = function () {
			return Helper.json_parse_safe(storage.getItem(settings_key), null);
		};
		var set_saved_settings = function (data) {
			if (data === null) {
				storage.removeItem(settings_key);
			}
			else {
				storage.setItem(settings_key, JSON.stringify(data));
			}
		};

		// Exports
		var Module = {
			mode: "4chan", // foolz, fuuka, tinyboard
			is_4chan: false,
			is_4chan_x3: false,
			is_foolz: false,
			is_fuuka: false,
			is_tinyboard: false,
			linkify: true,
			storage: storage,
			init: init,
			ready: ready,
			save: save,
			get_saved_settings: get_saved_settings,
			set_saved_settings: set_saved_settings
		};

		return Module;

	})();
	var Filter = (function () {

		// Private
		var active_filters = null,
			good_values = [ "", "true", "yes" ],
			Status = { None: 0, Bad: -1, Good: 1 },
			cache = { tags: {} };

		var Filter = function (regex, flags, priority) {
			this.regex = regex;
			this.flags = flags;
			this.priority = priority;
		};
		var FilterFlags = function () {
			this.title = true;
			this.tags = true;
			this.uploader = false;
			this.bad = false;

			this.only = null;
			this.not = null;

			this.color = "#EE2200";
			this.underline = null;
			this.background = null;
			this.link_color = this.color;
			this.link_underline = null;
			this.link_background = null;
		};
		FilterFlags.scope_fn = function (name) {
			return function (value, state) {
				if (!state.scope) {
					state.scope = true;
					this.tags = false;
					this.title = false;
					this.uploader = false;
				}

				this[name] = (good_values.indexOf(value.trim().toLowerCase()) >= 0);
			};
		};
		FilterFlags.color_fn = function (fn) {
			return function (value, state) {
				if (!state.color) {
					state.color = true;
					this.color = null;
					this.underline = null;
					this.background = null;
					this.link_color = null;
					this.link_underline = null;
					this.link_background = null;
				}

				fn.call(this, value.trim());
			};
		};
		FilterFlags.names = {
			"tags": FilterFlags.scope_fn("tags"),
			"title": FilterFlags.scope_fn("title"),
			"uploader": FilterFlags.scope_fn("uploader"),

			"bad": FilterFlags.color_fn(function (value) {
				this.bad = (good_values.indexOf(value.toLowerCase()) >= 0);
			}),

			"only": function (value) {
				this.only = this.split(value);
			},
			"not": function (value) {
				this.not = this.split(value);
			},

			"colors": FilterFlags.color_fn(function (value) {
				this.color = value;
				this.link_color = value;
			}),
			"underlines": FilterFlags.color_fn(function (value) {
				this.underline = value;
				this.link_underline = value;
			}),
			"backgrounds": FilterFlags.color_fn(function (value) {
				this.background = value;
				this.link_background = value;
			}),

			"color": FilterFlags.color_fn(function (value) {
				this.color = value;
			}),
			"underline": FilterFlags.color_fn(function (value) {
				this.underline = value;
			}),
			"background": FilterFlags.color_fn(function (value) {
				this.background = value;
			}),

			"link-color": FilterFlags.color_fn(function (value) {
				this.link_color = value;
			}),
			"link-underline": FilterFlags.color_fn(function (value) {
				this.link_underline = value;
			}),
			"link-background": FilterFlags.color_fn(function (value) {
				this.link_background = value;
			}),

			"no-colors": function (value, state) {
				state.color = true;

				value = null;
				this.color = value;
				this.underline = value;
				this.background = value;
				this.link_color = value;
				this.link_underline = value;
				this.link_background = value;
			},

			"tag": "tags",

			"category": "only",
			"cat": "only",
			"no": "not",

			"cs": "colors",
			"us": "underlines",
			"bgs": "backgrounds",

			"c": "color",
			"u": "underline",
			"bg": "background",

			"link_color": "link-color",
			"link-c": "link-color",
			"link_c": "link-color",
			"lc": "link-color",
			"link_underline": "link-underline",
			"link-u": "link-underline",
			"link_u": "link-underline",
			"lu": "link-underline",
			"link_background": "link-background",
			"link-bg": "link-background",
			"link_bg": "link-background",
			"lbg": "link-background",

			"no_colors": "no-colors",
			"no-color": "no-colors",
			"no_color": "no-colors",
			"nocolors": "no-colors",
			"nocolor": "no-colors",
		};
		FilterFlags.prototype.setup = function (flags_obj) {
			var state = {
				scope: false,
				color: false
			}, k, fn;

			for (k in flags_obj) {
				fn = FilterFlags.names[k];
				if (fn !== undefined) {
					if (typeof(fn) === "string") {
						fn = FilterFlags.names[fn];
					}
					fn.call(this, flags_obj[k], state);
				}
			}
		};
		FilterFlags.prototype.split = function (text) {
			var array, i, ii;

			text = text.trim();
			if (text.length === 0) return null;

			array = text.toLowerCase().split(",");
			for (i = 0, ii = array.length; i < ii; ++i) {
				array[i] = array[i].trim();
			}

			return array;
		};
		var Match = function (start, end, filter) {
			this.start = start;
			this.end = end;
			this.filter = filter;
		};
		var MatchSegment = function (start, end, data) {
			this.start = start;
			this.end = end;
			this.data = data;
		};
		var MatchInfo = function () {
			this.matches = [];
			this.any = false;
			this.bad = false;
		};

		var create_regex = function (pattern, flags) {
			if (flags.indexOf("g") < 0) flags += "g";

			try {
				return new RegExp(pattern, flags);
			}
			catch (e) {
				return null;
			}
		};
		var create_flags = function (text) {
			var flaglist = text.split(";"),
				flags = {},
				key, m, i, f;

			for (i = 0; i < flaglist.length; ++i) {
				if (flaglist[i].length > 0) {
					m = flaglist[i].split(":");
					key = m[0].trim().toLowerCase();
					m.splice(0, 1);
					flags[key] = m.join("").trim();
				}
			}

			f = new FilterFlags();
			f.setup(flags);
			return f;
		};
		var matches_to_segments = function (text, matches) {
			var segments = [ new MatchSegment(0, text.length, []) ],
				hit, m, s, i, ii, j, jj;

			if (config.filter.full_highlighting) { // fast mode
				for (i = 0, ii = matches.length; i < ii; ++i) {
					segments[0].data.push(matches[i].filter);
				}
			}
			else {
				for (i = 0, ii = matches.length; i < ii; ++i) {
					m = matches[i];
					hit = false;
					for (j = 0, jj = segments.length; j < jj; ++j) {
						s = segments[j];
						if (m.start < s.end && m.end > s.start) {
							hit = true;
							j = update_segments(segments, j, m, s);
						}
						else if (hit) {
							break;
						}
					}
				}
			}

			return segments;
		};
		var update_segments = function (segments, pos, match, segment) {
			var data = segment.data.slice(0),
				s1, s2;

			segment.data.push(match.filter);

			if (match.start > segment.start) {
				if (match.end < segment.end) {
					// cut at both
					s1 = new MatchSegment(segment.start, match.start, data);
					s2 = new MatchSegment(match.end, segment.end, data.slice(0));
					segment.start = match.start;
					segment.end = match.end;
					segments.splice(pos, 0, s1);
					pos += 2;
					segments.splice(pos, 0, s2);
				}
				else {
					// cut at start
					s1 = new MatchSegment(segment.start, match.start, data);
					segment.start = match.start;
					segments.splice(pos, 0, s1);
					pos += 1;
				}
			}
			else {
				if (match.end < segment.end) {
					// cut at end
					s2 = new MatchSegment(match.end, segment.end, data);
					segment.end = match.end;
					pos += 1;
					segments.splice(pos, 0, s2);
				}
				// else, cut at neither
			}

			return pos;
		};
		var apply_styles = function (node, styles) {
			var color = null,
				background = null,
				underline = null,
				p1 = -1,
				p2 = -1,
				p3 = -1,
				style, i, ii, s, p;

			for (i = 0, ii = styles.length; i < ii; ++i) {
				p = styles[i].priority;
				style = styles[i].flags;
				if ((s = style.color) !== null && p >= p1) {
					color = s;
					p1 = p;
				}
				if ((s = style.background) !== null && p >= p2) {
					background = s;
					p2 = p;
				}
				if ((s = style.underline) !== null && p >= p3) {
					underline = s;
					p3 = p;
				}
			}

			apply_styling(node, color, background, underline);
		};
		var apply_styling = function (node, color, background, underline) {
			if (color !== null) {
				node.style.setProperty("color", color, "important");
			}
			if (background !== null) {
				node.style.setProperty("background-color", background, "important");
			}
			if (underline !== null) {
				node.style.setProperty("border-bottom", "0.125em solid " + underline, "important");
			}
		};
		var append_match_datas = function (matchinfo, target) {
			for (var i = 0, ii = matchinfo.matches.length; i < ii; ++i) {
				target.push(matchinfo.matches[i].filter);
			}
		};
		var remove_non_bad = function (list) {
			for (var i = 0; i < list.length; ) {
				if (!list[i].bad) {
					list.splice(i, 1);
					continue;
				}
				++i;
			}
		};
		var check_multiple = function (type, text, filters, category) {
			var info = new MatchInfo(),
				filter, match, i, ii;

			for (i = 0, ii = filters.length; i < ii; ++i) {
				filter = filters[i];
				if (filter.flags[type] !== true) continue;
				filter.regex.lastIndex = 0;
				while (true) {
					match = check_single(text, filter, category);
					if (match === null) break;

					info.any = true;
					info.matches.push(match);
					if (match.filter.flags.bad) {
						info.bad = true;
					}
				}
			}

			return info;
		};
		var check_single = function (text, filter, category) {
			// return null if no match
			// return a new Match if a match was found
			var list, i, ii, m;

			// Category filtering
			if ((list = filter.flags.only) !== null) {
				for (i = 0, ii = list.length; i < ii; ++i) {
					if (list[i] === category) break;
				}
				if (i >= ii) return null;
			}
			if ((list = filter.flags.not) !== null) {
				for (i = 0, ii = list.length; i < ii; ++i) {
					if (list[i] === category) {
						return null;
					}
				}
			}

			// Text filter
			m = filter.regex.exec(text);
			return (m === null) ? null : new Match(m.index, m.index + m[0].length, filter);
		};
		var hl_return = function (bad, node) {
			if (bad) {
				node.classList.add("hl-filter-bad");
				return Status.Bad;
			}
			else {
				node.classList.add("hl-filter-good");
				return Status.Good;
			}
		};
		var init_filters = function () {
			active_filters = config.filter.enabled ? parse(config.filter.filters, 0) : [];
		};

		// Public
		var parse = function (input, start_priority) {
			var filters = [],
				lines = (input || "").split("\n"),
				i, pos, pos2, flags, line, regex;

			if (start_priority === undefined) start_priority = (active_filters === null ? 0 : active_filters.length);

			for (i = 0; i < lines.length; ++i) {
				line = lines[i].trim();
				if (line.length === 0) continue;
				if (line[0] === "/" && (pos = line.lastIndexOf("/")) > 0) {
					++pos;
					pos2 = line.indexOf(";", pos);

					regex = line.substr(1, pos - 2);
					if (pos2 >= 0) {
						flags = line.substr(pos, pos2 - pos);
						pos = pos2 + 1;
					}
					else {
						flags = line.substr(pos);
						pos = line.length;
					}
					regex = create_regex(regex, flags);

					if (regex !== null) {
						flags = create_flags(line.substr(pos));
						filters.push(new Filter(regex, flags, start_priority));
						++start_priority;
					}
				}
				else if (line[0] !== "#") {
					if ((pos = line.indexOf(";")) > 0) {
						regex = line.substr(0, pos);
						flags = create_flags(line.substr(pos));
					}
					else {
						regex = line;
						flags = create_flags("");
					}
					regex = new RegExp(Helper.regex_escape(regex), "ig");

					filters.push(new Filter(regex, flags, start_priority));
					++start_priority;
				}
			}

			return filters;
		};
		var highlight = function (type, node, data, input_state, results, extras) {
			if (active_filters === null) init_filters();

			var no_extras = true,
				filters = active_filters,
				category = Helper.category(data.category).short,
				info, matches, text, frag, segment, cache_type, bad, c, i, t, n1, n2;

			if (extras && extras.length > 0) {
				filters = filters.concat(extras);
				no_extras = false;
			}
			if (filters.length === 0) {
				return Status.None;
			}

			// Cache for tags
			text = node.textContent;
			if (
				no_extras &&
				input_state !== Status.Bad &&
				(cache_type = cache[type]) !== undefined &&
				(c = cache_type[category]) !== undefined &&
				(c = c[text]) !== undefined
			) {
				if (c === null) {
					return Status.None;
				}

				// Results
				if (results !== undefined) {
					append_match_datas(c[0], results);
				}

				// Clone
				n1 = c[1].cloneNode(true);
				node.innerHTML = "";
				while ((n2 = n1.firstChild) !== null) {
					$.add(node, n2);
				}
				return hl_return(n1.classList.contains("hl-filter-bad"), node);
			}

			// Check filters
			info = check_multiple(type, text, filters, category);
			if (!info.any) {
				if (cache_type !== undefined) {
					if ((c = cache_type[category]) === undefined) {
						cache_type[category] = c = {};
					}
					c[text] = null;
				}
				return Status.None;
			}

			// If bad, remove all non-bad filters
			bad = (info.bad || input_state === Status.Bad);
			if (bad) {
				for (i = 0; i < info.matches.length; ) {
					if (!info.matches[i].filter.flags.bad) {
						info.matches.splice(i, 1);
						continue;
					}
					++i;
				}
			}

			// Results
			if (results !== undefined) {
				append_match_datas(info, results);
			}

			// Merge
			matches = matches_to_segments(text, info.matches);

			frag = d.createDocumentFragment();
			for (i = 0; i < matches.length; ++i) {
				segment = matches[i];
				t = text.substring(segment.start, segment.end);
				if (segment.data.length === 0) {
					$.add(frag, $.tnode(t));
				}
				else {
					n1 = $.node("span", "hl-filter-text");
					n2 = $.node("span", "hl-filter-text-inner", t);
					$.add(n1, n2);
					$.add(frag, n1);
					apply_styles(n1, segment.data);
				}
			}

			// Replace
			node.innerHTML = "";
			$.add(node, frag);
			if (cache_type !== undefined) {
				if ((c = cache_type[category]) === undefined) {
					cache_type[category] = c = {};
				}
				c[text] = [ info, node ];
			}
			return hl_return(bad, node);
		};
		var highlight_tag = function (node, link, filter_data) {
			if (filter_data[0] === Status.Bad) {
				node.classList.add("hl-filter-bad");
				link.classList.add("hl-filter-bad");
				link.classList.remove("hl-filter-good");
			}
			else {
				node.classList.add("hl-filter-good");
				link.classList.add("hl-filter-good");
			}

			// Get styles
			var color = null,
				background = null,
				underline = null,
				p1 = -1,
				p2 = -1,
				p3 = -1,
				n, n1, n2;

			var get_style = function (styles) {
				var style, i, ii, p, s;
				for (i = 0, ii = styles.length; i < ii; ++i) {
					p = styles[i].priority;
					style = styles[i].flags;
					if ((s = style.link_color) !== null && p >= p1) {
						color = s;
						p1 = p;
					}
					if ((s = style.link_background) !== null && p >= p2) {
						background = s;
						p2 = p;
					}
					if ((s = style.link_underline) !== null && p >= p3) {
						underline = s;
						p3 = p;
					}
				}
			};

			get_style(filter_data[1].uploader);
			get_style(filter_data[1].title);
			get_style(filter_data[1].tags);

			// Apply styles
			if (
				(color !== null || background !== null || underline !== null) &&
				(node = UI.button_get_inner(node)) !== null
			) {
				n1 = $.node("span", "hl-filter-text");
				n2 = $.node("span", "hl-filter-text-inner");
				while ((n = node.firstChild) !== null) {
					$.add(n2, n);
				}
				$.add(n1, n2);
				$.add(node, n1);
				apply_styling(n1, color, background, underline);
			}
		};
		var check = function (titlenode, data, extras) {
			if (active_filters === null) init_filters();

			var filters = active_filters,
				status = Status.None,
				category = Helper.category(data.category).short,
				str, tags, result, i, info;

			if (extras && extras.length > 0) {
				filters = filters.concat(extras);
			}

			result = {
				tags: [],
				uploader: [],
				title: [],
			};

			// Title
			if (filters.length > 0) {
				// Uploader
				if ((str = data.uploader)) {
					info = check_multiple("uploader", str, filters, category);
					if (info.any) {
						append_match_datas(info, result.uploader);
						if (info.bad) {
							status = Status.Bad;
						}
						else if (status === Status.None) {
							status = Status.Good;
						}
					}
				}

				// Tags
				if ((tags = data.tags) && tags.length > 0) {
					for (i = 0; i < tags.length; ++i) {
						info = check_multiple("tags", tags[i], filters, category);
						if (info.any) {
							append_match_datas(info, result.tags);
							if (info.bad) {
								status = Status.Bad;
							}
							else if (status === Status.None) {
								status = Status.Good;
							}
						}
					}
					// Remove dups
					result.tags = result.tags.filter(function (item, pos, self) {
						return (self.indexOf(item) === pos);
					});
				}
			}

			i = highlight("title", titlenode, data, status, result.title, extras);
			if (status === Status.None || i === Status.Bad) {
				status = i;
			}

			// Remove non-bad filters on result.tags and result.uploader
			if (status === Status.Bad) {
				remove_non_bad(result.uploader);
				remove_non_bad(result.tags);
			}

			return [ status , (status === Status.None ? null : result) ];
		};

		// Export
		return {
			None: Status.None,
			Bad: Status.Bad,
			Good: Status.Good,
			parse: parse,
			check: check,
			highlight: highlight,
			highlight_tag: highlight_tag
		};

	})();
	var Theme = (function () {

		// Private
		var current = "light",
			post_bg = "transparent";

		var to_hex2 = function (n) {
			n = n.toString(16);
			if (n.length < 2) n = "0" + n;
			return n;
		};
		var detect = function () {
			var doc_el = d.documentElement,
				body = d.body,
				n = d.createElement("div"),
				color, colors, i, j, a, a_inv;

			if (!doc_el || !body) {
				return null;
			}

			n.className = "post reply post_wrapper";
			$.add(body, n);

			color = parse_css_color(get_computed_style(doc_el).backgroundColor);
			colors = [
				parse_css_color(get_computed_style(body).backgroundColor),
				parse_css_color(get_computed_style(n).backgroundColor),
			];

			for (i = 0; i < colors.length; ++i) {
				a = colors[i][3];
				a_inv = (1.0 - a) * color[3];

				for (j = 0; j < 3; ++j) {
					color[j] = (color[j] * a_inv + colors[i][j] * a);
				}
				color[3] = Math.max(color[3], a);
			}

			body.removeChild(n);

			if (color[3] === 0) return null;

			return [
				(color[0] + color[1] + color[2] < 384) ? "dark" : "light",
				"#" + to_hex2(colors[1][0]) + to_hex2(colors[1][1]) + to_hex2(colors[1][2])
			];
		};
		var update = function (change_nodes) {
			var new_theme = detect();
			if (new_theme !== null) {
				if (new_theme[0] !== current) {
					if (change_nodes) update_nodes(new_theme);
					current = new_theme[0];
					Theme.classes = (current === "light" ? " hl-theme" : " hl-theme hl-theme-dark");
				}
				if (new_theme[1] !== post_bg) {
					post_bg = new_theme[1];
					if (change_nodes) update_nodes_bg();
				}
				return true;
			}
			return false;
		};
		var update_nodes = function (new_theme) {
			var nodes = $$("hl-theme"),
				ii = nodes.length,
				cls, i;
			if (new_theme === "light") {
				cls = "hl-theme-" + current;
				for (i = 0; i < ii; ++i) {
					nodes[i].classList.remove(cls);
				}
			}
			else {
				cls = "hl-theme-" + new_theme;
				for (i = 0; i < ii; ++i) {
					nodes[i].classList.add(cls);
				}
			}
		};
		var update_nodes_bg = function () {
			var nodes = $$("hl-theme-post-bg"),
				i, ii;
			for (i = 0, ii = nodes.length; i < ii; ++i) {
				nodes[i].style.backgroundColor = post_bg;
			}
		};

		var on_head_mutate = function (records) {
			var nodes, node, tag, i, ii, j, jj;

			for (i = 0, ii = records.length; i < ii; ++i) {
				if ((nodes = records[i].addedNodes)) {
					for (j = 0, jj = nodes.length; j < jj; ++j) {
						node = nodes[j];
						tag = node.tagName;
						if (tag === "STYLE" || (tag === "LINK" && /\bstylesheet\b/.test(node.rel))) {
							update(true);
							return;
						}
					}
				}
				if ((nodes = records[i].removedNodes)) {
					for (j = 0, jj = nodes.length; j < jj; ++j) {
						node = nodes[j];
						tag = node.tagName;
						if (tag === "STYLE" || (tag === "LINK" && /\bstylesheet\b/.test(node.rel))) {
							update(true);
							return;
						}
					}
				}
			}
		};

		// Public
		var ready = function () {
			update(false);

			if (MutationObserver !== null && d.head) {
				new MutationObserver(on_head_mutate).observe(d.head, { childList: true });
			}
		};
		var bg = function (node) {
			node.classList.add("hl-theme-post-bg");
			node.style.backgroundColor = post_bg;
		};
		var apply = function (node) {
			if (current !== "light") {
				var nodes = $$(".hl-theme", node),
					i, ii;

				for (i = 0, ii = nodes.length; i < ii; ++i) {
					nodes[i].classList.add("hl-theme-dark");
				}

				if (node.classList && node.classList.contains("hl-theme")) {
					node.classList.add("hl-theme-dark");
				}
			}
		};
		var get_computed_style = function (node) {
			try {
				// Don't use window.getComputedStyle: https://code.google.com/p/chromium/issues/detail?id=538650
				return document.defaultView.getComputedStyle(node);
			}
			catch (e) {
				return node.style || {};
			}
		};
		var parse_css_color = function (color) {
			if (color && color !== "transparent") {
				var m;
				if ((m = /^rgba?\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*(?:,\s*([0-9\.]+)\s*)?\)$/.exec(color))) {
					return [
						parseInt(m[1], 10),
						parseInt(m[2], 10),
						parseInt(m[3], 10),
						m[4] === undefined ? 1 : parseFloat(m[4])
					];
				}
				else if ((m = /^#([0-9a-fA-F]{3,})$/.exec(color))) {
					if ((m = m[1]).length === 6) {
						return [
							parseInt(m.substr(0, 2), 16),
							parseInt(m.substr(2, 2), 16),
							parseInt(m.substr(4, 2), 16),
							1
						];
					}
					else {
						return [
							parseInt(m[0], 16),
							parseInt(m[1], 16),
							parseInt(m[2], 16),
							1
						];
					}
				}
			}

			return [ 0 , 0 , 0 , 0 ];
		};

		// Exports
		var Module =  {
			classes: " hl-theme",
			ready: ready,
			bg: bg,
			apply: apply,
			get_computed_style: get_computed_style,
			parse_css_color: parse_css_color
		};

		return Module;

	})();
	var EasyList = (function () {

		var Entry = function (domain, site, gid) {
			this.domain = domain;
			this.namespace = site;
			this.id = gid;
			this.node = null;
		};

		// Private
		var settings_key = "hlinks-easylist-settings",
			popup = null,
			options_container = null,
			empty_notification = null,
			content_container = null,
			content_current = 0,
			contents = [{
				entries: [],
				container: null,
				visible: 0
			}, {
				entries: [],
				container: null,
				visible: 0
			}],
			queue = [],
			data_map = {},
			queue_timer = null,
			custom_filters = [],
			custom_links = [],
			custom_links_map = {},
			custom_links_text = "",
			node_sort_order_keys = {
				thread: [ "data-hl-index", 1 ],
				upload: [ "data-hl-date-uploaded", -1 ],
				rating: [ "data-hl-rating", -1 ]
			},
			display_mode_names = [
				"full",
				"compact",
				"minimal"
			],
			settings = {
				sort_by: "thread",
				group_by_category: false,
				group_by_filters: false,
				custom_filters: "# Custom filters follow the same rules as standard filters\n",
				display_mode: 0, // 0 = full, 1 = compact, 2 = minimal
				filter_visibility: 0 // 0 = show all, 1 = hide bad, 2 = only show matches
			};

		var settings_save = function () {
			Config.storage.setItem(settings_key, JSON.stringify(settings));
		};
		var settings_load = function () {
			// Load
			var value = get_saved_settings(),
				k;

			if (value !== null && typeof(value) === "object") {
				for (k in settings) {
					if (
						Object.prototype.hasOwnProperty.call(settings, k) &&
						Object.prototype.hasOwnProperty.call(value, k) &&
						typeof(settings[k]) === typeof(value[k])
					) {
						settings[k] = value[k];
					}
				}
			}

			// Load filters
			load_filters();
		};
		var create = function () {
			popup = Popup.create("easylist", function (container) {
				var theme = Theme.classes,
					n1, n2;

				// Overlay
				$.add(container, n1 = $.node("div", "hl-easylist-title"));

				$.add(n1, $.node("span", "hl-easylist-title-text", "H-links Easy List"));
				$.add(n1, $.node("span", "hl-easylist-subtitle", "More porn, less hassle"));

				// Close
				$.add(container, n1 = $.node("div", "hl-easylist-control-links"));

				$.add(n1, n2 = $.link(undefined, "hl-easylist-control-link hl-easylist-control-link-options", "options"));
				$.on(n2, "click", on_options_click);

				$.add(n1, n2 = $.link(undefined, "hl-easylist-control-link", "close"));
				$.on(n2, "click", on_close_click);

				$.add(container, $.node("div", "hl-easylist-title-line"));

				// Settings
				options_container = create_options(theme);
				$.add(container, options_container);

				// Empty notification
				empty_notification = $.node("div",
					"hl-easylist-empty-notification hl-easylist-empty-notification-visible",
					"No galleries found"
				);
				$.add(container, empty_notification);

				// Items list
				contents[0].container = $.node("div", "hl-easylist-items" + theme);
				contents[1].container = $.node("div", "hl-easylist-items" + theme);
				$.add(container, contents[content_current].container);

				content_container = container;
			});

			$.on(popup, "click", on_overlay_click);

			// Setup
			update_display_mode(true);
		};
		var create_options = function (theme) {
			var fn, n1, n2, n3, n4, n5;

			n1 = $.node("div", "hl-easylist-options");
			$.add(n1, n2 = $.node("div", "hl-easylist-option-table"));


			$.add(n2, n3 = $.node("div", "hl-easylist-option-row"));
			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));
			$.add(n4, $.node("span", "hl-easylist-option-title", "Sort by:"));

			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));

			fn = function (value, text) {
				var n1 = $.node("label", "hl-easylist-option-label"),
					n2 = $.node("input", "hl-easylist-option-input");

				n2.name = "hl-easylist-options-sort-by";
				n2.type = "radio";
				n2.checked = (settings.sort_by === value);
				n2.value = value;

				$.add(n1, n2);
				$.add(n1, $.node("span", "hl-easylist-option-button" + theme, text));

				$.on(n2, "change", on_option_change.sort_by);

				return n1;
			};
			$.add(n4, fn("thread", "Appearance in thread"));
			$.add(n4, fn("upload", "Upload date"));
			$.add(n4, fn("rating", "Rating"));

			$.add(n2, n3 = $.node("div", "hl-easylist-option-row"));
			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));
			$.add(n4, $.node("span", "hl-easylist-option-title", "Group by:"));

			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));

			fn = function (checked, text, change_fn) {
				var n1 = $.node("label", "hl-easylist-option-label"),
					n2 = $.node("input", "hl-easylist-option-input");

				n2.type = "checkbox";
				n2.checked = checked;

				$.add(n1, n2);
				$.add(n1, $.node("span", "hl-easylist-option-button" + theme, text));

				$.on(n2, "change", change_fn);

				return n1;
			};
			$.add(n4, fn(settings.group_by_filters, "Filters", on_option_change.group_by_filters));
			$.add(n4, fn(settings.group_by_category, "Category", on_option_change.group_by_category));


			$.add(n2, n3 = $.node("div", "hl-easylist-option-row"));
			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));
			$.add(n4, $.node("span", "hl-easylist-option-title", "Display mode:"));

			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));

			fn = function (value, text) {
				var n1 = $.node("label", "hl-easylist-option-label"),
					n2 = $.node("input", "hl-easylist-option-input");

				n2.name = "hl-easylist-options-display";
				n2.type = "radio";
				n2.checked = (settings.display_mode === value);
				n2.value = "" + value;

				$.add(n1, n2);
				$.add(n1, $.node("span", "hl-easylist-option-button" + theme, text));

				$.on(n2, "change", on_option_change.display_mode);

				return n1;
			};
			$.add(n4, fn(0, "Full"));
			$.add(n4, fn(1, "Compact"));
			$.add(n4, fn(2, "Minimal"));


			$.add(n2, n3 = $.node("div", "hl-easylist-option-row"));
			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));
			$.add(n4, $.node("span", "hl-easylist-option-title", "Filter visibility:"));

			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));

			fn = function (value, text) {
				var n1 = $.node("label", "hl-easylist-option-label"),
					n2 = $.node("input", "hl-easylist-option-input");

				n2.name = "hl-easylist-options-filter-visibility";
				n2.type = "radio";
				n2.checked = (settings.filter_visibility === value);
				n2.value = "" + value;

				$.add(n1, n2);
				$.add(n1, $.node("span", "hl-easylist-option-button" + theme, text));

				$.on(n2, "change", on_option_change.filter_visibility);

				return n1;
			};
			$.add(n4, fn(0, "Show all"));
			$.add(n4, fn(1, "Hide bad"));
			$.add(n4, fn(2, "Only show matches"));


			$.add(n2, n3 = $.node("div", "hl-easylist-option-row"));
			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));
			$.add(n4, $.node("span", "hl-easylist-option-title", "Custom filters:"));

			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));

			$.add(n4, n5 = $.node("textarea", "hl-easylist-option-textarea" + theme));
			n5.value = settings.custom_filters;
			n5.wrap = "off";
			n5.spellcheck = false;
			$.on(n5, "change", on_option_change.custom_filters);
			$.on(n5, "input", on_option_change.custom_filters_input);


			$.add(n2, n3 = $.node("div", "hl-easylist-option-row"));
			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));
			$.add(n4, $.node("span", "hl-easylist-option-title", "Custom links:"));
			$.add(n4, $.node_simple("br"));
			$.add(n4, n5 = $.node("div", "hl-easylist-option-title-sub"));
			$.add(n5, $.node("div", "hl-easylist-option-title-sub-text", "Display a list of links from an external source"));

			$.add(n3, n4 = $.node("div", "hl-easylist-option-cell"));

			$.add(n4, n5 = $.node("textarea", "hl-easylist-option-textarea" + theme));
			n5.value = custom_links_text;
			n5.wrap = "off";
			n5.spellcheck = false;
			$.on(n5, "change", on_option_change.custom_links);
			$.on(n5, "input", on_option_change.custom_links_input);

			$.add(n1, $.node("div", "hl-easylist-title-line"));

			return n1;
		};
		var create_gallery_nodes = function (data, index, domain) {
			var url = CreateURL.to_gallery(data, domain),
				theme = Theme.classes,
				n1, n2, n3, n4, n5, n6, n7, i, t;

			n1 = $.node("div", "hl-easylist-item" + theme);
			n1.setAttribute("data-hl-index", index);
			n1.setAttribute("data-hl-gid", data.gid);
			if (data.token !== null) n1.setAttribute("data-hl-token", data.token);
			n1.setAttribute("data-hl-rating", data.rating);
			n1.setAttribute("data-hl-date-uploaded", data.upload_date);
			n1.setAttribute("data-hl-category", data.category.toLowerCase());
			n1.setAttribute("data-hl-domain", domain);

			$.add(n1, n2 = $.node("div", "hl-easylist-item-table-container" + theme));
			$.add(n2, n3 = $.node("div", "hl-easylist-item-table" + theme));
			n2 = n3;
			$.add(n2, n3 = $.node("div", "hl-easylist-item-row" + theme));
			$.add(n3, n4 = $.node("div", "hl-easylist-item-cell hl-easylist-item-cell-image" + theme));

			// Image
			$.add(n4, n5 = $.link(url, "hl-easylist-item-image-container" + theme));

			$.add(n5, n6 = $.node("div", "hl-easylist-item-image-outer" + theme));

			if (data.thumbnail !== null) {
				$.add(n6, n7 = $.node("img", "hl-easylist-item-image" + theme));
				$.on(n7, "error", on_thumbnail_error);
				n7.alt = "";

				API.get_thumbnail(data, $.bind(function (err, url) {
					if (err === null) {
						this.src = url;
					}
					else {
						var par = this.parentNode;
						if (par !== null) {
							par.style.width = "100%";
							par.style.height = "100%";
						}
					}
				}, n7));
			}
			else {
				n6.style.width = "100%";
				n6.style.height = "100%";
			}

			$.add(n6, $.node("span", "hl-easylist-item-image-index" + theme, "#" + (index + 1)));


			// Main content
			$.add(n3, n4 = $.node("div", "hl-easylist-item-cell" + theme));

			$.add(n4, n5 = $.node("div", "hl-easylist-item-title" + theme));

			t = UI.button_text(domain);
			$.add(n5, n6 = $.link(url, "hl-easylist-item-title-tag-link" + theme));
			$.add(n6, $.node("span", "hl-easylist-item-title-tag-link-text", t));
			n6.setAttribute("data-hl-original", t);

			$.add(n5, n6 = $.link(url, "hl-easylist-item-title-link" + theme, data.title));
			n6.setAttribute("data-hl-original", n6.textContent);

			if (data.title_jpn !== null) {
				$.add(n4, n5 = $.node("span", "hl-easylist-item-title-jp" + theme, data.title_jpn));
				n5.setAttribute("data-hl-original", n5.textContent);
			}

			$.add(n4, n5 = $.node("div", "hl-easylist-item-upload-info" + theme));
			$.add(n5, $.tnode("Uploaded by "));
			$.add(n5, n6 = $.link(CreateURL.to_uploader(data, domain), "hl-easylist-item-uploader" + theme, data.uploader));
			n6.setAttribute("data-hl-original", n6.textContent);
			$.add(n5, $.tnode(" on "));
			$.add(n5, $.node("span", "hl-easylist-item-upload-date" + theme, UI.format_date(new Date(data.upload_date))));

			$.add(n4, n5 = $.node("div", "hl-easylist-item-tags" + theme));

			n6 = create_full_tags(domain, data, theme);
			$.add(n5, n6[0]);
			if (!n6[1]) {
				$.on(n1, "mouseover", on_gallery_mouseover);
			}


			// Right sidebar
			$.add(n3, n4 = $.node("div", "hl-easylist-item-cell hl-easylist-item-cell-side" + theme));

			$.add(n4, n5 = $.node("div", "hl-easylist-item-info" + theme));

			$.add(n5, n6 = $.link(CreateURL.to_category(data, domain),
				"hl-easylist-item-info-button hl-button hl-button-eh hl-button-" + Helper.category(data.category).short + theme
			));
			$.add(n6, $.node("div", "hl-noise", Helper.category(data.category).name));


			$.add(n5, n6 = $.node("div", "hl-easylist-item-info-item hl-easylist-item-info-item-rating" + theme));
			$.add(n6, n7 = $.node("div", "hl-stars-container"));
			$.add(n7, UI.create_rating_stars(data.rating));
			if (data.rating >= 0) {
				$.add(n6, $.node("span", "hl-easylist-item-info-light", "(Avg: " + data.rating.toFixed(2) + ")"));
			}
			else {
				n7.classList.add("hl-stars-container-na");
				$.add(n6, $.node("span", "hl-easylist-item-info-light", "(n/a)"));
			}

			$.add(n5, n6 = $.node("div", "hl-easylist-item-info-item hl-easylist-item-info-item-files" + theme));
			i = data.file_count;
			$.add(n6, $.node("span", "", i + " image" + (i === 1 ? "" : "s")));
			if (data.total_size >= 0) {
				$.add(n6, $.node_simple("br"));
				i = (data.total_size / 1024 / 1024).toFixed(2).replace(/\.?0+$/, "");
				$.add(n6, $.node("span", "hl-easylist-item-info-light", "(" + i + " MB)"));
			}

			// Highlight
			update_filters(n1, data, true, false);

			return n1;
		};
		var create_full_tags = function (domain, data, theme) {
			var n1 = $.node("div", "hl-easylist-item-tag-table" + theme),
				domain_type = domain_info[domain].type,
				full_domain = domain_info[domain].g_domain,
				namespace_style = "",
				all_tags, namespace, tags, n2, n3, n4, i, ii;

			if (data.full && Object.keys(data.tags_ns).length > 0) {
				all_tags = data.tags_ns;
			}
			else {
				all_tags = { "": data.tags };
			}

			for (namespace in all_tags) {
				tags = all_tags[namespace];

				$.add(n1, n2 = $.node("div", "hl-easylist-item-tag-row" + theme));

				if (namespace !== "") {
					namespace_style = " hl-tag-namespace-" + namespace.replace(/\ /g, "-") + theme;
					$.add(n2, n3 = $.node("div", "hl-easylist-item-tag-cell hl-easylist-item-tag-cell-label" + theme));
					$.add(n3, n4 = $.node("span", "hl-tag-namespace-block hl-tag-namespace-block-no-outline" + namespace_style));
					$.add(n4, $.node("span", "hl-tag-namespace", namespace));
					$.add(n3, $.tnode(":"));
				}

				$.add(n2, n3 = $.node("div", "hl-easylist-item-tag-cell" + theme));
				n2 = n3;

				for (i = 0, ii = tags.length; i < ii; ++i) {
					$.add(n2, n3 = $.node("span", "hl-tag-block" + namespace_style));
					$.add(n3, n4 = $.link(CreateURL.to_tag(tags[i], domain_type, full_domain),
						"hl-tag hl-tag-color-inherit hl-easylist-item-tag",
						tags[i]
					));
					n4.setAttribute("data-hl-original", n4.textContent);

					if (i < ii - 1) $.add(n3, $.tnode(","));
				}
			}

			return [ n1, namespace !== "" ];
		};
		var add_gallery_update_timer = null;
		var add_gallery = function (content_index, entry, index, force_reorder) {
			var data = API.get_gallery(entry.namespace, entry.id),
				entries, n;

			if (data !== null) {
				entries = contents[content_index].entries;
				n = create_gallery_nodes(data, index, entry.domain);
				n.setAttribute("data-hl-easylist-item-parity", (contents[content_index].visible % 2) === 0 ? "odd" : "even");

				Main.insert_custom_fonts();

				$.add(contents[content_index].container, n);

				entry.node = n;
				entries.push(entry);
				++contents[content_index].visible;

				if (content_index === content_current) {
					if (
						force_reorder ||
						settings.group_by_category ||
						settings.group_by_filters ||
						settings.sort_by !== "thread" ||
						settings.filter_visibility !== 0
					) {
						if (add_gallery_update_timer !== null) clearTimeout(add_gallery_update_timer);
						add_gallery_update_timer = setTimeout(function () {
							update_ordering();
						}, 1);
					}
					else {
						set_empty(contents[content_index].visible === 0);
					}
				}
			}
		};
		var set_empty = function (empty) {
			if (empty_notification !== null) {
				var cls = "hl-easylist-empty-notification-visible";
				if (empty !== empty_notification.classList.contains(cls)) {
					empty_notification.classList.toggle(cls);
				}
			}
		};
		var get_options_visible = function () {
			return options_container.classList.contains("hl-easylist-options-visible");
		};
		var set_options_visible = function (visible) {
			var n = $(".hl-easylist-control-link-options", popup),
				cl, cls;

			if (n !== null) {
				cl = n.classList;
				cls = "hl-easylist-control-link-focus";
				if (cl.contains(cls) !== visible) cl.toggle(cls);
			}

			cl = options_container.classList;
			cls = "hl-easylist-options-visible";
			if (cl.contains(cls) !== visible) cl.toggle(cls);
		};

		var get_category_ordering = function () {
			var cat_order = {},
				i = 0,
				k;

			for (k in categories) {
				cat_order[categories[k].short] = i;
				++i;
			}
			cat_order[""] = i;

			return cat_order;
		};
		var get_node_filter_group = function (node) {
			var v = get_node_filters_bad(node);
			return (v > 0) ? -v : get_node_filters_good(node);
		};
		var get_node_filters_good = function (node) {
			return (parseInt(node.getAttribute("data-hl-filter-matches-title"), 10) || 0) +
				(parseInt(node.getAttribute("data-hl-filter-matches-uploader"), 10) || 0) +
				(parseInt(node.getAttribute("data-hl-filter-matches-tags"), 10) || 0);
		};
		var get_node_filters_bad = function (node) {
			return (parseInt(node.getAttribute("data-hl-filter-matches-title-bad"), 10) || 0) +
				(parseInt(node.getAttribute("data-hl-filter-matches-uploader-bad"), 10) || 0) +
				(parseInt(node.getAttribute("data-hl-filter-matches-tags-bad"), 10) || 0);
		};
		var get_node_category_group = function (node, ordering) {
			var k = node.getAttribute("data-hl-category") || "";
			return ordering[k in ordering ? k : ""];
		};
		var update_display_mode = function (first) {
			var mode = display_mode_names[settings.display_mode] || "",
				cl = content_container.classList,
				i, ii;

			if (!first) {
				for (i = 0, ii = display_mode_names.length; i < ii; ++i) {
					cl.remove("hl-easylist-" + display_mode_names[i]);
				}
			}

			cl.add("hl-easylist-" + mode);
		};
		var update_ordering = function () {
			var items = [],
				mode = settings.sort_by,
				visibility = settings.filter_visibility,
				show = true,
				content_index = content_current,
				entries = contents[content_index].entries,
				items_container = contents[content_index].container,
				current_visible_count = 0,
				ordering, base_array, item, attr, cat_order, n, n2, i, ii;

			// Grouping
			if (settings.group_by_filters) {
				if (settings.group_by_category) {
					cat_order = get_category_ordering();
					base_array = function (node) {
						return [ get_node_category_group(node, cat_order), get_node_filter_group(node) ];
					};
					ordering = [ 1, -1 ];
				}
				else {
					base_array = function (node) {
						return [ get_node_filter_group(node) ];
					};
					ordering = [ -1 ];
				}
			}
			else if (settings.group_by_category) {
				cat_order = get_category_ordering();
				base_array = function (node) {
					return [ get_node_category_group(node, cat_order) ];
				};
				ordering = [ 1 ];
			}
			else {
				base_array = function () { return []; };
				ordering = [];
			}

			// Iterate
			attr = node_sort_order_keys[mode in node_sort_order_keys ? mode : "thread"];
			ordering.push(attr[1], 1);
			attr = attr[0];
			for (i = 0, ii = entries.length; i < ii; ++i) {
				n = entries[i].node;
				item = {
					order: base_array(n),
					node: n
				};
				item.order.push(
					parseFloat(n.getAttribute(attr)) || 0,
					parseFloat(n.getAttribute("data-hl-index")) || 0
				);
				items.push(item);
			}

			// Sort
			items.sort(function (a, b) {
				var x, y, i, ii;
				a = a.order;
				b = b.order;
				for (i = 0, ii = a.length; i < ii; ++i) {
					x = a[i];
					y = b[i];
					if (x < y) return -ordering[i];
					if (x > y) return ordering[i];
				}
				return 0;
			});

			// Re-insert
			// Maybe eventually add labels
			for (i = 0, ii = items.length; i < ii; ++i) {
				n = items[i].node;
				n2 = $(".hl-easylist-item-image-index", n);

				$.add(items_container, n);

				if (visibility === 1) {
					show = (get_node_filters_bad(n) === 0);
				}
				else if (visibility === 2) {
					show = (get_node_filters_bad(n) === 0 && get_node_filters_good(n) > 0);
				}

				if (show) {
					n.setAttribute("data-hl-easylist-item-parity", (current_visible_count % 2) === 0 ? "odd" : "even");
					n.classList.remove("hl-easylist-item-hidden");
					++current_visible_count;

					if (n2 !== null) n2.textContent = "#" + current_visible_count;
				}
				else {
					n.setAttribute("data-hl-easylist-item-parity", "hidden");
					n.classList.add("hl-easylist-item-hidden");

					if (n2 !== null) n2.textContent = "#";
				}
			}

			contents[content_index].visible = current_visible_count;
			set_empty(current_visible_count === 0);
		};
		var reset_filter_state = function (node, content_node) {
			content_node.textContent = node.getAttribute("data-hl-original") || "";
			node.classList.remove("hl-filter-good");
			node.classList.remove("hl-filter-bad");
		};
		var update_filters_targets = [
			[ ".hl-easylist-item-title-link,.hl-easylist-item-title-jp", "title" ],
			[ ".hl-easylist-item-uploader", "uploader" ],
			[ ".hl-easylist-item-tag", "tags" ],
		];
		var update_filters = function (node, data, first, tags_only) {
			var target, nodes, mode, results, link, bad, hl, n, i, ii, j, jj;

			for (i = (tags_only ? 2 : 0), ii = update_filters_targets.length; i < ii; ++i) {
				target = update_filters_targets[i];
				nodes = $$(target[0], node);
				mode = target[1];
				results = [];
				for (j = 0, jj = nodes.length; j < jj; ++j) {
					n = nodes[j];
					if (!first) reset_filter_state(n, n);
					Filter.highlight(mode, n, data, Filter.None, results, custom_filters);
				}

				bad = 0;
				for (j = 0, jj = results.length; j < jj; ++j) {
					if (results[j].flags.bad) ++bad;
				}

				node.setAttribute("data-hl-filter-matches-" + mode, results.length - bad);
				node.setAttribute("data-hl-filter-matches-" + mode + "-bad", bad);
			}

			if (!tags_only) {
				link = $(".hl-easylist-item-title-link", node);
				n = $(".hl-easylist-item-title-tag-link>span", node);

				if (link !== null && n !== null) {
					if (!first) reset_filter_state(n.parentNode, n);

					link = link.cloneNode(true);
					if ((hl = Filter.check(link, data, custom_filters))[0] !== Filter.None) {
						Filter.highlight_tag(n.parentNode, link, hl);
					}
				}
			}
		};
		var update_all_filters = function () {
			var content_index = content_current,
				entries = contents[content_index].entries,
				entry, data, i, ii;

			for (i = 0, ii = entries.length; i < ii; ++i) {
				entry = entries[i];
				data = API.get_gallery(entry.namespace, entry.id);
				if (data !== null) {
					update_filters(entries[i].node, data, false, false);
				}
			}

			// Update order
			if (settings.group_by_filters || settings.filter_visibility !== 0) {
				update_ordering();
			}
		};
		var load_filters = function () {
			custom_filters = Filter.parse(settings.custom_filters, undefined);
		};
		var add_links = function (links) {
			var link, id, id_key, entry, i, ii;

			for (i = 0, ii = links.length; i < ii; ++i) {
				link = links[i];
				id = Helper.get_id_from_node(link);
				if (id !== null) {
					id_key = id[0] + "_" + id[1];
					if (data_map[id_key] === undefined) {
						entry = new Entry(Helper.get_domain(link.href || "") || domains.exhentai, id[0], id[1]);
						queue.push(entry);
						data_map[id_key] = entry;
					}
				}
			}

			if (queue.length > 0 && queue_timer === null) {
				on_timer();
			}
		};

		var set_content_index = function (content_index) {
			if (content_index === content_current) return;

			var node = contents[content_current].container,
				par = node.parentNode,
				next = node.nextSibling;

			if (par !== null) {
				content_current = content_index;

				$.remove(node);

				node = contents[content_current].container;
				$.before(par, next, node);

				update_all_filters();
				update_ordering();
			}
		};

		var enable_custom_links = function (text) {
			custom_links = [];
			custom_links_map = {};
			custom_links_text = text;
			contents[1].entries = [];
			contents[1].container.innerHTML = "";

			if (text.length === 0) {
				set_content_index(0);
			}
			else {
				set_content_index(1);
				parse_custom_urls(text);
			}
		};
		var parse_custom_urls = function (text) {
			var urls = Linkifier.parse_text_for_urls(text),
				info, i, ii;

			for (i = 0, ii = urls.length; i < ii; ++i) {
				info = Helper.get_url_info(urls[i]);
				if (info !== null) {
					parse_custom_url_info(i, info);
				}
			}
		};
		var parse_custom_url_info = function (index, info) {
			API.get_gallery_from_link_info(info, function (err, data) {
				if (err === null) {
					var key = data.type + "_" + data.gid,
						entry;

					if (custom_links_map[key] === undefined) {
						entry = new Entry(info.domain, data.type, data.gid);
						custom_links_map[key] = entry;
						add_gallery(1, entry, index, true);
					}
				}
			});
		};

		var on_option_change = {
			sort_by: function () {
				settings.sort_by = this.value;
				settings_save();
				update_ordering();
			},
			group_by_category: function () {
				settings.group_by_category = this.checked;
				settings_save();
				update_ordering();
			},
			group_by_filters: function () {
				settings.group_by_filters = this.checked;
				settings_save();
				update_ordering();
			},
			display_mode: function () {
				settings.display_mode = parseInt(this.value, 10) || 0;
				settings_save();
				update_display_mode(false);
			},
			filter_visibility: function () {
				settings.filter_visibility = parseInt(this.value, 10) || 0;
				settings_save();
				update_ordering();
			},
			custom_filters: function () {
				if (settings.custom_filters !== this.value) {
					settings.custom_filters = this.value;
					settings_save();
					load_filters();
					update_all_filters();
				}
			},
			custom_filters_input: function () {
				var node = this;
				if (on_option_change.custom_filters_input_delay_timer !== null) {
					clearTimeout(on_option_change.custom_filters_input_delay_timer);
				}
				on_option_change.custom_filters_input_delay_timer = setTimeout(
					function () {
						on_option_change.custom_filters_input_delay_timer = null;
						on_option_change.custom_filters.call(node);
					},
					1000
				);
			},
			custom_filters_input_delay_timer: null,
			custom_links: function () {
				var t = this.value.trim();
				if (t !== custom_links_text) {
					enable_custom_links(t);
				}
			},
			custom_links_input: function () {
				var node = this;
				if (on_option_change.custom_links_input_delay_timer !== null) {
					clearTimeout(on_option_change.custom_links_input_delay_timer);
				}
				on_option_change.custom_links_input_delay_timer = setTimeout(
					function () {
						on_option_change.custom_links_input_delay_timer = null;
						on_option_change.custom_links.call(node);
					},
					1000
				);
			},
			custom_links_input_delay_timer: null
		};
		var on_gallery_mouseover = function () {
			$.off(this, "mouseover", on_gallery_mouseover);

			var node = this,
				gid, token, data, domain, g_domain;

			if (
				(gid = this.getAttribute("data-hl-gid")) &&
				(token = this.getAttribute("data-hl-token")) &&
				(data = API.get_ehentai_gallery(gid, token)) !== null &&
				(domain = this.getAttribute("data-hl-domain")) &&
				(g_domain = domain_info[domain].g_domain)
			) {
				API.get_ehentai_gallery_full(g_domain, data, function (err, data) {
					var tags_container, n;

					if (
						err === null &&
						(tags_container = $(".hl-easylist-item-tags", node)) !== null
					) {
						n = create_full_tags(domain, data, Theme.classes);
						tags_container.textContent = "";
						$.add(tags_container, n[0]);

						update_filters(node, data, false, true);
					}
				});
			}
		};
		var on_thumbnail_error = function () {
			$.off(this, "error", on_thumbnail_error);

			var par = this.parentNode;
			if (par === null) return;
			par.style.width = "100%";
			par.style.height = "100%";
			this.style.visibility = "hidden";
		};
		var on_linkify = function (event) {
			add_links([ event.link ]);
		};
		var on_timer = function () {
			queue_timer = null;

			var new_entries = queue.splice(0, 20),
				entries = contents[0].entries,
				i, ii;

			for (i = 0, ii = new_entries.length; i < ii; ++i) {
				add_gallery(0, new_entries[i], entries.length, true);
			}

			if (queue.length > 0) {
				queue_timer = setTimeout(on_timer, 50);
			}
		};
		var on_open_click = function (event) {
			if ($.is_left_mouse(event)) {
				open();

				event.preventDefault();
				return false;
			}
		};
		var on_close_click = function (event) {
			if ($.is_left_mouse(event)) {
				close();

				event.preventDefault();
				return false;
			}
		};
		var on_toggle_click = function (event) {
			if ($.is_left_mouse(event)) {
				if (is_open()) {
					close();
				}
				else {
					open();
				}

				event.preventDefault();
				return false;
			}
		};
		var on_options_click = function (event) {
			if ($.is_left_mouse(event)) {
				set_options_visible(!get_options_visible());

				event.preventDefault();
				return false;
			}
		};
		var on_overlay_click = function (event) {
			if ($.is_left_mouse(event)) {
				close();

				event.preventDefault();
				return false;
			}
		};

		// Public
		var get_saved_settings = function () {
			return Helper.json_parse_safe(Config.storage.getItem(settings_key), null);
		};
		var set_saved_settings = function (data) {
			if (data === null) {
				Config.storage.removeItem(settings_key);
			}
			else {
				Config.storage.setItem(settings_key, JSON.stringify(data));
			}
		};
		var ready = function () {
			Navigation.insert_link("normal", "Easy List", Main.homepage, " hl-nav-link-easylist", on_open_click);

			HeaderBar.insert_shortcut_icon(
				"panda",
				"H-links Easy List",
				Main.homepage,
				on_toggle_click,
				function (svg, svgns) {
					var path = $.node_ns(svgns, "path", "hl-header-bar-svg-panda-path");
					path.setAttribute("d",
						"M 16.633179,51.146308 c 3.64987,0.96291 4.964143,6.353343 5.848553,6.951214 1.803534,1.219209 16.129984,0.579826 16.129984,0.579826 1.197865,-11.724731 1.212833,-8.671318 2.95548,-16.59613 -1.989075,-1.34607 -5.333693,-2.23712 -5.797288,-4.88791 -0.463595,-2.65078 0.255088,-2.142681 0.187543,-6.314371 -1.439647,-2.768736 -2.204016,-6.03551 -2.500789,-9.43479 -3.024907,-1.751033 -6.026517,-0.494694 -6.433955,-5.297229 -0.353512,-4.166916 6.132756,-5.138818 9.747309,-7.5194007 7.077373,-8.28015298 12.684056,-7.86614927 18.26733,-7.86614927 5.583275,0 12.190976,3.76366917 17.585988,11.22034497 6.53222,9.028459 10.674317,18.629087 14.466281,30.044847 3.791954,11.41577 4.453617,21.459054 1.537854,31.769198 2.36821,0.77671 4.928378,1.009485 5.226735,3.950385 0.298366,2.94089 -1.267399,5.363996 -3.607729,5.963956 -2.34033,0.59995 -4.60182,-0.139224 -6.646539,-0.619694 -3.86217,3.77416 -9.011474,7.538043 -17.479555,9.177123 -8.468078,1.63908 -26.453377,6.593222 -32.623916,6.30881 C 27.325926,98.291926 26.634713,94.42266 25.658825,90.03441 24.682937,85.64616 25.403148,82.440968 25.465957,78.696308 19.909553,79.123928 11.055576,79.654646 9.0799525,78.775913 5.9995252,77.405776 4.2346784,69.110754 5.7658643,59.974024 6.9338652,53.004454 12.660658,50.22377 16.633179,51.146308 z " +
						"M 47.316173,40.278702 c -1.977441,10.244331 -5.318272,21.474541 -5.662805,29.784036 -0.242507,5.848836 2.420726,7.5586 5.348383,2.078223 5.586237,-10.45706 7.896687,-21.139251 10.839979,-32.018641 -1.376342,0.732535 -2.33581,0.805482 -3.567752,1.104816 2.20065,-1.826801 1.797963,-1.259845 4.683397,-4.356147 3.702042,-3.972588 11.505701,-7.842675 15.187296,-4.490869 4.597776,4.185917 3.4537,13.920509 -0.431829,18.735387 -1.301987,5.219157 -3.278232,10.993981 -4.691055,14.211545 1.650129,0.951997 7.1775,2.647886 8.723023,6.808838 1.818473,4.895806 0.447993,8.335081 -3.207776,12.929618 8.781279,-6.214409 9.875004,-12.24852 10.586682,-20.251062 C 85.596887,59.244915 85.615915,54.42819 83.82437,47.181873 82.032825,39.935556 77.484187,30.527275 73.806105,23.780748 70.128023,17.034221 68.465076,12.376515 60.467734,7.5782428 54.534892,4.0186364 44.006601,5.3633006 39.960199,11.716546 c -4.046402,6.353245 -2.052295,11.417199 0.339979,17.673546 -0.06795,1.969646 -1.145015,4.295256 0.105508,5.751383 1.875243,-0.914979 2.772108,-1.957655 4.421995,-2.639606 -0.01451,1.529931 0.320921,4.192236 -1.17535,5.722167 1.758316,1.116252 1.80495,1.414307 3.663842,2.054666 z"
					);
					$.add(svg, path);
				}
			);
		};
		var open = function () {
			if (popup === null) {
				settings_load();
				create();
			}

			add_links(Linkifier.get_links_formatted());
			Linkifier.on("format", on_linkify);

			Popup.open(popup);
			$.scroll_focus(popup);
		};
		var close = function () {
			Popup.close(popup);

			set_options_visible(false);

			Linkifier.off("format", on_linkify);
		};
		var is_open = function () {
			return (popup !== null && Popup.is_open(popup));
		};

		// Exports
		return {
			get_saved_settings: get_saved_settings,
			set_saved_settings: set_saved_settings,
			ready: ready,
			open: open,
			close: close,
			is_open: is_open
		};

	})();
	var Popup = (function () {

		// Private
		var active = null,
			hovering_container = null;

		var on_stop_propagation = function (event) {
			if ($.is_left_mouse(event)) {
				event.stopPropagation();
			}
		};
		var on_overlay_event = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();
				event.stopPropagation();
				return false;
			}
		};

		// Public
		var create = function (class_ns, setup) {
			var theme = Theme.classes,
				container, list, obj, n1, n2, n3, n4, n5, n6, i, ii, j, jj, v;

			n1 = $.node("div", "hl-popup-overlay hl-" + class_ns + "-popup-overlay" + theme);
			$.add(n1, n2 = $.node("div", "hl-popup-aligner hl-" + class_ns + "-popup-aligner" + theme));
			$.add(n2, n3 = $.node("div", "hl-popup-align hl-" + class_ns + "-popup-align" + theme));
			$.add(n3, container = $.node("div", "hl-popup-content hl-" + class_ns + "-popup-content hl-hover-shadow" + theme));
			Theme.bg(container);

			$.on(n1, "mousedown", on_overlay_event);
			$.on(container, "click", on_stop_propagation);
			$.on(container, "mousedown", on_stop_propagation);

			if (typeof(setup) === "function") {
				setup.call(null, container);
			}
			else {
				$.add(container, n2 = $.node("div", "hl-popup-table" + theme));

				for (i = 0, ii = setup.length; i < ii; ++i) {
					list = setup[i];
					if (!Array.isArray(list)) list = [ list ];

					$.add(n2, n3 = $.node("div", "hl-popup-row" + theme));
					jj = list.length;
					if (jj > 1) {
						$.add(n3, n4 = $.node("div", "hl-popup-cell" + theme));
						$.add(n4, n5 = $.node("div", "hl-popup-table" + theme));
						$.add(n5, n3 = $.node("div", "hl-popup-row" + theme));
					}
					for (j = 0; j < jj; ++j) {
						obj = list[j];

						$.add(n3, n4 = $.node("div", "hl-popup-cell" + theme));

						if (obj.small) n4.classList.add("hl-popup-cell-small");
						if ((v = obj.align) !== undefined && v !== "left") n4.classList.add("hl-popup-cell-" + v);
						if ((v = obj.valign) !== undefined && v !== "top") n4.classList.add("hl-popup-cell-" + v);
						if (obj.body) {
							n3.classList.add("hl-popup-row-body");

							$.add(n4, n5 = $.node("div", "hl-popup-cell-size" + theme));
							$.add(n5, n6 = $.node("div", "hl-popup-cell-size-scroll" + theme));
							if (obj.padding !== false) {
								$.add(n6, n4 = $.node("div", "hl-popup-cell-size-padding" + theme));
							}
							else {
								n4 = n6;
							}
						}

						obj.setup.call(null, n4);
					}
				}
			}

			return n1;
		};
		var open = function (overlay) {
			if (active !== null && active.parentNode !== null) {
				$.remove(active);
			}
			d.documentElement.classList.add("hl-popup-overlaying");
			hovering(overlay);
			active = overlay;
		};
		var close = function (overlay) {
			d.documentElement.classList.remove("hl-popup-overlaying");
			if (overlay.parentNode !== null) {
				$.remove(overlay);
			}
			active = null;
		};
		var is_open = function (overlay) {
			return (overlay.parentNode !== null);
		};
		var hovering = function (node) {
			if (hovering_container === null) {
				hovering_container = $.node("div", "hl-hovering-elements");
				if (Config.is_tinyboard) {
					// Fix some poor choices of selectors (div.post:last) that infinity uses
					$.prepend(d.body, hovering_container);
				}
				else {
					$.add(d.body, hovering_container);
				}
			}
			$.add(hovering_container, node);
		};

		// Exports
		return {
			create: create,
			open: open,
			close: close,
			is_open: is_open,
			hovering: hovering
		};

	})();
	var Changelog = (function () {

		// Private
		var change_data = null,
			acquiring = false,
			popup = null;

		var parse = function (text) {
			var m = /^([\w\W]*)\n=+(\r?\n|$)/.exec(text),
				re_version = /^(\w+(?:\.\w+)+)\s*$/,
				re_change = /^(\s*)[\-\+]\s*(.+)/,
				versions = [],
				authors = null,
				author, author_map, changes, lines, line, i, ii;

			if (m !== null) text = m[1];

			lines = text.replace(/\r\n?/g, "\n").split("\n");
			for (i = 1, ii = lines.length; i < ii; ++i) {
				line = lines[i];
				if ((m = re_version.exec(line)) !== null) {
					authors = [];
					versions.push({
						version: m[1],
						authors: authors
					});
					author = "";
					author_map = {};
				}
				else if (authors !== null) {
					if ((m = re_change.exec(line)) !== null) {
						if (m[1].length === 0) {
							author = m[2];
						}
						else {
							changes = author_map[author];
							if (changes === undefined) {
								changes = [];
								author_map[author] = changes;
								authors.push({
									author: author,
									changes: changes
								});
							}
							changes.push(m[2]);
						}
					}
				}
			}

			if (versions.length === 0) {
				return { error: "No changelog data found" };
			}

			return {
				error: null,
				log_data: versions
			};
		};
		var display = function (container, theme) {
			var versions, authors, changes,
				e, n1, n2, n3, n4, n5, i, ii, j, jj, k, kk;

			if (change_data === null) {
				n1 = $.node("div", "hl-changelog-message-container");
				$.add(n1, $.node("div", "hl-changelog-message" + theme, "Loading changelog..."));
			}
			else if ((e = change_data.error) !== null) {
				n1 = $.node("div", "hl-changelog-message-container");
				$.add(n1, n2 = $.node("div", "hl-changelog-message hl-changelog-message-error" + theme));
				$.add(n2, $.node("strong", "hl-changelog-message-line" + theme, "Failed to load changelog:"));
				$.add(n2, $.node_simple("br"));
				$.add(n2, $.node("span", "hl-changelog-message-line" + theme, e));
			}
			else {
				n1 = $.node("div", "hl-changelog-entries");

				versions = change_data.log_data;
				for (i = 0, ii = versions.length; i < ii; ++i) {
					$.add(n1, n2 = $.node("div", "hl-changelog-entry" + theme));
					$.add(n2, $.node("div", "hl-changelog-entry-version" + theme, versions[i].version));
					$.add(n2, n3 = $.node("div", "hl-changelog-entry-users" + theme));

					authors = versions[i].authors;
					for (j = 0, jj = authors.length; j < jj; ++j) {
						$.add(n3, n4 = $.node("div", "hl-changelog-entry-user" + theme));
						$.add(n4, $.node("div", "hl-changelog-entry-user-name" + theme, authors[j].author));
						$.add(n4, n5 = $.node("ul", "hl-changelog-entry-changes" + theme));

						changes = authors[j].changes;
						for (k = 0, kk = changes.length; k < kk; ++k) {
							$.add(n5, $.node("li", "hl-changelog-entry-change" + theme, changes[k]));
						}
					}
				}
			}

			$.add(container, n1);
		};
		var acquire = function (callback) {
			HttpRequest({
				method: "GET",
				url: Module.url,
				onload: function (xhr) {
					if (xhr.status === 200) {
						callback(null, xhr.responseText);
					}
					else {
						callback("Bad response status " + xhr.status, null);
					}
				},
				onerror: function () {
					callback("Connection error", null);
				},
				onabort: function () {
					callback("Connection aborted", null);
				}
			});
		};

		var on_changelog_get = function (err, data) {
			if (err !== null) {
				change_data = { error: err };
			}
			else {
				change_data = parse(data);
			}

			if (popup !== null) {
				var n = $(".hl-changelog-content", popup);
				if (n !== null) {
					n.innerHTML = "";
					display(n, Theme.classes);
				}
			}
		};
		var on_close_click = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();
				close();
			}
		};
		var on_change_save = function () {
			config.general.changelog_on_update = this.checked;
			Config.save();
		};

		// Public
		var open = function (message) {
			if (!acquiring) {
				acquiring = true;
				acquire(on_changelog_get);
			}

			var theme = Theme.classes;

			popup = Popup.create("settings", [[{
				small: true,
				setup: function (container) {
					var cls = "";
					$.add(container, $.link(Main.homepage, "hl-settings-title" + theme, "H-links"));
					if (message !== null) {
						$.add(container, $.node("span", "hl-settings-title-info" + theme, message));
						if (/\s+$/.test(message)) {
							cls = " hl-settings-version-large";
						}
					}
					$.add(container, $.link(Module.url, "hl-settings-version" + cls + theme, Main.version.join(".")));
				}
			}, {
				align: "right",
				setup: function (container) {
					var n1, n2;
					$.add(container, n1 = $.node("label", "hl-settings-button" + theme));
					$.add(n1, n2 = $.node("input", "hl-settings-button-checkbox"));
					$.add(n1, $.node("span", "hl-settings-button-text hl-settings-button-checkbox-text", " Show on update"));
					$.add(n1, $.node("span", "hl-settings-button-text hl-settings-button-checkbox-text", " Don't show on update"));
					n2.type = "checkbox";
					n2.checked = config.general.changelog_on_update;
					$.on(n2, "change", on_change_save);

					$.add(container, n1 = $.link("#", "hl-settings-button" + theme));
					$.add(n1, $.node("span", "hl-settings-button-text", "Close"));
					$.on(n1, "click", on_close_click);
				}
			}], {
				body: true,
				padding: false,
				setup: function (container) {
					container.classList.add("hl-changelog-content");
					display(container, theme);
				}
			}]);

			$.on(popup, "click", on_close_click);
			Popup.open(popup);
		};
		var close = function () {
			if (popup !== null) {
				Popup.close(popup);
				popup = null;
			}
		};

		// Exports
		var Module = {
			url: "https://raw.githubusercontent.com/dnsev-h/h-links/stable/changelog",
			open: open,
			close: close
		};

		return Module;

	})();
	var HeaderBar = (function () {

		// Private
		var menu_nodes = [],
			shortcut_icons = [],
			header_bar = null,
			mode = null;

		var add_svg_icons = function (nodes) {
			var par = null,
				is_appchan = (mode === "appchanx"),
				next, color, n1, n2, i, ii;

			if (is_appchan) {
				if (
					(n1 = $("#shortcuts", header_bar.parentNode)) !== null &&
					(n2 = $("a#appchan-gal", n1) || $("a.a-icon", n1)) !== null
				) {
					par = n2.parentNode;
					next = n2;
				}
			}
			else if (mode === "4chanx3") {
				if (
					(n1 = $("#shortcuts", header_bar)) !== null &&
					(n2 = $("a.fa.fa-picture-o", n1) || $("a.fa", n1)) !== null &&
					(n2 = n2.parentNode) !== null
				) {
					par = n2.parentNode;
					next = n2.nextSibling;
				}
			}

			if (par === null) return;

			for (i = 0, ii = nodes.length; i < ii; ++i) {
				n2 = nodes[i];
				if (is_appchan) {
					n2.classList.add("hl-appchanx");
					n2.classList.add("a-icon");
					n2.classList.add("shortcut");
					n2.classList.add("fa");
					$.before(par, next, n2);
					n2.style.setProperty("background-image", "none", "important");
				}
				else {
					n1 = $.node("span", "shortcut brackets-wrap");
					$.add(n1, n2);
					$.before(par, next, n1);
				}

				color = Theme.get_computed_style(n2).color;
				if (color && (n1 = $("svg", n2)) !== null) {
					n1.setAttribute("style", "fill:" + color + ";");
				}
				n2.setAttribute("data-hl-color", color);
			}
		};

		var on_header_bar_detected = function (node) {
			header_bar = node;

			if ($("#shortcuts", node) !== null) {
				mode = "4chanx3";
			}
			else if ($("#shortcuts", node.parentNode) !== null) {
				mode = "appchanx";
				node = $("#hoverUI");
			}

			// Observer
			if (node !== null) {
				new MutationObserver(on_header_observe).observe(node, {
					childList: true,
					subtree: true
				});
			}

			// Icons
			if (shortcut_icons.length > 0) {
				add_svg_icons(shortcut_icons);
			}
		};
		var on_icon_mouseover = function () {
			var n = $("svg", this),
				c;

			if (n !== null) {
				c = this.getAttribute("data-hl-hover-color");
				if (!c) {
					c = Theme.get_computed_style(this).color;
					this.setAttribute("data-hl-hover-color", c);
				}
				n.style.fill = c;
			}
		};
		var on_icon_mouseout = function () {
			var n = $("svg", this);
			if (n !== null) {
				n.style.fill = this.getAttribute("data-hl-color");
			}
		};
		var on_menu_item_mouseover = function () {
			var entries = $$(".entry", this.parent),
				i, ii;
			for (i = 0, ii = entries.length; i < ii; ++i) {
				entries[i].classList.remove("focused");
			}
			this.classList.add("focused");
		};
		var on_menu_item_mouseout = function () {
			this.classList.remove("focused");
		};
		var on_menu_item_click = function (event) {
			if ($.is_left_mouse(event)) {
				event.preventDefault();
				d.documentElement.click();
			}
		};
		var on_body_observe = function (records) {
			var nodes, node, i, ii, j, jj;

			for (i = 0, ii = records.length; i < ii; ++i) {
				if ((nodes = records[i].addedNodes)) {
					for (j = 0, jj = nodes.length; j < jj; ++j) {
						node = nodes[j];
						if (node.id === "header-bar") {
							on_header_bar_detected(node);
							this.disconnect();
							return;
						}
					}
				}
			}
		};
		var on_header_observe = function (records) {
			var nodes, node, i, ii, j, jj;

			for (i = 0, ii = records.length; i < ii; ++i) {
				if ((nodes = records[i].addedNodes)) {
					for (j = 0, jj = nodes.length; j < jj; ++j) {
						node = nodes[j];
						if (node.id === "menu") {
							// Add menu items (if it's the main menu)
							if ($(".entry.delete-link", node) === null) {
								nodes = menu_nodes;
								for (j = 0, jj = nodes.length; j < jj; ++j) {
									$.add(node, nodes[j]);
								}
							}
							return;
						}
					}
				}
			}
		};

		// Public
		var ready = function () {
			var n = $("#header-bar");
			if (n !== null) {
				on_header_bar_detected(n);
			}
			else {
				new MutationObserver(on_body_observe).observe(d.body, { childList: true, subtree: false });
			}
		};
		var insert_shortcut_icon = function (namespace, title, url, on_click, svg_setup) {
			var svgns = "http://www.w3.org/2000/svg",
				n1, svg;

			n1 = $.link(url, "hl-header-bar-link hl-header-bar-link-" + namespace);
			n1.setAttribute("title", title);
			$.add(n1, svg = $.node_ns(svgns, "svg", "hl-header-bar-svg hl-header-bar-svg-" + namespace));
			svg.setAttribute("viewBox", "0 0 100 100");
			svg.setAttribute("svgns", svgns);
			svg.setAttribute("version", "1.1");
			svg_setup(svg, svgns);

			$.on(n1, "mouseover", on_icon_mouseover);
			$.on(n1, "mouseout", on_icon_mouseout);
			$.on(n1, "click", on_click);

			shortcut_icons.push(n1);

			if (header_bar !== null) add_svg_icons([ n1 ]);
		};
		var insert_menu_link = function (menu_node) {
			menu_node.classList.add("entry");
			menu_node.style.order = 112;

			$.on(menu_node, "mouseover", on_menu_item_mouseover);
			$.on(menu_node, "mouseout", on_menu_item_mouseout);
			$.on(menu_node, "click", on_menu_item_click);

			menu_nodes.push(menu_node);
		};

		// Exports
		return {
			ready: ready,
			insert_shortcut_icon: insert_shortcut_icon,
			insert_menu_link: insert_menu_link
		};

	})();
	var Navigation = (function () {

		// Private
		var Flags = {
			None: 0x0,
			Prepend: 0x1,
			Before: 0x2,
			After: 0x4,
			InnerSpace: 0x8,
			OuterSpace: 0x10,
			Brackets: 0x20,
			Mobile: 0x40,
			LowerCase: 0x80,
		};

		// Public
		var insert_link = function (mode, text, url, class_name, on_click) {
			var locations = [],
				first_mobile = true,
				container, flags, nodes, node, par, pre, next, cl, i, ii, n1, t;

			if (Config.is_4chan) {
				if (mode === "main") {
					nodes = $$("#navtopright,#navbotright");
					for (i = 0, ii = nodes.length; i < ii; ++i) {
						locations.push(nodes[i], Flags.OuterSpace | Flags.Brackets | Flags.Prepend);
					}
					nodes = $$("#settingsWindowLinkMobile");
					for (i = 0, ii = nodes.length; i < ii; ++i) {
						locations.push(nodes[i], Flags.Before);
					}
				}
				else {
					cl = d.documentElement.classList;
					if (
						!cl.contains("catalog-mode") &&
						!cl.contains("archive") &&
						$("#order-ctrl,#arc-list") === null
					) {
						nodes = $$("#ctrl-top,.navLinks");
						for (i = 0, ii = nodes.length; i < ii; ++i) {
							node = nodes[i];
							locations.push(node);
							if (node.classList.contains("mobile")) {
								locations.push(Flags.Mobile);
							}
							else {
								locations.push(Flags.OuterSpace | Flags.Brackets);
							}
						}
					}
				}
			}
			else if (Config.is_foolz) {
				nodes = $$(".letters");
				for (i = 0, ii = nodes.length; i < ii; ++i) {
					locations.push(nodes[i], Flags.InnerSpace | Flags.OuterSpace | Flags.Brackets);
				}
			}
			else if (Config.is_fuuka) {
				node = $("body>div:first-child");
				if (node !== null) {
					locations.push(node, Flags.InnerSpace | Flags.OuterSpace | Flags.Brackets);
				}
			}
			else if (Config.is_tinyboard) {
				nodes = $$(".boardlist");
				for (i = 0, ii = nodes.length; i < ii; ++i) {
					locations.push(nodes[i], Flags.InnerSpace | Flags.OuterSpace | Flags.Brackets | Flags.LowerCase);
				}
			}

			for (i = 0, ii = locations.length; i < ii; i += 2) {
				node = locations[i];
				flags = locations[i + 1];

				// Text
				t = text;
				if ((flags & Flags.InnerSpace) !== 0) t = " " + t + " ";

				// Create
				if ((flags & Flags.Mobile) !== 0) {
					par = node.parentNode;
					container = first_mobile ? node.previousSibling : node.nextSibling;
					if (container === null || !container.classList || !container.classList.contains("hl-nav-extras")) {
						container = $.node("div", "mobile hl-nav-extras-mobile");
					}

					$.add(container, n1 = $.node("span", "mobileib button hl-nav-button" + class_name));
					$.add(n1, $.link(url, "hl-nav-button-inner" + class_name, t));

					if (first_mobile) {
						$.before(par, node, container);
						first_mobile = false;
					}
					else {
						$.after(par, node, container);
					}
					node = container;
				}
				else {
					n1 = $.link(url, "hl-nav-link" + class_name, t);
				}
				$.on(n1, "click", on_click);

				// Case
				if ((flags & Flags.LowerCase) !== 0) {
					n1.style.textTransform = "lowercase";
				}

				// Relative
				if ((flags & Flags.Before) !== 0) {
					par = node.parentNode;
					next = node;
				}
				else if ((flags & Flags.After) !== 0) {
					par = node.parentNode;
					next = node.nextSibling;
				}
				else {
					par = node;
					next = ((flags & Flags.Prepend) !== 0) ? node.firstChild : null;
				}

				// Node
				$.before(par, next, n1);

				// Brackets
				if ((flags & Flags.Brackets) !== 0) {
					t = ((flags & Flags.OuterSpace) !== 0) ? "] " : "]";
					if (next !== null && next.nodeType === Node.TEXT_NODE) {
						next.nodeValue = t + next.nodeValue.replace(/^\s*\[/, "[");
					}
					else {
						$.after(par, n1, $.tnode(t));
					}

					pre = n1.previousSibling;
					t = ((flags & Flags.OuterSpace) !== 0) ? " [" : "[";
					if (pre !== null && pre.nodeType === Node.TEXT_NODE) {
						pre.nodeValue = pre.nodeValue.replace(/\]\s*$/, "]") + t;
					}
					else {
						$.before(par, n1, $.tnode(t));
					}
				}
			}
		};

		// Exports
		return {
			insert_link: insert_link
		};

	})();
	var Main = (function () {

		// Private
		var fonts_inserted = false,
			all_posts_reloaded = false;

		var reload_all_posts = function () {
			if (all_posts_reloaded) return;
			all_posts_reloaded = true;

			Linkifier.relinkify_posts(Post.get_all_posts(d));
		};

		var on_ready = function () {
			Debug.timer("init");

			if (!Config.ready()) return;
			Settings.ready();

			var style = $.node_simple("style"),
				updater;

			style.textContent = ".hl-button,.hl-star{display:inline-block}.hl-exsauce-link,.hl-exsauce-results-link{text-transform:lowercase}.hl-details-rating,.hl-details-side-box>div,.hl-exsauce-link,.hl-stars-container{white-space:nowrap}.hl-actions:before,.hl-changelog-message-container:before,.hl-easylist-item-image-container:after,.hl-popup-aligner:before,.hl-site-tag-bg-inner:after{content:\"\"}.hl-stars-container{position:relative;z-index:0}.hl-stars-container.hl-stars-container-na{opacity:.5}.hl-star-none{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAQAAADYBBcfAAAA5UlEQVR4AZ2VwQmEMBBFfx0S5iwWJCIhhSwhRXgSEesQCVuIzbgCGiLJ4GTzbupjvvqNYFcDd9KgcBFmHCczqEzUOC50meiC6Eo0hS2IG5Rc7HFE9HLRPkQrf6L+IXpQ/n0ZuJigxap7YEAhViEa+Pwr1tDwRZKHvu+asIi15ZZudRJpEyhty/CqDfkWVWixs9KOFpWg3AmuoDNMf/ivkEHLgwrDEr6M8hLWJBd6PiwfdASdjO9hFdZoVg91He2juWuuAF04PYPSrfKiS0WbK3FQF34bMcm03FST3/ItanCrho1/CT96LV7iyUEWwgAAAABJRU5ErkJggg==)}.hl-star-half{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAADA0lEQVR4AbWWA7PkQBRG+9m28ubZNta2bdu2bdu2bdu2rZ/w7e2t9DKTHVS66gySyZy6X5MZ2/JjWTwx1MWBTbW1ZslMy0YiictyI2zham8BGyu2ki5LWgqbclnDkg7wdbeEnTUDXW6smVBUN6yFH0L9bYRwqJZxLuXC2X10iAqxE8KDRLBmcfZq4IujC9OREu0MVydLLuQ01CzO8V10uLuzOLIS3eDuYiWEgzWLc9moRDw6UAbZyR7wcrcRwsOEZMy8akoM1YeQTe4VjctbS+H58crISfFEgI+dEArpUBWaEpKICv9jSu9oXN1RDq/P1iRqIDfNC8H+DkJmKI3/ENJndKnpgZFtAjCmQzD1Vygmdg/HirEp4LI35+vi/aUGRF3kpXubLBSRLhVz7MCsJFzfmM8HB/VXWYqwCnhlXPbxelN8ut4A+Rk+CA4wWHiYywhJcdniFdLQl4VlwPuMx8gr47Jvt+qR0NtQ4VIhUl0rezbwwaKhMTi3rhDPjlbAq9NV8O5CDXy4UhufrtYkoUF9uFCvTEnKmdBNhwsbC/HiRAW8PlMZ785zcWXkpXmS0F5NNtPQFUhImxJHuXTZyFg8PVwaL46XxcuT5fDqVDnkpnog2E9R+JCoSwSasbpIeLi3KB4fLIGnh4jDJZCT7IYgPzsl4VCzV5cFg8JxZ3se7u3Kx/3dBXiwJx/Zia4I9LXVNyIlkxfr7nU8cGhuAq6tz8DNTZm4uSULt4jMBGcE+tjqnW+m733NvXFuSQIuLE/CpVXJODgnDnP7hvDtCX6e1vqEQ02Oc3IHHxyfE41T82Kwe3IEhrf0hjhiuDmL7cnMWEWc7So6YN3AAGwcGoRJ7b3RuZqzWAKXOtmzc/IGbH6sIs5e1R2xopc3+tb5IRKyoYTkbM+ibKzZUhXhUKPj7F7FAT2qOkJUJc/Nn1HZ2TCdvNsfVhDuJ4INjrNWrjWal7D7oyqVxyRisYK0vqFxcom6TFH6T8SDDa3QcJl6pU0NPsrLxDPjW6xc2VDin+e/Azq4LxX5iaTWAAAAAElFTkSuQmCC)}.hl-star-full{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAADhElEQVR4AbWWg3IsURRF82zbtm3btm3btmPbtm3btvEJ+93TlbmVigapSVV3D3tlr4NEQdqf5VMVprPjdf0xXdrvSwsbTaClEzqDjnroaHkCTxPo+PpudIigp+UJFNK9OTcEr88O5inlqVOXIMqPxkL54RgRUJdrlYfOB8cGw1dzPnw05uH+0YFcq9x0fr01FqmOa5HisBpfbo7iWuWmU+/DTGR5bEKm+0bovJsqrVY+V6f5bDV/CLCfDyYj2nYD8v13Is93GyIsV+L73bEcKuYexBjNVYk7fj2cjFiHLSgO3c+OfSgK3oWCgG2IJOidMWK/z2vdaJBxa38/vL80DJ+ujWT1GsMSjIfB5zkCrCT8MMqjjrHjMMoi9qE4ZCcK/Dcj3HwZdN5MxOfrw/Hh8hC8PTcQL0/2xbUd3emejYFcqa5oxjyUZiHecjk1B6vXZqZwFyUTYJXxp1EVfwwVMQdRFr4LhYFbkOu1DunOK5BoswjRxnMQqjUVtp9G49nRXlw3V9rM2qKE1Pr1wE1UM9JIyQRYXdIRVMXuZyl3oiiIAb3XIcNlOZIYMMZ4Nlx+TcDLU/3Er7+G0PvHBkHr9RSEma2kBqGakUZKJsAqonejNGw7CgM2IsdrDdKdlsFfexZUH43EnQO9G8GkWNDf7oylbqQGoZqRRkpGMJaO6fZdh2z3lQgymIvP14ZChsXOoeTcV5i991OZto3UIFQz0igkE2Aeq5HhvAxaL/h4+PJ6yb5dRiPTdTWyPddRg1DNSCMlE2Aptovw6epQnqzN20XjxXik2C9DmtNy6kZqEKoZa6olSLZZiHjzuVB5NKJNy5wv67uH+sFLdQbizBcg0Wohtb7QjYnWC5BgOQ+xprMRZTgDLr/H49Y+PganZf/bd3YgwnRmIEJ/FqKMZsNTZRpUH48SutFDcTLCdacjRHMyApTH48WJPlyrzDp/XhsEf5XJCFKbAuefE/D2/EDeiW/ODYDj19HwVRwHr5+j8PVCH5m0cp1XtneD2fNhsHw9Aj+uDsTNPT35DUW/0PXdPRioL0yeDoLhg364tKWL1Fq5zgd7u8PgwUA8PtSzyXw1nteH+7pD53Y/3NvdnX9Oap13d3XjN2i8DxvNK//8nR3dpNLKdR5Y2hFn13WRaGs0THt2bWfsX9JRYq1cJ7s2DxMHbfRdiROKhYmB8oTy/Vde/Pf/AxrB4Rr+1b9fAAAAAElFTkSuQmCC)}.hl-star{width:1.2em;height:1.4em;margin-left:-.1em;margin-right:-.1em;margin-bottom:-.2em;background-repeat:no-repeat;background-size:cover;background-position:-.1em 0;position:relative}.hl-star-1{z-index:4;width:1.3em;background-position:0 0}.hl-star-2{z-index:3}.hl-star-3{z-index:2}.hl-star-4{z-index:1}.hl-star-5{z-index:0;width:1.3em}.hl-button{padding:.3em 1em;font-size:inherit;line-height:1.6em;color:#333;text-align:center;text-shadow:0 .08em .08em rgba(255,255,255,.75);vertical-align:middle;cursor:pointer;background-color:#f5f5f5;background-image:-webkit-gradient(linear,0 0,0 100%,from(#fff),to(#e6e6e6));background-image:-webkit-linear-gradient(top,#fff,#e6e6e6);background-image:-o-linear-gradient(top,#fff,#e6e6e6);background-image:linear-gradient(to bottom,#fff,#e6e6e6);background-image:-moz-linear-gradient(top,#fff,#e6e6e6);background-repeat:repeat-x;border:1px solid #bbb;border-color:#e6e6e6 #e6e6e6 #bfbfbf;border-bottom-color:#a2a2a2;border-radius:.3em;box-shadow:inset 0 .08em 0 rgba(255,255,255,.2),0 .08em .16em rgba(0,0,0,.05)}.hl-button-eh{font-family:'Source Sans Pro',Tahoma,sans-serif!important;font-weight:900;font-size:.86em;width:100%;padding:.15em 0;color:#FFF!important;box-shadow:0 0 .5em rgba(0,0,0,.5);text-shadow:.09em .09em 0 rgba(0,0,0,.5),0 0 .3em #000;-webkit-font-smoothing:antialiased}.hl-button-doujinshi{background-color:#840505!important;background-image:-khtml-gradient(linear,left top,left bottom,from(#f74040),to(#840505));background-image:-moz-linear-gradient(top,#f74040,#840505);background-image:-ms-linear-gradient(top,#f74040,#840505);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#f74040),color-stop(100%,#840505));background-image:-webkit-linear-gradient(top,#f74040,#840505);background-image:-o-linear-gradient(top,#f74040,#840505);background-image:linear-gradient(#f74040,#840505);border-color:#840505 #840505 hsl(0,92%,18.5%)}.hl-button-manga{background-color:#7a2800!important;background-image:-khtml-gradient(linear,left top,left bottom,from(#ff7632),to(#7a2800));background-image:-moz-linear-gradient(top,#ff7632,#7a2800);background-image:-ms-linear-gradient(top,#ff7632,#7a2800);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#ff7632),color-stop(100%,#7a2800));background-image:-webkit-linear-gradient(top,#ff7632,#7a2800);background-image:-o-linear-gradient(top,#ff7632,#7a2800);background-image:linear-gradient(#ff7632,#7a2800);border-color:#7a2800 #7a2800 #4c1900}.hl-button-artistcg{background-color:#7a6a00!important;background-image:-khtml-gradient(linear,left top,left bottom,from(#ffe95b),to(#7a6a00));background-image:-moz-linear-gradient(top,#ffe95b,#7a6a00);background-image:-ms-linear-gradient(top,#ffe95b,#7a6a00);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#ffe95b),color-stop(100%,#7a6a00));background-image:-webkit-linear-gradient(top,#ffe95b,#7a6a00);background-image:-o-linear-gradient(top,#ffe95b,#7a6a00);background-image:linear-gradient(#ffe95b,#7a6a00);border-color:#7a6a00 #7a6a00 #423900}.hl-button-gamecg{background-color:#273214!important;background-image:-moz-linear-gradient(top,#96ba58,#273214);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#96ba58),color-stop(100%,#273214));background-image:-webkit-linear-gradient(top,#96ba58,#273214);background-image:-o-linear-gradient(top,#96ba58,#273214);background-image:linear-gradient(#96ba58,#273214);border-color:#273214 #273214 #0b0e05}.hl-button-western{background-color:#4d7a00!important;background-image:-moz-linear-gradient(top,#c3ff5b,#4d7a00);background-image:-ms-linear-gradient(top,#c3ff5b,#4d7a00);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#c3ff5b),color-stop(100%,#4d7a00));background-image:-webkit-linear-gradient(top,#c3ff5b,#4d7a00);background-image:-o-linear-gradient(top,#c3ff5b,#4d7a00);background-image:linear-gradient(#c3ff5b,#4d7a00);border-color:#4d7a00 #4d7a00 #294200}.hl-button-non-h{background-color:#225358!important;background-image:-moz-linear-gradient(top,#73c1c8,#225358);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#73c1c8),color-stop(100%,#225358));background-image:-webkit-linear-gradient(top,#73c1c8,#225358);background-image:-o-linear-gradient(top,#73c1c8,#225358);background-image:linear-gradient(#73c1c8,#225358);border-color:#225358 #225358 hsl(185,44%,14.5%)}.hl-button-imageset{background-color:#0e3961!important;background-image:-moz-linear-gradient(top,#56a0e5,#0e3961);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#56a0e5),color-stop(100%,#0e3961));background-image:-webkit-linear-gradient(top,#56a0e5,#0e3961);background-image:-o-linear-gradient(top,#56a0e5,#0e3961);background-image:linear-gradient(#56a0e5,#0e3961);border-color:#0e3961 #0e3961 #071f35}.hl-button-cosplay{background-color:#3a2861!important;background-image:-moz-linear-gradient(top,#a996d3,#3a2861);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#a996d3),color-stop(100%,#3a2861));background-image:-webkit-linear-gradient(top,#a996d3,#3a2861);background-image:-o-linear-gradient(top,#a996d3,#3a2861);background-image:linear-gradient(#a996d3,#3a2861);border-color:#3a2861 #3a2861 #221839}.hl-button-asianporn{background-color:#740f51!important;background-image:-moz-linear-gradient(top,#ec78c3,#740f51);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#ec78c3),color-stop(100%,#740f51));background-image:-webkit-linear-gradient(top,#ec78c3,#740f51);background-image:-o-linear-gradient(top,#ec78c3,#740f51);background-image:linear-gradient(#ec78c3,#740f51);border-color:#740f51 #740f51 #43092e}.hl-button-misc{background-color:#353535!important;background-image:-moz-linear-gradient(top,#bfbfbf,#353535);background-image:-webkit-gradient(linear,left top,left bottom,color-stop(0,#bfbfbf),color-stop(100%,#353535));background-image:-webkit-linear-gradient(top,#bfbfbf,#353535);background-image:-o-linear-gradient(top,#bfbfbf,#353535);background-image:linear-gradient(#bfbfbf,#353535);border-color:#353535 #353535 hsl(321,0%,7.5%)}.hl-noise{color:#fff!important;margin:0 0 -.25em;padding:.125em 0;border-radius:.25em;position:relative;top:-.125em;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAMAAACd646MAAAAG1BMVEUAAAAfHx8/Pz9fX19/f3+fn5+/v7/f39////8NX9jPAAAACXRSTlMICAgICAgICAWHgaIXAAAErklEQVR42rWXOZIlNBBEn2rLd/8TYxBDANEsA78dGSpDqi0XGmDL04cKanRWhrWBvHqbUoemvHZscN5EVMV1KzTXzfMYtGVvkemNHVWiNitiC++ww3M5McNsFxaKkYcotEyUCKccLXvyXGFVfU/uYA2oWq/L9eapmsOmQd7BE7BcFEbWQp/jNE9jr6OjYYaAJ9K01LrCrCOc2Im2wVLsfjKHsHIttCn0DlYpU0tBSQMM9gRXpr8pLaRdGzUPpVefT1Dv7aFZ1wGL6OHPtRKg9BW1GCktCxq9ePZjhcsJCorYCOZgHdccomwrb1FL0fPQJ1lYuKfalqjeDVFMj+bUZ0d7BSHCPhnqeX0CKlqv11FlhbXAju0YmodWTo2otue1V84WPlT6PWtvRUGZS634CskGj4sogqJTDY1Bt8EM+VglKRWgR32nwhrIk/Gp/3sAAVen3hPvRpVwr5QD0eeqVgCNyvS6WrQC1JN+y7hA06qKLfC3wVWDrVZbvSDvjaTUKle0qBUZjWifntuN5TXI25oweKzOtEjZtmcclanhClMILtEmrT5ReKbUZzX6RxxBlTXdLZAdkRR2FbTPt17sU0kpLddnLH1IqaqoAMTcqZo6CgW/uytPtZVxIpYW0oNxH3gqZ0QQdyXeiOB6CyvaxQSgrDXkzlhvMePcySj71Oc4ilwVAoNiZb31dTzTI/vssNWxhzpvFHCRHQ0A4gOtOcLR7nNpQUV846ryYi3yVID1+U7sx/y4NSqzFqMVzUM+vt5fACVoFsyRZ+s2IIyISyaMjh5yyLqrIuZ8fY2LzKSe1698IojmNahUo891Vp3sQ1XfCMCbFUvrkBPvVhlD4Uoprw4dHFlltNSRs3wvnX6eF80inB6g57y2FR17T0QzDBifpe+y6rJImsiUcD9S+taxclb5axLwtnGkZwIct4K4pyCtJQ+PU1WjbBrDLD4V8R8FTW+ebzLq2A3GYWqRqDy0kQbPQ17jKefd8HUR+6BUP4Nq4KAOurFBzDzeOqL6+gkall6T97Nzj8/8epSOr4TVolhElXZGLi3oMjeqgjLPWhEkfRocTBqCzz4+q0vSCq+3geOpehTyeNvS0y2KmC7xVubpuz1XyZlVtH5CG7CKwvU5LiJNLTz0wfWUUsDqvhbRx4toKfokNMU2rlZ55nrP4TFleXOqqNDv9d19UPXxKTgvwozCG/WppSPrIRYAPXiCiWpjXe6cRtTu/8zUfNtISXScQdKWhuiIsocNZmdwoFQ5TN2VitkprVX7lsJzDlChARzENZy/mcc76duguKmZnfaMBw9Apwza2vGGiarj044exFsCAbUMNsB+ZcA+6oc/iR4iumKrv+NbvtOP/igH3yGB/rwzv1FkKHXVXhj1aEX0UJoFOeAAdME5xZLdoxHoVYiKNT5h3TOeqveGpihwRG12PKPIqH1cCjG8+OB1k4gQRnV2dVRRFKKA4strjYMqZQTK4tRRn08BBMT+d+aDD+iE14LKqRW+4Nr/ghNniexqONNKuyDiaXRTo4JiYIl22ZlDJ+/DxvsvHj9OBtW9d2alRrtAFTeiU5aD0UJEZIu2obEpQPlgYb7+2y84P1jASwAjowAAAABJRU5ErkJggg==)}.hl-exsauce-hover-link{text-decoration:none!important}a.hl-exsauce-link.hl-exsauce-link-disabled{text-decoration:line-through!important;cursor:default!important}.hl-exsauce-results{display:table;max-width:100%;width:auto;margin:.25em 0;border-radius:.375em;background-color:rgba(0,0,0,.05);padding:.5em}.hl-exsauce-results.hl-exsauce-results-hidden{display:none}.hl-exsauce-results.hl-theme-dark{background-color:rgba(255,255,255,.05)}.hl-exsauce-results-sep{display:inline-block;margin:0 .5em}.hl-exsauce-results-link{text-decoration:none!important;vertical-align:top;margin:0 .375em}.hl-details,.hl-exsauce-hover{opacity:.93;font-size:inherit;margin:0;overflow:visible}.hl-exsauce-hover{display:block;position:fixed;z-index:993;padding:.5em;border-radius:.25em;width:auto}.hl-actions.hl-actions-hidden,.hl-exsauce-hover.hl-exsauce-hover-hidden{display:none}.hl-actions,.hl-actions:before{position:absolute;border-radius:.25em}.hl-actions{z-index:5;box-sizing:border-box;-moz-box-sizing:border-box}.hl-actions:before{display:block;left:0;top:0;bottom:0;right:0;background-color:rgba(0,0,0,.05)}.hl-actions.hl-theme-dark:before{background-color:rgba(255,255,255,.05)}.hl-actions[data-hl-actions-vpos=above]:not([data-hl-actions-hpos=left]),.hl-actions[data-hl-actions-vpos=above]:not([data-hl-actions-hpos=left]):before{border-bottom-left-radius:0}.hl-actions[data-hl-actions-vpos=below]:not([data-hl-actions-hpos=left]),.hl-actions[data-hl-actions-vpos=below]:not([data-hl-actions-hpos=left]):before{border-top-left-radius:0}.hl-actions[data-hl-actions-vpos=above]:not([data-hl-actions-hpos=right]),.hl-actions[data-hl-actions-vpos=above]:not([data-hl-actions-hpos=right]):before{border-bottom-right-radius:0}.hl-actions[data-hl-actions-vpos=below]:not([data-hl-actions-hpos=right]),.hl-actions[data-hl-actions-vpos=below]:not([data-hl-actions-hpos=right]):before{border-top-right-radius:0}.hl-actions-inner{position:relative;padding:.5em 0}.hl-actions-table{display:table}.hl-actions-table-row{display:table-row}.hl-actions-table-cell{display:table-cell;height:100%;vertical-align:middle}.hl-actions-table-cell:first-of-type{width:0;white-space:nowrap;text-align:right}.hl-actions-table-sep{height:.25em}.hl-actions-table-header{font-weight:700;padding:0 .25em 0 1em;line-height:1.325em}.hl-actions-option{padding:0 1em 0 .25em;line-height:1.325em;display:block}.hl-actions-option:hover{background-color:rgba(0,0,0,.05)}.hl-actions-option.hl-theme-dark:hover{background-color:rgba(255,255,255,.05)}.hl-details{display:block;position:fixed;z-index:994;padding:.5em;border-radius:.5em;text-align:center;width:60%;min-width:600px;box-sizing:border-box;-moz-box-sizing:border-box}.hl-site-tag,.hl-tag{position:relative;text-decoration:none!important}.hl-details.hl-details-hidden{display:none}.hl-details-thumbnail{float:left;margin-right:.625em;width:140px;height:200px;background-color:rgba(0,0,0,.03125);background-repeat:no-repeat;background-size:contain;background-position:center center}.hl-details-thumbnail.hl-details-thumbnail-full{background-size:cover;background-position:25% 0}.hl-details-thumbnail.hl-theme-dark{background-color:rgba(255,255,255,.03125)}.hl-details-side-panel{float:right;margin-left:.5em;font-size:1.0625em!important;line-height:1em!important}.hl-details-side-box{width:5.75em;font-size:.8em;padding:.5em 0;margin:.8em 0 .4em;border-radius:.5em;background-clip:padding-box;background-color:rgba(0,0,0,.125);box-shadow:0 0 .5em rgba(0,0,0,.125);text-shadow:0 .1em 0 rgba(255,255,255,.5)}.hl-details-side-box.hl-theme-dark{background-color:rgba(255,255,255,.125);box-shadow:0 0 .5em rgba(255,255,255,.125);text-shadow:0 .1em 0 rgba(0,0,0,.5)}.hl-details-side-box-error{color:#e00000}.hl-details-side-box-error.hl-theme-dark{color:#ff1f1f}.hl-details-title{font-size:1.5em!important;font-weight:700!important;text-shadow:.1em .1em .4em rgba(0,0,0,.15)!important;text-decoration:none!important}.hl-details-title-jp{margin-top:.25em;opacity:.5;font-size:1.1em;text-shadow:.1em .1em .5em rgba(0,0,0,.2)}.hl-details-title-jp.hl-theme-dark{text-shadow:.1em .1em .5em rgba(255,255,255,.2)}.hl-details-rating{text-align:center;display:inline-block;vertical-align:middle}.hl-details-file-size,.hl-details-rating-text{opacity:.65;font-size:.95em}.hl-details-upload-info{font-size:1em;margin:1em 0}.hl-details-uploader{font-size:1em!important;margin:0 .625em}.hl-details-upload-date{font-size:1em!important;margin-left:.625em}.hl-details-tag-block{font-size:1.075em!important;display:inline!important;line-height:1.4em}.hl-tag-block,.hl-tag-namespace-first{display:inline-block}.hl-details-tag-block-label{margin-right:.25em!important}.hl-details-clear{clear:both}.hl-tag-block{margin:0 .125em}.hl-tag{white-space:nobreak}.hl-tag.hl-tag-color-inherit{color:inherit!important}.hl-tag-block.hl-tag-block-last-of-namespace{margin-right:.5em}.hl-tag-block.hl-tag-block-last{margin-right:0}.hl-tag-namespace-first>.hl-tag-block{display:inline}.hl-tag-namespace-block{display:inline-block;margin:0 .125em}.hl-tag-namespace{display:inline-block;border:1px solid rgba(0,0,0,.4);border-radius:.25em;padding:0 .25em;line-height:normal}.hl-tag-namespace-block.hl-tag-namespace-block-no-outline>.hl-tag-namespace{border-style:none}.hl-tag-namespace-block.hl-theme-dark>.hl-tag-namespace{border-color:rgba(255,255,255,.4)}.hl-tag-namespace-block.hl-tag-namespace-language>.hl-tag-namespace{color:#6721c6}.hl-tag-namespace-block.hl-tag-namespace-group>.hl-tag-namespace{color:#9f8636}.hl-tag-namespace-block.hl-tag-namespace-artist>.hl-tag-namespace{color:#c47525}.hl-tag-namespace-block.hl-tag-namespace-parody>.hl-tag-namespace{color:#0ea79e}.hl-tag-namespace-block.hl-tag-namespace-character>.hl-tag-namespace{color:#288028}.hl-tag-namespace-block.hl-tag-namespace-male>.hl-tag-namespace{color:#0659ae}.hl-tag-namespace-block.hl-tag-namespace-female>.hl-tag-namespace{color:#e0338d}.hl-tag-namespace-block.hl-tag-namespace-language.hl-theme-dark>.hl-tag-namespace{color:#895cc6}.hl-tag-namespace-block.hl-tag-namespace-group.hl-theme-dark>.hl-tag-namespace{color:#e8c44f}.hl-tag-namespace-block.hl-tag-namespace-artist.hl-theme-dark>.hl-tag-namespace{color:#e89c4f}.hl-tag-namespace-block.hl-tag-namespace-parody.hl-theme-dark>.hl-tag-namespace{color:#21eda2}.hl-tag-namespace-block.hl-tag-namespace-character.hl-theme-dark>.hl-tag-namespace{color:#6ce769}.hl-tag-namespace-block.hl-tag-namespace-male.hl-theme-dark>.hl-tag-namespace{color:#23add0}.hl-tag-namespace-block.hl-tag-namespace-female.hl-theme-dark>.hl-tag-namespace{color:#e89cc4}.hl-actions-uploader.hl-filter-good,.hl-details-uploader.hl-filter-good,.hl-linkified-gallery.hl-filter-good,.hl-site-tag.hl-filter-good,.hl-tag.hl-filter-good{font-weight:700}.hl-filter-text{display:inline}.hl-site-tag{white-space:nowrap;display:inline-block;margin-right:.25em;outline:0!important}.hl-site-tag-bg,.hl-site-tag-bg-shadow{display:none;position:absolute;left:-.25em;top:-.25em;bottom:-.25em;right:-.25em;border-radius:.25em;pointer-events:none}.hl-site-tag.hl-site-tag-active>.hl-site-tag-bg-shadow{z-index:4}.hl-site-tag.hl-site-tag-active>.hl-site-tag-bg>.hl-site-tag-bg-inner,.hl-site-tag.hl-site-tag-active>.hl-site-tag-text{z-index:6}.hl-site-tag.hl-site-tag-active>.hl-site-tag-bg,.hl-site-tag.hl-site-tag-active>.hl-site-tag-bg-shadow{display:block}.hl-site-tag-bg-inner,.hl-site-tag-bg-inner:after{display:block;position:absolute;left:0;top:0;bottom:0;right:0;border-radius:.25em}.hl-popup-align,.hl-popup-aligner:before{display:inline-block;vertical-align:middle}.hl-site-tag-bg-inner:after{background-color:rgba(0,0,0,.05)}.hl-site-tag-bg-inner.hl-theme-dark:after{background-color:rgba(255,255,255,.05)}.hl-site-tag[data-hl-actions-vpos=above]>.hl-site-tag-bg,.hl-site-tag[data-hl-actions-vpos=above]>.hl-site-tag-bg-shadow,.hl-site-tag[data-hl-actions-vpos=above]>.hl-site-tag-bg>.hl-site-tag-bg-inner,.hl-site-tag[data-hl-actions-vpos=above]>.hl-site-tag-bg>.hl-site-tag-bg-inner:after{border-top-left-radius:0;border-top-right-radius:0}.hl-site-tag[data-hl-actions-vpos=below]>.hl-site-tag-bg,.hl-site-tag[data-hl-actions-vpos=below]>.hl-site-tag-bg-shadow,.hl-site-tag[data-hl-actions-vpos=below]>.hl-site-tag-bg>.hl-site-tag-bg-inner,.hl-site-tag[data-hl-actions-vpos=below]>.hl-site-tag-bg>.hl-site-tag-bg-inner:after{border-bottom-left-radius:0;border-bottom-right-radius:0}.hl-site-tag-text{position:relative}.hl-linkified{text-decoration:none!important}.hl-linkified.hl-linkified-error{font-style:italic}.hl-linkified-error-message{opacity:.75}.hl-nav-extras-mobile{text-align:center;margin:.5em 0}.hl-nav-link{cursor:pointer}.hl-hover-shadow{box-shadow:0 0 .125em 0 rgba(0,0,0,.5)}.hl-hover-shadow.hl-theme-dark{box-shadow:0 0 .125em 0 rgba(255,255,255,.5)}:root.hl-popup-overlaying,:root.hl-popup-overlaying body{overflow-x:hidden!important;overflow-y:hidden!important}.hl-popup-overlay{position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(255,255,255,.5);z-index:400;overflow-x:auto;overflow-y:scroll}.hl-popup-overlay.hl-theme-dark{background:rgba(0,0,0,.5)}.hl-popup-aligner{position:absolute;left:0;top:0;right:0;bottom:0;white-space:nowrap;line-height:0;text-align:center}.hl-popup-aligner:before{width:0;height:100%}.hl-popup-align{white-space:normal;line-height:normal;text-align:left;padding:1em;margin:0;width:800px;min-width:60%;max-width:100%;box-sizing:border-box;-moz-box-sizing:border-box}.hl-popup-content{display:block;padding:1em;margin:0;width:100%;border:none;box-sizing:border-box;-moz-box-sizing:border-box;position:relative;border-radius:.5em;overflow:visible}.hl-popup-table{display:table;width:100%;height:100%}.hl-popup-row{display:table-row;width:100%;height:0}.hl-popup-row.hl-popup-row-body,.hl-popup-row.hl-popup-row-body>.hl-popup-cell{height:100%}.hl-popup-cell{display:table-cell;width:100%;height:0;vertical-align:top;text-align:left}.hl-popup-cell.hl-popup-cell-small{width:0;white-space:nowrap}.hl-popup-cell.hl-popup-cell-center{text-align:center}.hl-popup-cell.hl-popup-cell-right{text-align:right}.hl-popup-cell.hl-popup-cell-middle{vertical-align:middle}.hl-popup-cell.hl-popup-cell-bottom{vertical-align:bottom}.hl-popup-cell-size{position:relative;width:100%;height:100%}.hl-popup-cell-size-scroll{position:absolute;left:0;top:0;right:0;bottom:0;overflow:auto}.hl-popup-cell-size-padding{position:relative;padding:.375em;width:100%;min-height:100%;box-sizing:border-box;-moz-box-sizing:border-box}.hl-settings-popup-align{min-height:80%;height:200px}.hl-settings-popup-content{position:relative;height:100%}.hl-settings-button{margin:0 .25em;display:inline-block!important;vertical-align:middle;padding:.25em;background:rgba(0,0,0,.05);border-radius:.2em;text-decoration:none!important;cursor:pointer;font-size:inherit!important;line-height:normal!important;white-space:nowrap!important}.hl-settings-button.hl-theme-dark{background:rgba(255,255,255,.05)}.hl-settings-button-checkbox,.hl-settings-button-checkbox+.riceCheck{margin:0!important;padding:0!important;vertical-align:middle}.hl-settings-button-checkbox-text{display:none}.hl-settings-button-checkbox:checked~.hl-settings-button-checkbox-text:nth-of-type(1),.hl-settings-button-checkbox:not(:checked)~.hl-settings-button-checkbox-text:nth-of-type(2){display:inline}.hl-settings-title{font-size:2em!important;font-weight:700!important;text-decoration:none!important}.hl-settings-version{margin:0 .25em;opacity:.9;vertical-align:75%;text-decoration:none!important;color:inherit!important}.hl-settings-title-info,.hl-settings-version.hl-settings-version-large{margin:0;font-size:1.8em;vertical-align:baseline;opacity:1}.hl-settings-heading{display:table;width:100%;padding:.25em 0}.hl-settings-heading>div{display:table-row;height:100%}.hl-settings-heading-cell{display:table-cell;height:100%;width:100%}.hl-settings-heading-title{vertical-align:top;text-align:left;font-size:1.5em;font-weight:700;font-family:sans-serif;white-space:nowrap;width:0}.hl-settings-heading-subtitle{vertical-align:bottom;text-align:right;padding-left:.5em;opacity:.6}.hl-settings-group{border:1px solid rgba(0,0,0,.2);border-radius:.25em;padding:.125em;box-sizing:border-box;-moz-box-sizing:border-box}.hl-settings-group.hl-theme-dark{border-color:rgba(255,255,255,.2)}.hl-settings-group+.hl-settings-heading{margin-top:.75em}.hl-settings-entry-table{display:table;width:100%;padding:.375em .25em;box-sizing:border-box;-moz-box-sizing:border-box}.hl-settings-entry-row{display:table-row;height:100%}.hl-settings-entry-cell{vertical-align:middle;text-align:left;display:table-cell;width:100%;height:100%}.hl-settings-entry-cell:last-of-type:not(:first-of-type){vertical-align:middle;text-align:right;width:0}.hl-settings-entry+.hl-settings-entry{border-top:.125em solid transparent}.hl-settings-entry:nth-child(even)>.hl-settings-entry-table{background-color:rgba(0,0,0,.05)}.hl-settings-entry:nth-child(odd)>.hl-settings-entry-table{background-color:rgba(0,0,0,.025)}.hl-settings-entry.hl-theme-dark:nth-child(even)>.hl-settings-entry-table{background-color:rgba(255,255,255,.05)}.hl-settings-entry.hl-theme-dark:nth-child(odd)>.hl-settings-entry-table{background-color:rgba(255,255,255,.025)}input.hl-settings-entry-input[type=text]{width:8em}button.hl-settings-entry-input,input.hl-settings-entry-input[type=text],select.hl-settings-entry-input{min-width:8em;box-sizing:border-box;-moz-box-sizing:border-box;padding:.0625em .125em!important;margin:0!important;font-size:inherit!important;font-family:inherit!important;line-height:1.3em!important}select.hl-settings-entry-input{width:auto;height:auto}label.hl-settings-entry-label{cursor:pointer;margin-bottom:0}.hl-settings-filter-guide-toggle{cursor:pointer;text-decoration:none!important}.hl-settings-filter-guide{margin-bottom:.25em;padding:.375em}.hl-settings-filter-guide:not(.hl-settings-filter-guide-visible){display:none}.hl-settings-popup-content ul{padding:0;margin:1em 0;list-style-type:disc!important}.hl-settings-popup-content ul>li{margin:0 .5em 0 2em}.hl-settings-popup-content ul>li+li{margin-top:1em}.hl-settings-popup-content ul>li.hl-settings-li-no-space{margin-top:0}.hl-settings-popup-content code{color:#000;background-color:#fff;font-family:Courier,monospace!important}.hl-settings-popup-content.hl-theme-dark code{color:#fff;background-color:#000;font-family:Courier,monospace!important}.hl-settings-color-input{padding:.25em!important;margin:0 1em 0 0!important;display:inline-block;vertical-align:middle!important;line-height:1.5em!important;height:2em!important;width:8em!important;box-sizing:border-box!important;-moz-box-sizing:border-box!important;cursor:text!important}.hl-settings-color-input:first-of-type{cursor:pointer!important}.hl-settings-color-input:last-of-type{width:11em!important}.hl-settings-export-textarea,textarea.hl-settings-entry-input{display:block;width:100%;height:15em;line-height:1.3em;padding:.5em!important;margin:0!important;box-sizing:border-box;-moz-box-sizing:border-box;resize:vertical;font-size:.9em!important;font-family:Courier,monospace!important}button.hl-settings-entry-input{float:right;padding:.125em .25em;margin:0;box-sizing:border-box;-moz-box-sizing:border-box;background-color:transparent;border:1px solid rgba(0,0,0,.25);border-radius:.25em;font-size:inherit;font-family:inherit;color:inherit;cursor:pointer}button.hl-settings-entry-input:hover{border-color:rgba(0,0,0,.5)}button.hl-settings-entry-input.hl-theme-dark{border-color:rgba(255,255,255,.25)}button.hl-settings-entry-input.hl-theme-dark:hover{border-color:rgba(255,255,255,.5)}.hl-settings-export-textarea{height:100%;resize:none}.hl-settings-export-textarea.hl-settings-export-textarea-error{border-color:#f00000!important;color:#f00000!important}.hl-settings-export-textarea.hl-settings-export-textarea-changed{color:#0080f0!important}.hl-settings-export-textarea.hl-settings-export-textarea-changed.hl-theme-dark{color:#80b0ff!important}.hl-settings-file-input{display:inline-block;display:none;visibility:hidden;opacity:0;width:0;height:0}.hl-settings-export-message{line-height:1.6em}.hl-settings-export-label{display:inline-block;margin:0;padding:0}.hl-settings-export-checkbox,.hl-settings-export-checkbox:checked~.hl-settings-export-label-text:first-of-type,.hl-settings-export-checkbox:not(:checked)~.hl-settings-export-label-text:not(:first-of-type){display:none}.hl-settings-export-label-text:first-of-type{opacity:.6}.hl-easylist-title{margin-left:-2em}.hl-easylist-title-text{display:inline-block;font-size:2em;font-weight:700;margin-left:1em}.hl-easylist-subtitle{display:inline-block;font-style:italic;opacity:.8;margin-left:2em}.hl-easylist-title-line{border-bottom:1px solid grey;margin:.5em 0}.hl-easylist-control-links{position:absolute;top:0;right:0}.hl-easylist-control-link{display:inline-block;padding:.5em;cursor:pointer;opacity:.5;text-decoration:none!important}.hl-easylist-empty-notification.hl-easylist-empty-notification-visible+.hl-easylist-items,.hl-easylist-empty-notification:not(.hl-easylist-empty-notification-visible),.hl-easylist-item.hl-easylist-item-hidden{display:none}.hl-easylist-control-link.hl-easylist-control-link-focus,.hl-easylist-control-link:hover{opacity:1}.hl-easylist-control-link+.hl-easylist-control-link{margin-left:.5em}.hl-easylist-empty-notification{text-align:center;font-size:2em;font-style:italic;padding:2em}.hl-easylist-items{border-radius:.5em;border:1px solid rgba(0,0,0,.25);box-sizing:border-box;-moz-box-sizing:border-box;overflow:hidden}.hl-easylist-items.hl-theme-dark{border:1px solid rgba(255,255,255,.25)}.hl-easylist-item{background-color:rgba(0,0,0,.03125)}.hl-easylist-item[data-hl-easylist-item-parity=even]{background-color:rgba(0,0,0,.0625)}.hl-easylist-item.hl-theme-dark{background-color:rgba(255,255,255,.03125)}.hl-easylist-item.hl-theme-dark[data-hl-easylist-item-parity=even]{background-color:rgba(255,255,255,.0625)}.hl-easylist-item-table-container{padding:.5em;position:relative;box-sizing:border-box;-moz-box-sizing:border-box}.hl-easylist-item-table{display:table;width:100%}.hl-easylist-item-row{display:table-row}.hl-easylist-item-cell{display:table-cell;width:100%;vertical-align:top;padding:0 .5em}.hl-easylist-item-cell.hl-easylist-item-cell-image,.hl-easylist-item-cell.hl-easylist-item-cell-side{width:0;padding:0}.hl-easylist-item-image-container{display:block;margin:0;padding:0;border:none;width:140px;height:200px;background-color:rgba(0,0,0,.03125);text-align:center;white-space:nowrap;line-height:0}.hl-easylist-item-image-container:after{display:inline-block;vertical-align:middle;width:0;height:100%}.hl-easylist-item-image-container.hl-theme-dark{background-color:rgba(255,255,255,.03125)}.hl-easylist-item-image-outer{display:inline-block;vertical-align:middle;position:relative;line-height:normal;white-space:normal}.hl-easylist-item-image{margin:0!important;padding:0!important;border:none!important;display:inline-block;vertical-align:middle;max-width:140px;max-height:200px}.hl-easylist-item-image-index{display:block;position:absolute;left:0;top:0;padding:.25em;color:#000;text-shadow:0 0 .125em #fff,0 0 .25em #fff}.hl-easylist-item-image-index.hl-theme-dark{color:#fff;text-shadow:0 0 .125em #000,0 0 .25em #000}.hl-easylist-item-info{display:inline-block;padding:0 0 .5em .5em;width:4.8em}.hl-easylist-item-info-item{font-size:.825em;margin-top:1em;text-align:center;max-width:100%;border-radius:.5em;padding:.375em 0;background-color:rgba(0,0,0,.125);box-shadow:0 0 .5em rgba(0,0,0,.125);text-shadow:0 .1em 0 rgba(255,255,255,.5)}.hl-easylist-item-tags,.hl-easylist-item-upload-info,.hl-easylist-option-group+.hl-easylist-option-group{margin-top:.5em}.hl-easylist-item-info-item.hl-theme-dark{background-color:rgba(255,255,255,.125);box-shadow:0 0 .5em rgba(255,255,255,.125);text-shadow:0 .1em 0 rgba(0,0,0,.5)}.hl-easylist-item-info-light{opacity:.8}.hl-easylist-item-info-button{text-decoration:none!important}.hl-easylist-item-title{font-size:1.5em;font-weight:700}.hl-easylist-item-title:hover{text-shadow:0 0 .25em #fff}.hl-easylist-item-title.hl-theme-dark:hover{text-shadow:0 0 .25em #000}.hl-easylist-item-title-link{text-decoration:none!important}.hl-easylist-item-title-tag-link{text-decoration:none!important;margin-right:.25em;display:none}.hl-easylist-item-title-jp{opacity:.5;font-size:1.1em;display:block}.hl-easylist-item-upload-date,.hl-easylist-item-uploader{font-weight:700;display:inline-block;padding:0 .25em}.hl-easylist-item-tag-table{display:table;width:100%}.hl-easylist-item-tag-row{display:table-row}.hl-easylist-item-tag-row+.hl-easylist-item-tag-row>.hl-easylist-item-tag-cell{padding-top:.25em}.hl-easylist-item-tag-cell{display:table-cell;width:100%}.hl-easylist-compact .hl-easylist-item-info-item.hl-easylist-item-info-item-files>:not(:first-child),.hl-easylist-compact .hl-easylist-item-info-item.hl-easylist-item-info-item-rating>:not(:first-child),.hl-easylist-compact .hl-easylist-item-title-jp,.hl-easylist-compact .hl-easylist-item-upload-info{display:none}.hl-easylist-item-tag-cell.hl-easylist-item-tag-cell-label{width:0;white-space:nowrap;text-align:right;padding-right:.25em}.hl-easylist-compact .hl-easylist-item-image-container{width:70px;height:100px}.hl-easylist-compact .hl-easylist-item-image{max-width:70px;max-height:100px}.hl-easylist-compact .hl-easylist-item-title{font-size:1em;line-height:1.25em;max-height:2.5em;overflow:hidden;position:relative}.hl-easylist-compact .hl-easylist-item-title:hover{overflow:visible;z-index:1}.hl-easylist-compact .hl-easylist-item-tags{font-size:.9em}.hl-easylist-compact .hl-easylist-item-tag-row+.hl-easylist-item-tag-row>.hl-easylist-item-tag-cell{padding-top:0}.hl-easylist-compact .hl-easylist-item-tag-table{display:block;line-height:1.4em}.hl-easylist-compact .hl-easylist-item-tag-row{display:inline}.hl-easylist-compact .hl-easylist-item-tag-row+.hl-easylist-item-tag-row:before{content:\"\";display:inline-block;width:1em;height:0}.hl-easylist-compact .hl-easylist-item-tag-cell{display:inline;width:auto}.hl-easylist-minimal .hl-easylist-item-cell-image,.hl-easylist-minimal .hl-easylist-item-info-item,.hl-easylist-minimal .hl-easylist-item-tags,.hl-easylist-minimal .hl-easylist-item-title-jp,.hl-easylist-minimal .hl-easylist-item-upload-info{display:none}.hl-easylist-compact .hl-easylist-item-tag-cell>.hl-tag-namespace-block.hl-tag-namespace-block-no-outline>.hl-tag-namespace{border-width:1px;border-style:solid}.hl-easylist-minimal .hl-easylist-item-cell{padding-left:0;vertical-align:middle}.hl-easylist-minimal .hl-easylist-item-cell-side{vertical-align:top}.hl-easylist-minimal .hl-easylist-item-title{font-size:1em;line-height:1.25em}.hl-easylist-minimal .hl-easylist-item-title-tag-link{display:inline-block}.hl-easylist-options:not(.hl-easylist-options-visible){display:none}.hl-easylist-option-table{display:table;width:100%}.hl-easylist-option-row{display:table-row}.hl-easylist-option-row+.hl-easylist-option-row>.hl-easylist-option-cell{padding-top:.5em}.hl-easylist-option-cell{display:table-cell;width:100%;vertical-align:top}.hl-easylist-option-cell:first-of-type{width:0;text-align:right}.hl-easylist-option-title{font-weight:700;margin-right:1em;display:inline-block;padding:.25em 0;border-top:1px solid transparent;border-bottom:1px solid transparent;white-space:nowrap}.hl-easylist-option-title-sub{max-width:100%;margin-right:1em;opacity:.9;white-space:normal}.hl-easylist-option-title-sub-text{font-size:.875em;line-height:1.1em}.hl-easylist-option-label{display:inline-block}.hl-easylist-option-label+.hl-easylist-option-label{margin-left:.5em}.hl-easylist-option-input,.hl-easylist-option-input+.riceCheck{display:none}.hl-easylist-option-button{display:inline-block;padding:.25em .5em;border-radius:.25em;background-color:rgba(255,255,255,.125);border:1px solid rgba(0,0,0,.0625);cursor:pointer}.hl-easylist-option-button:hover{border-color:rgba(0,0,0,.25)}.hl-easylist-option-button.hl-theme-dark{background-color:rgba(0,0,0,.125);border:1px solid rgba(255,255,255,.0625)}.hl-easylist-option-button.hl-theme-dark:hover{border-color:rgba(255,255,255,.25)}.hl-easylist-option-input:checked~.hl-easylist-option-button{background-color:rgba(255,255,255,.5);border-color:rgba(0,0,0,.25);color:#000}.hl-easylist-option-input:checked~.hl-easylist-option-button.hl-theme-dark{background-color:rgba(0,0,0,.5);border-color:rgba(255,255,255,.25);color:#fff}.hl-easylist-option-textarea{background-color:rgba(255,255,255,.125)!important;border:1px solid rgba(0,0,0,.0625)!important;margin:0!important;padding:.25em!important;box-sizing:border-box;-moz-box-sizing:border-box;width:100%;line-height:1.4em;height:4.8em;min-height:2em;resize:vertical;font-family:Courier,monospace!important}.hl-easylist-option-textarea:focus,.hl-easylist-option-textarea:hover{background-color:rgba(255,255,255,.5)!important;border-color:rgba(0,0,0,.25)!important}.hl-easylist-option-textarea.hl-theme-dark{background-color:rgba(0,0,0,.125)!important;border:1px solid rgba(255,255,255,.0625)!important;margin:0!important;padding:.25em!important}.hl-easylist-option-textarea.hl-theme-dark:focus,.hl-easylist-option-textarea.hl-theme-dark:hover{background-color:rgba(0,0,0,.5)!important;border-color:rgba(255,255,255,.25)!important}.hl-changelog-popup-align{min-height:80%;height:200px}.hl-changelog-popup-content{position:relative;height:100%}.hl-changelog-message-container{position:absolute;left:0;top:0;right:0;bottom:0;text-align:center;line-height:0;white-space:nowrap}.hl-changelog-message-container:before{display:inline-block;vertical-align:middle;width:0;height:100%}.hl-changelog-message{text-align:left;line-height:normal;white-space:normal;display:inline-block;vertical-align:middle}.hl-changelog-entry-user-name,.hl-changelog-entry-version{font-weight:700;line-height:1.4em}.hl-changelog-entries{padding:.375em}.hl-changelog-entry+.hl-changelog-entry{margin-top:1em}.hl-changelog-entry-version{font-size:1.25em}.hl-changelog-entry-users{margin-left:1em}.hl-changelog-entry-user+.hl-changelog-entry-user{margin-top:.5em}.hl-changelog-entry-changes{margin:0 0 0 1.5em!important;padding:0!important;list-style-type:disc!important}.hl-changelog-entry-change{margin:0!important;padding:0!important}.hl-changelog-entry-change+.hl-changelog-entry-change{margin-top:.5em!important}.hl-header-bar-link{vertical-align:bottom;cursor:pointer}.hl-header-bar-link.hl-appchanx,.hl-header-bar-svg{vertical-align:middle}.hl-header-bar-svg{width:1.2em;height:1.16em;display:inline-block;fill:#000;stroke:none}.hl-header-bar-link.hl-appchanx>.hl-header-bar-svg{width:100%;height:100%}";
			$.add(d.head, style);

			Theme.ready();
			EasyList.ready();

			Debug.timer_log("init.ready duration", "init");

			Linkifier.queue_posts(Post.get_all_posts(d), Linkifier.queue_posts.Flags.UseDelay);

			if (MutationObserver !== null) {
				updater = new MutationObserver(on_body_observe);
				updater.observe(d.body, { childList: true, subtree: true });
			}
			else {
				$.on(d.body, "DOMNodeInserted", on_body_node_add);
				$.on(d.body, "DOMNodeRemoved", on_body_node_remove);
			}

			HeaderBar.ready();

			if (Module.version_change === 1 && config.general.changelog_on_update) {
				Changelog.open(" updated to ");
			}

			Debug.timer_log("init.ready.full duration", "init");
		};
		var on_body_node_add = function (event) {
			var node = event.target;
			on_body_observe([{
				target: node.parentNode,
				addedNodes: [ node ],
				removedNodes: [],
				nextSibling: node.nextSibling,
				previousSibling: node.previousSibling
			}]);
		};
		var on_body_node_remove = function (event) {
			var node = event.target;
			on_body_observe([{
				target: node.parentNode,
				addedNodes: [],
				removedNodes: [ node ],
				nextSibling: node.nextSibling,
				previousSibling: node.previousSibling
			}]);
		};
		var on_body_observe = function (records) {
			var post_list = [],
				reload_all = false,
				nodes, node, ns, e, i, ii, j, jj;

			for (i = 0, ii = records.length; i < ii; ++i) {
				e = records[i];
				nodes = e.removedNodes;
				if (nodes && nodes.length > 0) {
					// Removed posts
					check_removed_nodes(nodes);
				}

				nodes = e.addedNodes;
				if (!nodes) continue;

				// Find posts
				for (j = 0, jj = nodes.length; j < jj; ++j) {
					node = nodes[j];
					if (node.nodeType === Node.ELEMENT_NODE) {
						if (Post.is_post(node)) {
							post_list.push(node);
						}
						else if (is_post_group_container(node)) {
							ns = Post.get_all_posts(node);
							if (ns.length > 0) {
								$.push_many(post_list, ns);
							}
						}
					}
				}

				if (Config.is_4chan) {
					// 4chan-x conflicts
					if (Config.is_4chan_x3) {
						// Source links
						if (
							e.target.classList.contains("fileText") &&
							e.previousSibling &&
							e.previousSibling.classList &&
							e.previousSibling.classList.contains("file-info")
						) {
							node = Post.get_post_container(e.target);
							if (node !== null) {
								post_list.push(node);
							}
						}

						// 4chan-x linkification conflicts
						for (j = 0, jj = nodes.length; j < jj; ++j) {
							node = nodes[j];
							if (
								node.tagName === "A" &&
								node.classList.contains("linkify") &&
								(ns = $$(".hl-link-events", node)).length > 0
							) {
								Linkifier.fix_broken_4chanx_linkification(node, ns);
							}
						}
					}
					else {
						// 4chan-inline conflicts
						if (!reload_all && e.target.classList.contains("navLinks")) {
							for (j = 0, jj = nodes.length; j < jj; ++j) {
								if (nodes[j].classList && nodes[j].classList.contains("thread-stats")) {
									// Reload every single post because 4chan's inline script messed it all up
									// This seems to be some sort of timing issue where 4chan-inline replaces the body contents of EVERY SINGLE POST on ready()
									reload_all = true;
								}
							}
						}
					}
				}
			}

			if (post_list.length > 0) {
				Linkifier.queue_posts(post_list, Linkifier.queue_posts.Flags.None);
			}
			if (reload_all) {
				reload_all_posts();
			}
		};
		var check_removed_nodes = function (nodes) {
			var node, ns, i, ii, j, jj;
			for (i = 0, ii = nodes.length; i < ii; ++i) {
				node = nodes[i];
				if (node.nodeType === Node.ELEMENT_NODE) {
					if (Post.is_post(node)) {
						UI.cleanup_post_removed(node);
					}
					else if (is_post_group_container(node)) {
						ns = Post.get_all_posts(node);
						for (j = 0, jj = ns.length; j < jj; ++j) {
							UI.cleanup_post_removed(ns[j]);
						}
					}
				}
			}
		};
		var is_post_group_container = function (node) {
			return node.id === "qp" || node.classList.contains("thread") || node.classList.contains("inline");
		};

		// Public
		var init = function () {
			var t = Debug.timer_log("init.pre duration", timing.start);
			Config.init();
			Debug.init();
			if (Module.version_change !== 0 && Module.version_change !== 2) {
				Debug.log("Clearing cache on version change");
				API.cache_clear();
			}
			API.init();
			UI.init();
			Sauce.init();
			Debug.log(t[0], t[1]);
			Debug.timer_log("init duration", timing.start);
			$.ready(on_ready);
		};
		var version_compare = function (v1, v2) {
			// Returns: -1 if v1<v2, 0 if v1==v2, 1 if v1>v2
			var ii = Math.min(v1.length, v2.length),
				i, x, y;

			for (i = 0; i < ii; ++i) {
				x = v1[i];
				y = v2[i];
				if (x < y) return -1;
				if (x > y) return 1;
			}

			ii = v1.length;
			y = v2.length;
			if (ii === y) return 0;

			if (ii > y) {
				y = 1;
			}
			else {
				ii = y;
				v1 = v2;
				y = -1;
			}

			for (; i < ii; ++i) {
				x = v1[i];
				if (x < 0) return -y;
				if (x > 0) return y;
			}

			return 0;
		};
		var insert_custom_fonts = function () {
			if (fonts_inserted) return;
			fonts_inserted = true;

			if (!config.general.external_resources) return;

			var font = $.node_simple("link");
			font.rel = "stylesheet";
			font.type = "text/css";
			font.href = "//fonts.googleapis.com/css?family=Source+Sans+Pro:900";
			$.add(d.head, font);
		};

		// Exports
		var Module = {
			homepage: "https://dnsev-h.github.io/h-links/",
			version: [1,1,0],
			version_change: 0,
			init: init,
			version_compare: version_compare,
			insert_custom_fonts: insert_custom_fonts
		};

		return Module;

	})();

	Main.init();
	Debug.timer_log("init.full duration", timing.start);

})();
