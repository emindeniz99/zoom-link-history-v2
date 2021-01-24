import "./styles.scss"

import {
	Button,
	Container,
	FormControl,
	FormText,
	ListGroup,
	ListGroupItem,
} from "react-bootstrap"
import React, { useEffect, useState } from "react"

import db from "../db"

const Options: React.FC = () => {
	return (
		<Container>
			<h1>Zoom History Settings</h1>

			<ListGroup>
				<ChangeRecentlyAccessTimeLimit />
				<ChangeAutoCloseMode />
			</ListGroup>
			<br />

			<a
				target="_blank"
				href="https://github.com/emindeniz99/zoom-link-history-v2"
			>
				<button type="button" className="btn btn-dark">
					Github
				</button>
			</a>
			<footer className="text-right">
				<a
					target="_blank"
					href="https://github.com/emindeniz99/zoom-link-history-v2/issues"
				>
					<small>open an issue</small>
				</a>
			</footer>
			<footer className="text-center">
				by
				<a target="_blank" href="https://emindeniz99.com">
					<span> emindeniz99</span>
				</a>
			</footer>
		</Container>
	)
}

const ChangeRecentlyAccessTimeLimit = () => {
	const [min, setMin] = useState(0)

	useEffect(() => {
		db.getRecentlyAccessedTimeLimit().then((a) => {
			setMin(a / (1000 * 60))
		})
	}, [])

	return (
		<ListGroupItem style={{ display: "flex" }}>
			<FormText style={{ flex: 1 }}>
				Time( minutes) for Recently accessed link figure
			</FormText>
			<FormControl
				type="number"
				style={{ flex: 4 }}
				value={min}
				onChange={(e) => setMin(parseFloat(e.target.value))}
			/>
			<Button
				style={{ flex: 1 }}
				onClick={() => {
					db.setRecentlyAccessedTimeLimit(min * 1000 * 60)
				}}
			>
				Save
			</Button>
		</ListGroupItem>
	)
}

const ChangeAutoCloseMode = () => {
	const [mode, setMode] = useState<boolean | undefined>(undefined)

	useEffect(() => {
		db.getAutoCloseMode().then((a) => {
			setMode(a)
		})
	}, [])

	return (
		<ListGroupItem style={{ display: "flex" }}>
			<FormText style={{ flex: 1 }}>
				Status of Auto Close Mode :{" "}
				{mode
					? "Extension will close tab that has postattendee and wc/leave url"
					: "Will not close tab"}
			</FormText>
			{mode !== undefined && (
				<Button
					style={{ flex: 1 }}
					onClick={() => {
						db.setAutoCloseMode(!mode)
						setMode((mode) => !mode)
					}}
				>
					{mode ? "Close" : "Open"}
				</Button>
			)}
		</ListGroupItem>
	)
}

export default Options
