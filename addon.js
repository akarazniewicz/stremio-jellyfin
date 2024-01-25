// noinspection JSPotentiallyInvalidConstructorUsage

import Promise from "es6-promise"
import {addonBuilder} from "stremio-addon-sdk"
import {JellyfinApi, server} from "./jellyfin.js";
import {manifest} from "./manifest.js";

const jellyfin = new JellyfinApi()
await jellyfin.authenticate()

function stringToUuid(plainStringUuid) {
    return plainStringUuid.replace(
        /(.{8})(.{4})(.{4})(.{4})(.{12})/g,
        "$1-$2-$3-$4-$5"
    )
}

let builder = new addonBuilder(manifest)

function itemToMeta(item) {
    return {
        id: item.ProviderIds.Imdb,
        type: item.Type.toLowerCase(),
        name: item.Name,
        poster: `${server}/Items/${item.Id}/Images/Primary`
    }
}

builder.defineCatalogHandler(async ({type, id, extra}) => {
    console.log("request for catalogs: " + type + " " + id)
    return Promise.resolve({
        metas: await Promise.all(await jellyfin.searchItems(extra.skip || 0, type === 'movie', extra.search))
            .then(it => it.map(e => itemToMeta(e.data)))
    })
})

builder.defineMetaHandler(({type, id}) => {
    console.log("request for meta: " + type + " " + id)
    return Promise.resolve({meta: null})
})

builder.defineStreamHandler(async ({type, id}) => {
    console.log("request for streams: " + type + " " + id)
    let items = []
    if (id.includes(":")) {

        // resolve actual episode
        const resolvedId = id.split(":")
        const seriesId = resolvedId[0]
        const season = Number(resolvedId[1])
        const episode = Number(resolvedId[2])

        const seriesItem = (await jellyfin.getItemByImdbId(seriesId))[0]
        if ((seriesItem === undefined))
            return Promise.resolve([])
        const seasonItem = (await jellyfin.getSeasonByParentItemIdAndSeasonNumber(seriesItem.Id, season)).Items.find(it => it.IndexNumber === season)
        if ((seasonItem === undefined))
            return Promise.resolve([])
        const episodeItem = (await jellyfin.getEpisodeByItemIdAndSeasonId(seriesItem.Id, seasonItem.Id)).Items.find(it => it.IndexNumber === episode)
        if ((episodeItem === undefined))
            return Promise.resolve([])
        const actualEpisodeItem = await jellyfin.getItemById(episodeItem.Id).then(it => it.data)

        items = [actualEpisodeItem]

    } else
        items = await jellyfin.getItemByImdbId(id)

    if (items === undefined || items.length === 0)
        return Promise.resolve([])

    const item = items[0]
    const itemId = stringToUuid(item.Id)

    if (!(itemId === undefined)) {
        const stream = {
            url: `${server}/videos/${itemId}/stream.mkv?static=true&api_key=${jellyfin.auth.AccessToken}&mediaSourceId=${item.MediaSources[0].Id}`,
            name: 'Jellyfin',
            description: item.MediaSources[0].MediaStreams[0].DisplayTitle
        }
        return Promise.resolve({streams: [stream]})
    }

    console.log(`Cant find stream for: ${id}`)
    return Promise.resolve({streams: []})
})

export const addonInterface = builder.getInterface()
