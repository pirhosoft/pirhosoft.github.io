var pages =
{
	"/": [ "PiRho Soft", "/content/index.html" ],
	"/news": [ "PiRho Soft News", "/content/news.html" ],
	"/games": [ "PiRho Soft Games", "/content/games.html" ],
	"/blog": [ "PiRho Soft Blog", "/content/blog.html" ],
	"/press": [ "PiRho Soft Press", "/content/press.html" ],
	"/games/photon-phanatics": [ "Photon Phanatics", "/content/games/photon-phanatics.html" ],
	"/games/the-art-of-war": [ "The Art of War", "/content/games/the-art-of-war.html" ],
	"/legal/attribution": [ "PiRho Soft Attribution", "/content/legal/attribution.html" ],
	"/legal/privacy-policy": [ "PiRho Soft Privacy Policy", "/content/legal/privacy-policy.html" ],
	"/legal/terms-of-service": [ "PiRho Soft Terms of Service", "/content/legal/terms-of-service.html" ]
};

var posts =
{
	"2017-10-09": [ "First Post", "the first post whose summary is this" ]
};

var articles =
{
	"2017-10-09": [ "First Article", "the first article whose summary is this" ]
};

function getPostContent(url, list)
{
	var date = url.substring(6);
	if (!posts[date])
		return undefined;
		
	return [ url, posts[date][0], "/content" + url + ".md" ]
}

function getPageContent(url)
{
	if (!pages[url])
		url = "/";

	var content = pages[url].slice(0);
	content.unshift(url);

	return content;
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

var facebookComments = "<div class='fb-comments' data-width='100%'></div>";

function setContent(url, content, md)
{
	var page = document.getElementsByClassName("page").item(0);

	if (md)
	{
		var converter = new showdown.Converter(
		{
			parseImgDimensions: true,
			literalMidWordUnderscores: true
		});

		content = converter.makeHtml(content) + facebookComments;
	}

	page.innerHTML = content;

	if (md && location.hostname == "pirhosoft.com")
	{
		FB.XFBML.parse();
	}

	if (url == "/blog")
	{
		var container = document.getElementsByClassName("content").item(0);
		loadPosts(container);
	}
	else if (url == "/news")
	{
		var container = document.getElementsByClassName("content").item(0);
		loadArticles(container);
	}
}

function setPage(url, push)
{
	var data = getContent(url);
	var pageRequest = new XMLHttpRequest();

	pageRequest.addEventListener("load", function()
	{
		if (this.status == 200)
			setContent(data[0], this.responseText, data[2].endsWith(".md"));
		else
			setContent(data[0], "", false);
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
		setPage(event.state.url, false);
	});

	window.addEventListener("click", function(event)
	{
		var domain = window.location.origin;
		var href = event.target.href || event.target.parentElement.href;

		if (href && href.startsWith(domain))
		{
			var path = href.substring(domain.length);
			setPage(path, true);
			event.preventDefault();
			event.stopPropagation();
		}
	});
});

var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

function getMonth(month)
{
	var index = parseInt(month);
	return months[index - 1]
}

var contentTemplate = "\
<div class='<type>'>\
	<div class='thumbnail'><img src='<thumbnail>' /></div>\
	<div class='name'><name></div>\
	<div class='date'><date></div>\
	<div class='summary'><summary></div>\
	<div class='read'><a href='<url>'>Read More...</a></div>\
</div>";

function loadContent(container, root, type, contents)
{
	var content = "";

	for (date in contents)
	{
		var components = date.split("-");

		var article = contents[date];
		var url = root + "/" + date;
		var image = "/images" + root + "/" + date + "/thumbnail.png";
		var date = getMonth(components[1]) + " " + components[2] + ", " + components[0];

		content += contentTemplate
			.replace("<type>", type)
			.replace("<thumbnail>", image)
			.replace("<name>", article[0])
			.replace("<date>", date)
			.replace("<summary>", article[1])
			.replace("<url>", url);
	}

	return content;
}

function loadPosts(container)
{
	container.innerHTML = loadContent(container, "/blog", "post", posts);
}

function loadArticles(container)
{
	container.innerHTML = loadContent(container, "/news", "article", articles);
}

function showSignUp()
{
	require(["mojo/signup-forms/Loader"], function(L)
	{
		L.start({"baseUrl":"mc.us16.list-manage.com","uuid":"eed938b86f48d48227740122e","lid":"4e8f4d4303"})
		document.cookie = "MCPopupClosed=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
		document.cookie = 'MCPopupSubscribed=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;';
	});
}
