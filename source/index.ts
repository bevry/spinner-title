import spinners from 'cli-spinners'
import { stderr } from 'process'

/** Potential configuration for the Spinner */
type Options = Partial<
	Pick<
		Spinner,
		'style' | 'interval' | 'frames' | 'stream' | 'title' | 'open' | 'close'
	>
>

/** Create a new Spinner instance, for rendering a spinner into the terminal's title */
export default class Spinner {
	/** The current frame */
	index: number = 0

	/** The interval timer  */
	timer: NodeJS.Timeout | null = null

	/** The [cli-spinners style](https://www.npmjs.com/package/cli-spinners) to use, can be omitted if both `interval` and `frames` are provided */
	style: string = 'dots'

	/** If provided, uses this interval, instead of what is provided by the style */
	interval: number

	/** If provided, uses these frames, instead of what is provided by the style */
	frames: string[]

	/** Where to write the title update to */
	stream: NodeJS.WritableStream = stderr

	/**
	 * If you wish to customise the title that is used, you can provide this method to call `this.spin()` manually and return a string.
	 * The context of this method is the spinner instance.
	 */
	title?: (this: Spinner) => string

	/** The characters used to start the title */
	open: string = '\u001b]0;'

	/** The characters used to close the title */
	close: string = '\u0007'

	constructor(options: Options = {}) {
		if (options.style) this.style = options.style
		this.interval = options.interval || spinners[this.style].interval
		this.frames = options.frames || spinners[this.style].frames
		if (options.stream) this.stream = options.stream
		if (options.title) this.title = options.title
		if (options.open) this.open = options.open
		if (options.close) this.close = options.close
	}

	/** Creates and returns a new instance of the current class */
	static create(options: Options): Spinner {
		return new this(options)
	}

	/**
	 * If you want to render the spinner manually, each call to this iterates the Spinner's frame
	 * @returns the next frame
	 */
	spin(): string {
		const frame = this.frames[this.index]
		if (!frame) {
			this.index = 0
			return this.spin()
		}
		this.index += 1
		return frame
	}

	/** Writes the update to the terminal's title via the specified stream */
	update() {
		const title = this.title ? this.title() : this.spin()
		this.stream.write(this.open + title + this.close)
		return this
	}

	/**
	 * Commence the automatic update of the terminal's title with the spinner.
	 * Frames will be updated at the specified interval.
	 */
	start() {
		this.timer = setInterval(() => this.update(), this.interval)
		return this
	}

	/** Discards the automatic updates of the terminal's title */
	stop() {
		if (this.timer) {
			clearInterval(this.timer)
			this.timer = null
		}
		return this
	}
}
