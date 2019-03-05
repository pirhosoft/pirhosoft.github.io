document.addEventListener("DOMContentLoaded", function(event)
{
	var _smallScreenMediaQuery = "(max-width: 44em)";

	var _bodyMenuOpenClass = "menu-open";
	var _menuSectionCollapsedClass = "collapsed";
	var _linkActiveClass = "active";
	var _loadingClass = "loading";
	var _searchingClass = "searching";
	var _linkNotFoundClass = "not-found";
	var _linkDisabledClass = "disabled";
	var _visibleClass = "visible";
	var _hljsClass = "hljs";

	var _title = "Unity Utilities";
	var _newestVersion = "v10";
	var _documentationPath = "/projects/unity-utilities/documentation/";
	var _rootUrl = window.location.origin + _documentationPath;
	var _defaultArticle = "overview.html";
	var _searchIndexUrl = "search-index.json";
	var _tableOfContentsUrl = "table-of-contents.html";

	var _videoLink = document.getElementById("video-button");
	var _pdfLink = document.getElementById("pdf-button");
	var _discordLink = document.getElementById("discord-button");
	var _nextLink = document.getElementById("next-button");
	var _menuButton = document.getElementById("menu-button");
	var _menuOverlay = document.getElementById("menu-overlay");
	var _versionSelect = document.getElementById("version-select");
	var _searchInput = document.getElementById("search-input");
	var _trademarkButton = document.getElementById("trademark-button");
	var _trademarkPopup = document.getElementById("trademark-popup");
	var _tableOfContents = document.getElementById("table-of-contents");
	var _titleText = document.getElementById("title-text");
	var _articleContent = document.getElementById("article-content");
	var _menuSections = document.getElementsByClassName("menu-section");
	var _menuLinks = document.getElementsByClassName("menu-link");

	var _titleSeparator = "<i class='fas fa-chevron-right'></i>"

	var _currentVersion = "";
	var _currentArticle = "";
	var _currentSection = "";
	
	var _searchIndex = null;
	var _searchTimeout = null;

	var _videoUrls =
	{
		v10:
		{
			"overview.html": "https://www.youtube.com/channel/UCRiSxdervZlO_RnMOa-PMhw",
			"tutorial/1-introduction.html": "https://www.youtube.com/playlist?list=PL3n_h8eLvFjCoVtxlVamxS_zvSayeHYuP",
			"tutorial/2-setup.html": "https://youtu.be/4xOs599U6OQ"
		}
	};

	var _pdfNames =
	{
		tutorial: "tutorial.pdf",
		manual: "manual.pdf",
		reference: "reference.pdf",
		documents: "documents.pdf"
	};

	var _discordUrl = "https://discord.gg/9FAhush";

	var _nextArticle =
	{
		"tutorial/1-introduction.html": "tutorial/2-setup.html",
		"tutorial/2-setup.html": "tutorial/3-world.html",
		"tutorial/3-world.html": "tutorial/4-ecosystem.html",
		"tutorial/4-ecosystem.html": "tutorial/5-battle.html",
		"tutorial/5-battle.html": "tutorial/6-finishing-up.html",
		"tutorial/6-finishing-up.html": "tutorial/7-next-steps.html"
	}

	function IsSmallScreen()
	{
		return window.matchMedia && window.matchMedia(_smallScreenMediaQuery).matches;
	}

	function GetHash(version, article)
	{
		var name = article == _defaultArticle ? "" : article.substring(0, article.length - 5);
		return "#/" + version + "/" + name;
	}

	function ParseHash(hash)
	{
		if (!hash || hash == "#" || hash == "#/")
			hash = "#/" + _newestVersion + "/";

		var versionStart = 2;
		var versionEnd = hash.indexOf("/", versionStart);
		var articleStart = versionEnd + 1;

		var version = hash.substring(versionStart, versionEnd);
		var article = articleStart < hash.length ? (hash.substring(articleStart) + ".html") : _defaultArticle;

		return { version: version, article: article };
	}

	function GetArticleSection(article)
	{
		return article.substring(0, article.indexOf('/'));
	}

	function GetSectionName(section)
	{
		return section.dataset.section;
	}

	function GetSectionMenu(section)
	{
		return section.nextElementSibling;
	}

	function GetArticleUrl(link)
	{
		var href = link.href || link.parentElement.href;

		if (href && href.startsWith(_rootUrl) && href.endsWith(".html"))
			return href.substring(_rootUrl.length);

		return null;
	}

	function Initialize()
	{
		if (!IsSmallScreen())
			ShowMenu();

		SetPageFromHash();

		_versionSelect.onchange = function(event) { SetPage(event.target.value, _currentArticle, true); };
		_searchInput.oninput = DebounceSearch;
		_menuButton.onclick = ClickEvent(ToggleMenu);
		_menuOverlay.onclick = ClickEvent(HideMenu);
		_trademarkButton.onclick = ClickEvent(ShowTrademark);
		_trademarkPopup.onclick = HideTrademark;
		
		window.addEventListener("hashchange", SetPageFromHash);
		window.addEventListener("popstate", HistoryNavigation);
		window.addEventListener("click", LinkNavigation);
	}

	function ClickEvent(handler)
	{
		return function (event)
		{
			handler();
			event.preventDefault();
			event.stopPropagation();
		}
	}

	function DebounceSearch(event)
	{
		clearTimeout(_searchTimeout);

		_searchTimeout = setTimeout(function()
		{
			Search(event.target.value);
		}, 800);
	}

	function ToggleMenu()
	{
		if (HasClass(document.body, _bodyMenuOpenClass))
			HideMenu();
		else
			ShowMenu();
	}

	function ShowMenu()
	{
		AddClass(document.body, _bodyMenuOpenClass);
	}

	function HideMenu()
	{
		RemoveClass(document.body, _bodyMenuOpenClass);
	}

	function ShowTrademark()
	{
		AddClass(_trademarkPopup, _visibleClass);
	}
	
	function HideTrademark()
	{
		RemoveClass(_trademarkPopup, _visibleClass);
	}

	function SetHeight(element, height)
	{
		element.style.height = height ? height + "px" : height;
	}

	function ToggleSection(event)
	{
		// technique from Css Tricks: https://css-tricks.com/using-css-transitions-auto-dimensions/

		var wasCollapsed = HasClass(event.target, _menuSectionCollapsedClass);
		var menu = GetSectionMenu(event.target);

		ToggleClass(event.target, _menuSectionCollapsedClass, !wasCollapsed);

		if (menu)
		{
			if (wasCollapsed)
				ExpandSection(menu);
			else
				CollapseSection(menu);

			event.preventDefault();
			event.stopPropagation();
		}
	}

	function CollapseSection(menu)
	{
		var sectionHeight = menu.scrollHeight;
		var menuTransition = menu.style.transition;

		menu.style.transition = "";
		
		requestAnimationFrame(function()
		{
			SetHeight(menu, sectionHeight);
			menu.style.transition = menuTransition;

			requestAnimationFrame(function()
			{
				SetHeight(menu, 0);
			});
		});
	}

	function ExpandSection(menu)
	{
		SetHeight(menu, menu.scrollHeight);

		menu.addEventListener('transitionend', function()
		{
			menu.removeEventListener('transitionend', arguments.callee);
			SetHeight(menu, null);
		});
	}

	function HasClass(element, className)
	{
		return element.classList.contains(className);
	}

	function ToggleClass(element, className, condition)
	{
		if (condition)
			AddClass(element, className);
		else
			RemoveClass(element, className)
	}

	function AddClass(element, className)
	{
		element.classList.add(className);
	}

	function RemoveClass(element, className)
	{
		element.classList.remove(className);
	}

	function Search(query)
	{
		if (!query || query.length < 3)
		{
			RemoveClass(_tableOfContents, _searchingClass);
			
			for (var i = 0; i <_menuSections.length; i++)
				delete _menuSections[i].dataset.searchCount;
		}
		else
		{
			AddClass(_tableOfContents, _searchingClass);
			var results = _searchIndex.search(query, {});

			var sections = {};

			for (var i = 0; i < _menuLinks.length; i++)
			{
				var link = _menuLinks[i];
				var found = IsInResults(link.href, results);

				ToggleClass(link.parentNode, _linkNotFoundClass, !found);

				if (found)
				{
					var section = link.closest(".submenu").previousElementSibling;
					var count = sections[section.dataset.section] = sections[section.dataset.section] || { Count: 0 };

					count.Count++;
				}
			}
			
			for (var i = 0; i <_menuSections.length; i++)
			{
				var section = _menuSections[i];
				var count = sections[section.dataset.section];

				section.dataset.searchCount = count ? count.Count : 0;
			}
		}
	}

	function IsInResults(href, results)
	{
		for (var i = 0; i < results.length; i++)
		{
			var result = results[i];
			if (href.endsWith(result.ref))
				return true;
		}

		return false;
	}

	function Load(url, onSuccess, onFailure)
	{
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function()
		{
			if (httpRequest.readyState === XMLHttpRequest.DONE)
			{
				if (httpRequest.status === 200)
					onSuccess && onSuccess(httpRequest.responseText);
				else
					onFailure && onFailure();
			}
		};

		httpRequest.open('GET', url);
		httpRequest.send();
	}

	function HistoryNavigation(event)
	{
		if (event.state)
			SetPage(event.state.version, event.state.article, false);
	}

	function LinkNavigation(event)
	{
		var url = GetArticleUrl(event.target);

		if (url)
		{
			LoadArticle(url, true);

			if (IsSmallScreen())
				HideMenu();

			event.preventDefault();
			event.stopPropagation();
		}
	}

	function SetPageFromHash()
	{
		var parsed = ParseHash(window.location.hash);
		SetPage(parsed.version, parsed.article, false);
	}

	function SetPage(version, article, pushState)
	{
		if (_currentVersion != version)
		{
			_currentVersion = version;
			_versionSelect.value = version;

			_searchInput.disabled = true;
			_versionSelect.disabled = true;
			AddClass(_tableOfContents, _loadingClass);

			Load(_currentVersion + "/" + _searchIndexUrl,
				function(content)
				{
					var index = JSON.parse(content);

					_searchIndex = elasticlunr.Index.load(index);
					_searchInput.disabled = false;
				}
			);

			Load(_currentVersion + "/" + _tableOfContentsUrl,
				function(content)
				{
					LoadArticle(article, pushState);
					SetTableOfContents(content);

					_versionSelect.disabled = false;
					RemoveClass(_tableOfContents, _loadingClass);
				},
				function()
				{
					SetPage(_newestVersion, article, false);
				}
			);
		}
		else
		{
			LoadArticle(article, pushState);
		}
	}

	function SetTableOfContents(content)
	{
		_tableOfContents.innerHTML = content;

		var activeSection = null;

		for (var i = 0; i < _menuLinks.length; i++)
		{
			var link = _menuLinks[i];
			var active = link.href.endsWith(_currentArticle);

			if (active)
				activeSection = link.parentNode.parentNode.previousElementSibling
		}

		for (var i = 0; i < _menuSections.length; i++)
		{
			var section = _menuSections[i];
			var menu = GetSectionMenu(section);

			section.onclick = ToggleSection;

			if (section != activeSection)
			{
				AddClass(section, _menuSectionCollapsedClass);

				if (menu)
					SetHeight(menu, 0);
			}
		}
	}

	function LoadArticle(article, pushState)
	{
		_currentArticle = article;
		_currentSection = GetArticleSection(article);

		AddClass(_titleText, _loadingClass);
		AddClass(_articleContent, _loadingClass);

		var hash = GetHash(_currentVersion, _currentArticle);

		Load(_currentVersion + "/" + _currentArticle, SetArticleContent, function()
		{
			LoadArticle(_defaultArticle, false);
		});

		if (pushState)
			window.history.pushState({ version: _currentVersion, article: _currentArticle }, "", hash);

		window.history.replaceState({ version: _currentVersion, article: _currentArticle }, "", hash);
	}

	function SetArticleContent(content)
	{
		RemoveClass(_titleText, _loadingClass);
		RemoveClass(_articleContent, _loadingClass);

		var title = CleanUpName(_currentArticle);

		_titleText.innerHTML = title.replace(/ > /g, _titleSeparator);
		_articleContent.innerHTML = content;

		var codes = _articleContent.getElementsByClassName(_hljsClass);
		for (var i = 0; i < codes.length; i++)
			hljs.highlightBlock(codes[i]);

		document.title = _title + " " + title;

		UpdateNavigationLinks();

		var videoUrl = GetVideoUrl(_currentVersion, _currentArticle);
		ToggleClass(_videoLink, _linkDisabledClass, !videoUrl);
		_videoLink.href = videoUrl;

		var pdfUrl = GetPdfUrl(_currentVersion, _currentSection);
		ToggleClass(_pdfLink, _linkDisabledClass, !pdfUrl);
		_pdfLink.href = pdfUrl;

		var discordUrl = GetDiscordUrl(_currentSection);
		ToggleClass(_discordLink, _linkDisabledClass, !discordUrl);
		_discordLink.href = discordUrl;

		var nextUrl = GetNextUrl(_currentArticle);
		ToggleClass(_nextLink, _linkDisabledClass, !nextUrl);
		_nextLink.href = nextUrl;
	}

	function CleanUpName(name)
	{
		return name
			.substring(0, name.length - 5)
			.replace(/\//g, " > ")
			.replace(/[0-9]-+/g, "")
			.replace(/^[a-z]/g, function (match) { return match.toUpperCase(); })
			.replace(/[- ]([a-z])/g, function (match, capture) { return " " + capture.toUpperCase(); });
	}

	function GetVideoUrl(version, article)
	{
		var versionUrls = _videoUrls[version];
		return versionUrls ? versionUrls[article] : null;
	}

	function GetPdfUrl(version, section)
	{
		var name = _pdfNames[section];
		return name ? _documentationPath + version + "/" + name : null;
	}

	function GetDiscordUrl(section)
	{
		return _discordUrl;
	}

	function GetNextUrl(article)
	{
		return _nextArticle[article];
	}

	function UpdateNavigationLinks()
	{
		for (var i = 0; i < _menuSections.length; i++)
		{
			var section = _menuSections[i];
			RemoveClass(section, _linkActiveClass);
		}

		for (var i = 0; i < _menuLinks.length; i++)
		{
			var link = _menuLinks[i];
			var active = link.href.endsWith(_currentArticle);

			ToggleClass(link, _linkActiveClass, active);

			if (active)
				AddClass(link.parentNode.parentNode.previousElementSibling, _linkActiveClass)
		}
	}

	Initialize();
});