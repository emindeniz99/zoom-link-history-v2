import "emoji-log"

import { browser } from "webextension-polyfill-ts"
import db from "../db"

browser.runtime.onMessage.addListener(async (message, sender) => {
	console.log(message, sender)

	if (!message.closeThisTab) {
		return
	}

	if (await db.getAutoCloseMode()) {
		setTimeout(() => {
			const tabId = sender?.tab?.id

			tabId && browser.tabs.remove(tabId)
		}, 1000)
	}
})
