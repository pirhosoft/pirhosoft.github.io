var pages =
{
	"/": [ "PiRho Soft", "/content/index.html" ],
	"/blog": [ "PiRho Soft Blog", "/content/blog.html" ],
	"/about": [ "About PiRho Soft", "/content/about.html" ],
	"/downloads": [ "Downloads", "/content/downloads.html" ],

	"/projects": [ "PiRho Soft Projects", "/content/projects.html" ],
	"/projects/photon-phanatics": [ "Photon Phanatics", "/content/projects/photon-phanatics.html" ],
	"/projects/photon-phanatics/solutions": [ "Photon Phanatics Solutions", "/content/projects/photon-phanatics/solutions.html" ],
	"/projects/photon-phanatics/solution": [ "Photon Phanatics Solution", "/content/projects/photon-phanatics/solution.html" ],
	"/projects/the-art-of-war": [ "The Art of War", "/content/projects/the-art-of-war.html" ],
	"/projects/unity-utilities": [ "Unity Utilities", "/content/projects/unity-utilities.html" ],
	"/projects/unity-composition": [ "Unity Composition", "/content/projects/unity-composition.html" ],

	"/legal/attribution": [ "PiRho Soft Attribution", "/content/legal/attribution.md" ],
	"/legal/privacy-policy": [ "PiRho Soft Privacy Policy", "/content/legal/privacy-policy.md" ],
	"/legal/terms-of-service": [ "PiRho Soft Terms of Service", "/content/legal/terms-of-service.md" ],

	// redirects
	"/games/photon-phanatics/solution": [ "Photon Phanatics Solution", "/content/projects/photon-phanatics/solution.html" ]
};

var posts =
{
	"2018-03-19": [ "The Art of War Released!", "We have officially released the 1.0 version of The Art of War on Windows and Xbox" ],
	"2017-10-10": [ "PiRho Soft and The Art of War", "Introducing our independent development studio PiRho Soft and our first game: The Art of War" ]
};

var articles =
{
};

function getPostContent(url, list)
{
	var date = url.substring(6);
	if (!list[date])
		return undefined;
		
	return [ url, list[date][0], "/content" + url + ".md" ]
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
		var articleContent = getPostContent(url, articles);
		if (articleContent)
			return articleContent;

		url = "/news";
	}

	return getPageContent(url);
}

var facebookComments = "<div class='fb-comments' data-width='100%'></div>";

function setContent(url, content, md)
{
	var page = document.getElementsByClassName("page").item(0);
	var doComments = url.startsWith("/news/") || url.startsWith("/blog/");

	if (md)
	{
		var converter = new showdown.Converter(
		{
			extensions: [ 'youtube' ],
			parseImgDimensions: true,
			literalMidWordUnderscores: true
		});

		var comments = doComments ? facebookComments : "";
		content = "<div class='markdown'>" + converter.makeHtml(content) + comments + "</div>";
	}

	page.innerHTML = content;

	if (doComments && location.hostname == "pirhosoft.com")
	{
		FB.XFBML.parse();
	}

	if (url == "/blog")
	{
		var container = document.getElementsByClassName("blog").item(0);
		loadPosts(container);
	}
	else if (url == "/news")
	{
		var container = document.getElementsByClassName("news").item(0);
		loadArticles(container);
	}

	var scripts = page.getElementsByTagName("script");
	for (var i = 0; i < scripts.length; i++)
		eval(scripts[i].innerHTML)
}

function setPage(url, push)
{
	var hashIndex = url.indexOf('#');
	var baseUrl = hashIndex > 0 ? url.substring(0, hashIndex) : url;
	var hash = hashIndex > 0 ? url.substring(hashIndex) : "";

	var data = getContent(baseUrl);
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
		window.history.pushState({ url: data[0] + hash }, "", data[0] + hash);

	window.history.replaceState({ url: data[0] + hash }, "", data[0] + hash);

	document.title = data[1] || "PiRho Soft";
}

document.addEventListener("DOMContentLoaded", function(event)
{
	setPage(window.location.pathname + window.location.hash, false);

	window.addEventListener("popstate", function(event)
	{
		setPage(event.state.url, false);
	});

	window.addEventListener("click", function(event)
	{
		if (event.target.classList.contains("screenshot"))
		{
			var screenshotBackground = document.getElementById("screenshot-background");
			var screenshotImg = document.getElementById("screenshot-img");

			screenshotBackground.classList.add("enabled");
			screenshotImg.src = event.target.src;
		}
		else if (event.target.classList.contains("screenshot-closer"))
		{
			var screenshotBackground = document.getElementById("screenshot-background");
			screenshotBackground.classList.remove("enabled");
		}
		else
		{
			var domain = window.location.origin;
			var href = event.target.href || event.target.parentElement.href;
			var direct = event.target.dataset.direct != undefined;

			if (!direct && href && href.startsWith(domain) && href.indexOf(".zip") < 0)
			{
				var path = href.substring(domain.length);
				setPage(path, true);
				event.preventDefault();
				event.stopPropagation();
			}
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
<div class='list-item <type>'>\
	<div class='list-thumbnail'><a href='<url>'><img src='<thumbnail>' /></a></div>\
	<div class='list-content'>\
		<div class='name'><a href='<url>'><name></a></div>\
		<div class='date'><date></div>\
		<div class='summary'><summary></div>\
		<a class='read' href='<url>'>Read More...</a>\
	</div>\
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
			.replace(/<url>/g, url);
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
