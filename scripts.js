// *Customize here.
const defaultMessage1 = "{{customTitle}}" || "Play by typing in chat"
const defaultMessage2 = "{{customSubtitle}}" || "Up, Down, Right, Left, A, B"

const SOUND_CORRECT = "{{soundConfirm}}" || null

const SONGS = {}

const customKeys = {}

"{{customKeysUp}}".split(",").forEach(function (key, i) {
	customKeys[key] = "c-up"
})

"{{customKeysRight}}".split(",").forEach(function (key, i) {
	customKeys[key] = "c-right"
})

"{{customKeysDown}}".split(",").forEach(function (key, i) {
	customKeys[key] = "c-down"
})

"{{customKeysLeft}}".split(",").forEach(function (key, i) {
	customKeys[key] = "c-left"
})

"{{customKeysA}}".split(",").forEach(function (key, i) {
	customKeys[key] = "a"
})

"{{customKeysB}}".split(",").forEach(function (key, i) {
	customKeys[key] = "b"
})

const customSongs = "{{songs}}".split(",")
const songsTitles = "{{songsTitles}}".split(",")

"{{songsCombos}}".split(",").forEach(function (combo, i) {
	const assemble = []

	combo.split("-").forEach(function (key) {
		if (customKeys[key]) {
			assemble.push(customKeys[key])
		}
	})

	if (assemble.length) {
		SONGS[assemble.join(",")] =
			{ title: songsTitles[i] ?? "Song", url: customSongs[i] } ?? null
	}
})

const ALLOW_FULL_COMBOS = Boolean("{{allowFullCombo}}")

// *
// *
// *
// *
// *Minigame stuff
var USERS_LAST = "GataQuadrada"

const board = document.getElementById("board")
const title = document.getElementById("title-1")
const titleText = document.getElementById("title-1-inner")
const subtitle = document.getElementById("title-2")
const subtitleText = document.getElementById("title-2-inner")
const grid = document.getElementById("grid")
const btns = document.getElementById("btns")

var working = false

var keys = []

function addKey(key, autoplay = true) {
	if (working || !key) return null

	working = true

	const validKeys = ["c-up", "c-right", "c-down", "c-left", "a", "b"]

	if (!validKeys.includes(key)) return null

	while (7 < document.querySelectorAll(`#btns > *`).length) {
		document.querySelector(`#btns > *:nth-of-type(1)`).remove()
	}

	keys = keys.slice(0, 7)

	const count = document.querySelectorAll(`#btns > *`).length

	elem = document.createElement("span")
	elem.classList.add(`n64-btn${key.includes("c-") ? "-c" : ""}`)
	elem.classList.add(`n64-btn-${key.replace("c-", "")}`)
	elem.innerHTML = `<span>${key.toUpperCase()}</span>`
	elem.style.setProperty("--note", count + 1)
	btns.appendChild(elem)
	window.getComputedStyle(elem).opacity
	elem.style.opacity = 1
	elem.style.setProperty("--note", count)

	keys.unshift(key)

	if (autoplay) {
		moveKeys()
	} else {
		working = false
	}
}

function moveKeys() {
	Array.from(document.querySelectorAll(`#btns > *`)).forEach(function (
		key,
		i
	) {
		var elem = document.querySelector(`#btns > *:nth-of-type(${i + 1})`)
		elem.style.setProperty("--note", i)
	})

	setTimeout(() => {
		checkSong()
	}, 200)
}

function checkSong() {
	const hash = [...keys].reverse().join(",")
	var song = null
	var songKey = null

	Object.keys(SONGS).forEach(function (key) {
		if (hash.startsWith(key)) {
			songKey = key
			song = SONGS[songKey]
		}
	})

	if (!song) {
		working = false
		return null
	}

	var offset = 0
	for (
		let i = songKey.split(",").length + 1;
		i <= document.querySelectorAll(`#btns > *`).length + 1;
		i++
	) {
		const tk = document.querySelector(
			`#btns > *:nth-of-type(${i - offset})`
		)

		if (tk) {
			offset++
			tk.remove()
		}
	}

	title.classList.remove("is-open")
	subtitle.classList.remove("is-open")

	grid.classList.add("is-flashing")

	if (SOUND_CORRECT && "" !== SOUND_CORRECT && "null" !== SOUND_CORRECT) {
		const audioCorrect = new Audio(SOUND_CORRECT)

		audioCorrect.volume = parseInt("{{volume}}") / 100

		audioCorrect.addEventListener("ended", function () {
			playSong({
				songTitle: song.title,
				songUrl: song.url,
			})
		})

		audioCorrect.addEventListener("canplaythrough", (event) => {
			/* the audio is now playable; play it if permissions allow */
			audioCorrect.play()
		})
	} else {
		setTimeout(function () {
			playSong({
				songTitle: song.title,
				songUrl: song.url,
			})
		}, 1600)
	}
}

function playSong({ songTitle, songUrl }) {
	titleText.textContent = songTitle
	subtitleText.textContent = `Played by ${USERS_LAST}`

	title.classList.add("is-open")
	subtitle.classList.add("is-open")

	grid.classList.remove("is-flashing")

	const songPlaying = new Audio(songUrl)

	songPlaying.volume = parseInt("{{volume}}") / 100

	songPlaying.addEventListener("ended", function () {
		title.classList.remove("is-open")
		subtitle.classList.remove("is-open")
		clearKeys()

		setTimeout(function () {
			resetMessages()
			working = false
		}, 200)
	})

	songPlaying.addEventListener("canplaythrough", (event) => {
		songPlaying.play()
	})
}

function clearKeys() {
	keys = []
	document.querySelectorAll(`#btns > *`).forEach(function (btn) {
		btn.remove()
	})
}

function resetMessages() {
	titleText.textContent = defaultMessage1
	subtitleText.textContent = defaultMessage2

	title.classList.add("is-open")
	subtitle.classList.add("is-open")
}

window.addEventListener("keyup", function (e) {
	const key = (e.key ?? e.keyCode ?? "").toString()

	switch (key) {
		case "ArrowUp":
		case "38":
			addKey("c-up")
			break

		case "ArrowRight":
		case "39":
			addKey("c-right")
			break

		case "ArrowDown":
		case "40":
			addKey("c-down")
			break

		case "ArrowLeft":
		case "37":
			addKey("c-left")
			break

		case "a":
		case "65":
			addKey("a")
			break

		case "b":
		case "66":
			addKey("b")
			break
	}
})

resetMessages()

window.addEventListener("onEventReceived", function (obj) {
	if ("message" == obj?.detail?.listener) {
		const message =
			obj?.detail?.event?.message ?? obj?.detail?.event?.data?.text ?? ""

		if (ALLOW_FULL_COMBOS) {
			var found = false

			message.split(/\s|-|,/).forEach(function (command) {
				if (customKeys[command]) {
					USERS_LAST =
						obj?.detail?.event?.data?.displayName ?? "NoName"

					addKey(customKeys[command], false)

					found = true
				}
			})

			if (found) {
				moveKeys()
			}
		} else {
			const command = message.split(" ")[0]

			if (customKeys[command]) {
				USERS_LAST = obj?.detail?.event?.data?.displayName ?? "NoName"
				addKey(customKeys[command])
			}
		}
	}
})
