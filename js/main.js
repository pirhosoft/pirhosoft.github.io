function setPageContent(href)
{
	var page = document.getElementsByClassName("page").item(0);
	var pageRequest = new XMLHttpRequest();

	pageRequest.addEventListener("load", function()
	{
		page.outerHTML = this.responseText;
	});

	var host = "file:///C:/Users/larso/Projects/pirhosoft.github.io/";
	var location = href.substring(host.length);

	pageRequest.open("GET", "content/" + location);
	pageRequest.send();
}

document.addEventListener("DOMContentLoaded", function(event)
{
	setPageContent(window.location.href);

	var links = document.getElementsByClassName("internal-link");

	for (var i = 0; i < links.length; i++)
	{
		var link = links.item(i);

		link.addEventListener("click", function(event)
		{
			setPageContent(link.href);
			event.preventDefault();
		});
	}
});