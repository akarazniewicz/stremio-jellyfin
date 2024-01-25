import stremio from "stremio-addon-sdk"
import {addonInterface} from "./addon.js"

const { serveHTTP, publishToCentral } = stremio

serveHTTP(addonInterface, { port: process.env.SERVER_PORT || 60421 })

