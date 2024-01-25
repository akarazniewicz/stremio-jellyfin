import axios from "axios"
import os from "os"

export const server = process.env.JELLYFIN_SERVER
const user = process.env.JELLYFIN_USER
const password = process.env.JELLYFIN_PASSWORD
const device = os.hostname()
const itemsLimit = 20

export class JellyfinApi {

    async authenticate() {
        console.log(`Connecting to Jellyfin server: ${server} with username: ${user} and password: ${password}`)
        this.auth = await axios.post(`${server}/Users/authenticatebyname`,
            {Username: user, Pw: password}, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Emby-Authorization': `MediaBrowser Client="Jellyfin Stremio Addon", Device="${device}", DeviceId="${device}", Version="1.0.0.0""`
                }
            }).then(it => it.data)
            .catch(err => {
                if (err?.response) {
                    console.log(`Error caught while Jellyfin authentication, server response: '${err?.response?.status}' and data: '${err?.response?.data || "<empty>" }' (server: '${server}' with username: '${user}' and password: '${password}')`)
                } else {
                    console.log(`Error connecting to Jellyfin (server: '${server}' with username: '${user}' and password: '${password}'). Error message: '${err?.message}'`)
                    // anything else
                }
                console.info("Exiting. Please check your configuration and Jellyfin connection.")
                process.exit()
            })
        console.log(`Successfully connected to Jellyfin server: ${server}. Happy streaming.`)
        this.authorisationHeader = `MediaBrowser Client="Jellyfin Stremio Addon", Device="${device}", DeviceId="${device}", Version="1.0.0.0", Token="${this.auth.AccessToken}"`
    }

    async getItemById(itemId) {
        return axios.get(`${server}/Users/${this.auth.User.Id}/Items/${itemId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Emby-Authorization': this.authorisationHeader
                }
            })
    }

    async searchItems(skip, movie, searchTerm = null) {
        let firstItem = Number(skip) + 1
        let itemsSearch = `${server}/Items?userId=${this.auth.User.Id}&hasImdb=true&Recursive=true&IncludeItemTypes=Movie,Series&startIndex=${firstItem}&limit=${itemsLimit}&sortBy=SortName`
        if (searchTerm) {
            itemsSearch += `&searchTerm=${searchTerm}`
        }

        if (movie) {
            itemsSearch += `&IncludeItemTypes=Movie`
        } else
            itemsSearch += `&IncludeItemTypes=Series`

        return axios.get(itemsSearch,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Emby-Authorization': this.authorisationHeader
                }
            })
            .then(it => it.data.Items.map(it => this.getItemById(it.Id)))
    }

     getItemByImdbId(imdbId) {
        return axios.get(`${server}/ProvidersIdSearch?ProviderId=${imdbId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Emby-Authorization': this.authorisationHeader
                }
            }).then(item => item.data)
    }

     getSeasonByParentItemIdAndSeasonNumber(itemId, seasonNumber) {
        return axios.get(`${server}/Shows/${itemId}/Seasons?userId=${this.auth.User.Id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Emby-Authorization': this.authorisationHeader
                }
            }).then(item => item.data)
    }

     getEpisodeByItemIdAndSeasonId(itemId, seasonId) {

        return axios.get(`${server}/Shows/${itemId}/Episodes?seasonId=${seasonId}&userId=${this.auth.User.Id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Emby-Authorization': this.authorisationHeader                }
            }).then(item => item.data)
    }
}
