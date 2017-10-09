var baseTitle = "PiRho Soft";

var urlmap =
{
	"/": [ "", "/content/index.html" ],
	"/news": [ "News", "/content/news.html" ],
	"/games": [ "Games", "/content/games.html" ],
	"/blog": [ "Blog", "/content/blog.html" ],
	"/legal/terms-of-service": [ "Terms of Service", "/content/legal/terms-of-service.html" ]
};

function getContent(url)
{
	return urlmap[url] || urlmap["/"];
}

function setPage(url, push, replace)
{
	var data = getContent(url);
	var page = document.getElementsByClassName("page").item(0);
	var pageRequest = new XMLHttpRequest();

	pageRequest.addEventListener("load", function()
	{
		if (this.status == 200)
			page.innerHTML = this.responseText;
		else
			page.innerHTML = "";
	});

	pageRequest.open("GET", data[1]);
	pageRequest.send();

	if (push)
		window.history.pushState({ url: url }, "", url);

	if (replace)
		window.history.replaceState({ url: url }, "", url);

	document.title = data[0] ? "PiRho Soft " + data[0] : "PiRho Soft";
}

document.addEventListener("DOMContentLoaded", function(event)
{
	setPage(window.location.pathname, false, true);

	window.addEventListener("popstate", function(event)
	{
		setPage(event.state.url);
	});

	window.addEventListener("click", function(event)
	{
		var path = event.target.dataset.path || event.target.parentElement.dataset.path

		if (path)
		{
			setPage(path, true);
			event.preventDefault();
			event.stopPropagation();
		}
	});
});