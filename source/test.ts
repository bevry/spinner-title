// external
import { equal, undef } from 'assert-helpers'
import kava from 'kava'

// builtin
import { PassThrough } from 'stream'
import { stdout, stderr } from 'process'

// us
import spinners from 'cli-spinners'
import Spinner from './index.js'

// tests
kava.suite('spinner-title', function (suite, test) {
	suite('options', function (suite, test) {
		test('defaults', function () {
			const spinner = new Spinner()
			equal(spinner.frames, spinners.dots.frames, 'dots is the default')
			equal(spinner.interval, spinners.dots.interval, 'dots is the default')
			undef(spinner.title, 'title is null')
			equal(spinner.stream, stderr, 'stderr is the default')
		})
		test('changing style', function () {
			const spinner = new Spinner({ style: 'monkey' })
			equal(spinner.frames, spinners.monkey.frames, 'monkey was used')
			equal(spinner.interval, spinners.monkey.interval, 'monkey was used')
		})
		test('ovewrite interval', function () {
			const spinner = new Spinner({ style: 'monkey', interval: -1 })
			equal(spinner.frames, spinners.monkey.frames, 'monkey was used')
			equal(spinner.interval, -1, 'interval was overwritten')
		})
		test('ovewrite frames', function () {
			const frames = ['a', 'b']
			const spinner = new Spinner({ style: 'monkey', frames })
			equal(spinner.frames, frames, 'monkey was used')
			equal(spinner.interval, spinners.monkey.interval, 'monkey was used')
		})
		test('ovewrite strean', function () {
			const spinner = new Spinner({ stream: stdout })
			equal(spinner.stream, stdout, 'monkey was used')
		})
	})
	test('title works', function (complete) {
		const frames = ['a', 'b']
		let data = '',
			updates = 0
		function title(this: Spinner) {
			++updates
			return '[' + this.spin() + ']'
		}

		const stream = new PassThrough()
		stream.on('data', (chunk) => {
			data += chunk.toString()
		})
		stream.on('end', function () {
			equal(
				data,
				['a', 'b', 'a', 'b', 'a']
					.map((frame) => spinner.open + '[' + frame + ']' + spinner.close)
					.join('')
			)
			equal(updates, 5, 'title was called correctly')
			complete()
		})

		const spinner = new Spinner({ title, frames, stream, interval: 100 })
		spinner.update()
		equal(updates, 1, 'title was called manually correctly')

		spinner.start()
		setTimeout(() => {
			equal(updates, 4, 'title was called correctly')
		}, 350)
		setTimeout(() => {
			equal(updates, 5, 'title was called correctly')
			spinner.stop()
			stream.end()
		}, 450)
	})
})
