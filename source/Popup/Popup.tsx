import "./styles.scss"

import {
	ButtonGroup,
	Dropdown,
	DropdownButton,
	FormControl,
	InputGroup,
	ListGroup,
} from "react-bootstrap"
import React, { useEffect, useState } from "react"
import db, { Link } from "../db"

import Badge from "react-bootstrap/esm/Badge"
import Button from "react-bootstrap/esm/Button"
import Container from "react-bootstrap/esm/Container"
import Row from "react-bootstrap/esm/Row"
import { browser } from "webextension-polyfill-ts"

const Popup: React.FC = () => {
	const [links, _setlinks] = useState<Link[]>([])
	const [filteredLinks, setFilteredLinks] = useState<Link[]>([])

	const setlinks = (newlinks: Link[]) => {
		let orderedLinks = newlinks.sort((a, b) => {
			if (
				Date.now() - a.analytics.lastAccess < LASTACCESSINTERVAL &&
				Date.now() - b.analytics.lastAccess < LASTACCESSINTERVAL
			) {
				return b.analytics.lastAccess - a.analytics.lastAccess
			} else if (Date.now() - a.analytics.lastAccess < LASTACCESSINTERVAL) {
				return -1
			} else if (Date.now() - b.analytics.lastAccess < LASTACCESSINTERVAL) {
				return 1
			}
			return (
				//  show same weekday links at the top
				b.analytics.days[new Date().getDay()] -
				a.analytics.days[new Date().getDay()]
			)
		})

		_setlinks(orderedLinks)
	}

	const [LASTACCESSINTERVAL, setLASTACCESSINTERVAL] = useState(0)
	useEffect(() => {
		db.getAllLinks().then(async (l) => {
			console.log(l)
			setlinks(l)
		})
	}, [LASTACCESSINTERVAL])
	useEffect(() => {
		db.getRecentlyAccessedTimeLimit().then((i) => {
			setLASTACCESSINTERVAL(i)
		})
	}, [])
	const deleteLink = async (id: number) => {
		setlinks(await db.deleteLink(id))
	}
	const updateLink = async (updatedLink: Link) => {
		setlinks(await db.updateLink(updatedLink))
	}

	const [filterText, setFilterText] = useState("")
	useEffect(() => {
		setFilteredLinks(links.filter((i) => i.title.includes(filterText)))
	}, [filterText, links])

	return (
		<Container fluid style={{ minWidth: "20rem" }}>
			<div className="d-flex justify-content-between">
				<button
					type="button"
					onClick={async () => {
						setlinks(await db.setAllLinks([]))
					}}
					className="btn btn-primary"
				>
					Clear
				</button>
				<button
					type="button"
					onClick={async () => {
						browser.runtime.openOptionsPage()
					}}
					className="btn btn-primary"
				>
					options
				</button>
				<a
					target="_blank"
					href="https://github.com/emindeniz99/zoom-link-history-v2"
				>
					<button type="button" className="btn btn-dark">
						Github
					</button>
				</a>
			</div>
			<div id="data">
				<h3>Links</h3>
			</div>
			<InputGroup>
				<FormControl
					type="text"
					placeholder="filter"
					aria-label="filter"
					aria-describedby="btnGroupAddon"
					onChange={(e) => {
						setFilterText(e.target.value)
					}}
					value={filterText}
				/>
				<InputGroup.Prepend>
					<Button
						id="btnGroupAddon"
						variant="danger"
						onClick={() => {
							setFilterText("")
						}}
					>
						X
					</Button>
				</InputGroup.Prepend>
			</InputGroup>

			<ListGroup style={{ marginBottom: "3rem" }}>
				{filteredLinks.map((link) => (
					<LinkItem
						isNew={Date.now() - link.analytics.lastAccess < LASTACCESSINTERVAL}
						link={link}
						key={link.id}
						deleteLink={deleteLink}
						updateLink={updateLink}
					/>
				))}
			</ListGroup>
			<footer className="text-right">
				<a
					target="_blank"
					href="https://github.com/emindeniz99/zoom-link-history/issues"
				>
					<small>open an issue</small>
				</a>
			</footer>
		</Container>
	)
}

const LinkItem = ({
	link,
	deleteLink,
	updateLink,
	isNew,
}: {
	link: Link
	deleteLink: (id: number) => void
	updateLink: (updatedLink: Link) => void
	isNew: boolean
}) => {
	const [mode, setMode] = useState<"edit" | "view">("view")

	const [newTitle, setNewTitle] = useState(link.title)
	return (
		<Row
			style={{
				marginBottom: "1rem",
				marginLeft: 0,
				marginRight: 0,
				flexWrap: "nowrap",
			}}
		>
			{mode === "edit" && (
				<>
					<FormControl
						style={{ flex: 1 }}
						type="text"
						value={newTitle}
						onChange={(e) => {
							setNewTitle(e.target.value)
						}}
						onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) => {
							if (event.key === "Enter") {
								updateLink({
									...link,
									title: newTitle,
								})

								setMode("view")
							}
						}}
					/>
					<InputGroup.Prepend>
						<Button
							onClick={() => {
								updateLink({
									...link,
									title: newTitle,
								})
								setMode("view")
							}}
						>
							save
						</Button>
					</InputGroup.Prepend>
				</>
			)}
			{mode === "view" && (
				<>
					<a
						style={{ flex: 1, textDecoration: "none" }}
						href={link.url}
						className="bg-light"
						target="_blank"
						onClick={async (e) => {
							e.preventDefault()
							link.analytics.days[new Date().getDay()]++
							link.analytics.lastAccess = Date.now()
							console.log(await db.updateLink(link))
							window.open(link.url)
						}}
					>
						<div className="shadow-sm">
							{isNew && <Badge variant="warning">Recently</Badge>}
							{link.title}
							<br />
							<small className="text-muted">
								{new Date(link.analytics.lastAccess).toUTCString()}
							</small>
						</div>
					</a>
					<InputGroup.Prepend>
						<DropdownButton as={ButtonGroup} title="" id="bg-nested-dropdown">
							<Dropdown.Item
								eventKey="1"
								onClick={() => {
									setMode("edit")
								}}
							>
								Rename
							</Dropdown.Item>
							<Dropdown.Item
								eventKey="2"
								onClick={async () => {
									confirm("Do you want to delete " + link.title + " ?") &&
										deleteLink(link.id)
								}}
							>
								Delete
							</Dropdown.Item>
						</DropdownButton>
					</InputGroup.Prepend>
				</>
			)}
		</Row>
	)
}
export default Popup
