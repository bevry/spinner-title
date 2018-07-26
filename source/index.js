'use strict'

const spinners = require('cli-spinners')

/**
 * This callback is used if you want to control the title that is rendered.
 * Its context is the spinner instance, so if you wish to still render the spinner, then use `this.spin()` in your result string.
 * @callback titleCallback
 * @this {Spinner}
 * @returns {string}
 * @public
 */

/**
 * @typedef {Object} Options
 * @property {string} [style='dots'] the [cli-spinners style](https://www.npmjs.com/package/cli-spinners) to use, can be omitted if both `interval` and `frames` are provided
 * @property {number} [interval] if provided, uses this interval, instead of what is provided by the style
 * @property {Array<string>} [frames] if provided, uses these frames, instead of what is provided by the style
 * @property {stream.Writable} [stream] where to write the title update to, defaults to `process.stderr`
 * @property {titleCallback} [title] if you wish to customise the title that is used, you can provide this method to call `this.spin()` manually and return a string
 * @property {string} [open] the characters used to start the title, defaults to `\u001b]0;`
 * @property {string} [close] the characters used to close the title, defaults to `\u0007`
 * @public
 */

/**
 * Create a new Spinner instance, for rendering a spinner into the terminal's title
 * @class
 * @constructor
 * @param {Options} opts
 * @public
 */
class Spinner {
	constructor ({ style = 'dots', interval, frames, title = null, stream = process.stderr, open = '\u001b]0;', close = '\u0007' } = {}) {
		this.index = 0
		this.frames = frames || spinners[style].frames
		this.interval = interval || spinners[style].interval
		this.stream = stream
		this.title = title
		this.open = open
		this.close = close
	}

	/**
	Creates and returns a new instance of the current class
	@param {...*} args - the arguments to be forwarded along to the constructor
	@return {Spinner}
	@static
	@public
	*/
	static create (...args) {
		return new this(...args)
	}

	/**
	 * If you want to render the spinner manually, each call to this iterates the spinner's frame
	 * @returns {string} the next frame
	 * @public
	 */
	spin () {
		const frame = this.frames[this.index]
		if (!frame) {
			this.index = 0
			return this.spin()
		}
		this.index += 1
		return frame
	}

	/**
	 * Writes the update to the terminal's title via the specified stream
	 * @returns {Spinner}
	 * @chainable
	 * @public
	 */
	update () {
		const title = this.title ? this.title() : this.spin()
		this.stream.write(this.open + title + this.close)
		return this
	}

	/**
	 * Commence the automatic update of the terminal's title with the spinner.
	 * Frames will be updated at the specified interval.
	 * @returns {Spinner}
	 * @chainable
	 * @public
	 */
	start () {
		this.timer = setInterval(() => this.update(), this.interval)
		return this
	}

	/**
	 * Discards the automatic updates of the terminal's title.
	 * @returns {Spinner}
	 * @chainable
	 * @public
	 */
	stop () {
		if (this.timer) {
			clearInterval(this.timer)
			this.timer = null
		}
		return this
	}
}

module.exports = Spinner
