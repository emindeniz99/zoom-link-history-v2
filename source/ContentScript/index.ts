import { browser } from "webextension-polyfill-ts"
import db from "../db"

console.log("helloworld from content script")

const url = window.location.href

if (
	url.toLocaleLowerCase().includes("postattendee") ||
	url.toLocaleLowerCase().includes("wc/leave")
) {
	browser.runtime.sendMessage({ closeThisTab: true })
} else {
	db.addLink({ url })
}

export {}
