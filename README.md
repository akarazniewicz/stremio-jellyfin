# Stremio Jellyfin Addon

An Stremio addon that enables streaming movies and TV series from your own Jellyfin server. Addon runs entirely locally, ensuring that none of your data is shared outside of your own network. It provides Stremio with a library featuring your Jellyfin movie and TV series collection, allowing you to play both movies and series.

![](assets\si.png)

## Installation
### Jellyfin Stremio Companion Plugin

This addon requires supporting Jellyfin extension that allows searching for movies and TV series using IMDB identifiers.
You can find this addon [here](https://github.com/akarazniewicz/jellyfin-providersid-search-plugin).

To install it, simply add following, new addon repository (`Jellyfin > Dashboard > Plugins > Repositories`):

https://raw.githubusercontent.com/akarazniewicz/jellyfin-providersid-search-plugin/main/manifest.json

Then install the new addon: Providers ID Items Search API.

### Jellyfin Stremio Addon

Additionally Stremio addon should be installed in your local environment (requires Docker).

To install it:

`docker pull ghcr.io/akarazniewicz/stremio-jellyfin:latest
`
and then

`docker run ghcr.io/akarazniewicz/stremio-jellyfin -p 60421:60421 -e JELLYFIN_USER="<your jellyfin username>" -e JELLYFIN_PASSWORD="<your jellyfin user password>" -e JELLYFIN_SERVER="<your jellyfin server address>"
`

Afterwards, add the manifest to Stremio from:

`http://<your docker host>:60421/manifest.json`
