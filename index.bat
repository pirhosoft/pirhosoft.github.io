@ECHO OFF

COPY index.html blog.html /Y
COPY index.html games.html /Y
COPY index.html news.html /Y
COPY index.html press.html /Y
COPY index.html games\photon-phanatics.html /Y
COPY index.html games\the-art-of-war.html /Y
COPY index.html legal\attribution.html /Y
COPY index.html legal\privacy-policy.html /Y
COPY index.html legal\terms-of-service.html /Y

for %%f in (content\blog\*.md) do (
	COPY index.html blog\%%~nf.html /Y
)

for %%f in (content\news\*.md) do (
	COPY index.html news\%%~nf.html /Y
)

PAUSE