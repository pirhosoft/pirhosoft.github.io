var pages =
{
	"/": [ "PiRho Soft", "/content/index.html" ],
	"/news": [ "PiRho Soft News", "/content/news.html" ],
	"/games": [ "PiRho Soft Games", "/content/games.html" ],
	"/blog": [ "PiRho Soft Blog", "/content/blog.html" ],
	"/press": [ "PiRho Soft Press", "/content/press.html" ],
	"/games/photon-phanatics/": [ "Photon Phanatics", "/content/games/photon-phanatics/index.html" ],
	"/games/the-art-of-war/": [ "The Art of War", "/content/games/the-art-of-war/index.html" ],
	"/legal/privacy-policy": [ "PiRho Soft Privacy Policy", "/content/legal/privacy-policy.html" ],
	"/legal/terms-of-service": [ "PiRho Soft Terms of Service", "/content/legal/terms-of-service.html" ]
};

var posts =
{
	"2017":
	{
		"10":
		{
			"9": [ "First Post", "the first post whose summary is this" ]
		}
	}
};

var articles =
{
	"2017":
	{
		"10":
		{
			"9": [ "First Post", "the first post whose summary is this" ]
		}
	}
};

function getPostContent(url, list)
{
	var path = url.split("/");
	if (path.length == 5)
	{
		var year = list[path[2]];
		var month = year ? year[path[3]] : undefined;
		var day = month ? month[path[4]] : undefined;

		if (day)
			return [ url, day[0], "/content" + url + ".md" ]
	}
	
	return undefined;
}

function getPageContent(url)
{
	if (!pages[url])
		url = "/";

	var content = pages[url];
	content.unshift(url);
}

function getContent(url)
{
	if (url.startsWith("/blog/"))
	{
		var postContent = getPostContent(url, posts);
		if (postContent)
			return postContent;

		url = "/blog";
	}
	else if (url.startsWith("/news/"))
	{
		var postContent = getPostContent(url, articles);
		if (postContent)
			return postContent;

		url = "/news";
	}

	return getPageContent(url);
}

function setContent(content, md)
{
	var page = document.getElementsByClassName("page").item(0);

	if (md)
	{
		var converter = new showdown.Converter(
		{
			parseImgDimensions: true,
			literalMidWordUnderscores: true
		});

		content = converter.makeHtml(content);
	}

	page.innerHTML = content;
}

function setPage(url, push)
{
	var data = getContent(url);
	var pageRequest = new XMLHttpRequest();

	pageRequest.addEventListener("load", function()
	{
		if (this.status == 200)
			setContent(this.responseText, data[2].endsWith(".md"));
		else
			setContent("", false);
	});

	pageRequest.open("GET", data[2]);
	pageRequest.send();

	if (push)
		window.history.pushState({ url: data[0] }, "", data[0]);

	window.history.replaceState({ url: data[0] }, "", data[0]);

	document.title = data[1] || "PiRho Soft";
}

document.addEventListener("DOMContentLoaded", function(event)
{
	setPage(window.location.pathname, false);

	window.addEventListener("popstate", function(event)
	{
		setPage(event.state.url, true);
	});

	window.addEventListener("click", function(event)
	{
		var domain = window.location.origin;
		var href = event.target.href || event.target.parentElement.href;

		if (href.startsWith(domain))
		{
			var path = href.substring(domain.length);
			setPage(path, true);
			event.preventDefault();
			event.stopPropagation();
		}
	});
});