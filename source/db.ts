import { browser } from "webextension-polyfill-ts"

const LOCALSTORAGELINKITEMNAME = "links-v2"

export interface LinkDatabase {
	version: number
	links: Link[]
}

export interface Link {
	id: number
	title: string
	url: string
	analytics: Analytics
}

export interface Analytics {
	days: number[] // index 0 represents monday, 1 = tuesday .....
	lastAccess: number
}
const getAllLinks = async () => {
	const { [LOCALSTORAGELINKITEMNAME]: linkDB } = await browser.storage.sync.get(
		LOCALSTORAGELINKITEMNAME
	)
	console.log(linkDB)
	if (linkDB as LinkDatabase) {
		if (linkDB.version === 2) {
			return linkDB.links as Link[]
		}
		// upgrade db
		// TODO
		return []
	}
	// initialize db
	await browser.storage.sync.set({
		[LOCALSTORAGELINKITEMNAME]: {
			version: 2,
			links: [],
		},
	})
	return []
}
const setAllLinks = async (links: Link[]): Promise<Link[]> => {
	await browser.storage.sync.set({
		[LOCALSTORAGELINKITEMNAME]: {
			version: 2,
			links,
		},
	})
	return links
}

const addLink = async ({ url }: { url: string }): Promise<Link[]> => {
	const links = await getAllLinks()
	const newLinkItem: Link = {
		id: Date.now(),
		title: `${new URL(url).hostname} ${new URL(url).pathname}`,
		url,
		analytics: {
			days: new Array(7).fill(0),
			lastAccess: Date.now(),
		},
	}

	if (!links.some((i) => i.url === newLinkItem.url)) {
		links.push(newLinkItem)
		await setAllLinks(links)
	}
	return links
}

const deleteLink = async (id: number) => {
	let links = await getAllLinks()
	links = links.filter((i) => i.id !== id)
	await setAllLinks(links)
	return links
}
const updateLink = async (link: Link) => {
	let links = await getAllLinks()
	links = links.map((i) => {
		if (i.id === link.id) {
			return link
		}
		return i
	})

	await setAllLinks(links)
	return links
}

const getRecentlyAccessedTimeLimit = async () => {
	let data = await browser.storage.sync.get(["lastaccesstime"])
	let lastaccesstime = data["lastaccesstime"]
	console.log(lastaccesstime)
	if (!lastaccesstime) {
		lastaccesstime = 1000 * 60 * 60

		await browser.storage.sync.set({
			lastaccesstime,
		})
	}

	return lastaccesstime
}
const setRecentlyAccessedTimeLimit = async (lastaccesstime: number) => {
	await browser.storage.sync.set({
		lastaccesstime,
	})
	return lastaccesstime
}
const getAutoCloseMode = async () => {
	let data = await browser.storage.sync.get(["autoclosemode"])
	let autoclosemode: boolean | undefined = data["autoclosemode"]
	console.log(autoclosemode)
	if (autoclosemode === undefined) {
		autoclosemode = true

		await browser.storage.sync.set({
			autoclosemode,
		})
	}

	return autoclosemode
}
const setAutoCloseMode = async (autoclosemode: boolean) => {
	await browser.storage.sync.set({
		autoclosemode,
	})
	return autoclosemode
}

const dbMethods = {
	getAllLinks,
	setAllLinks,
	deleteLink,
	updateLink,
	addLink,
	getRecentlyAccessedTimeLimit,
	setRecentlyAccessedTimeLimit,
	getAutoCloseMode,
	setAutoCloseMode,
}
export default dbMethods
