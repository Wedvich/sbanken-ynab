exports.id = 779;
exports.ids = [779];
exports.modules = {

/***/ 18971:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.execute = void 0;
const child_process_1 = __webpack_require__(63129);
// Executes a subprocess.
// Resolves successfully on exit code 0 with all the info
// available
async function execute(command, args, options) {
    const spawnOptions = {
        shell: true,
        detached: true,
    };
    if (options && options.cwd) {
        spawnOptions.cwd = options.cwd;
    }
    const fullCommand = `${command} ${args.join(' ')}`;
    const startTime = Date.now();
    let processId;
    try {
        const worker = child_process_1.spawn(command, args, options);
        processId = worker.pid;
        return await new Promise((resolve, reject) => {
            let stderr = '';
            let stdout = '';
            worker.stdout.on('data', (data) => {
                stdout += data;
            });
            worker.stderr.on('data', (data) => {
                stderr += data;
            });
            worker.on('error', (e) => {
                reject({
                    stderr,
                    stdout,
                    error: e,
                    duration: Date.now() - startTime,
                    command: fullCommand,
                });
            });
            worker.on('exit', (code) => {
                if (code && code > 0) {
                    resolve({
                        stderr,
                        stdout,
                        duration: Date.now() - startTime,
                        command: fullCommand,
                        exitCode: code,
                    });
                }
                else {
                    resolve({
                        stderr,
                        stdout,
                        duration: Date.now() - startTime,
                        command: fullCommand,
                        exitCode: code,
                    });
                }
            });
        });
    }
    finally {
        if (processId) {
            // Additional anti-zombie protection.
            // Process here should be already stopped.
            try {
                process.kill(processId, 'SIGKILL');
            }
            catch (e) {
                // Process already stopped.
            }
        }
    }
}
exports.execute = execute;
//# sourceMappingURL=child-process.js.map

/***/ }),

/***/ 68026:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var child_process_1 = __webpack_require__(18971);
Object.defineProperty(exports, "execute", ({ enumerable: true, get: function () { return child_process_1.execute; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 21591:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPipenvInstalled = exports.extractPipenvVersion = void 0;
const debugLib = __webpack_require__(92259);
const child_process_1 = __webpack_require__(68026);
const debug = debugLib('snyk-fix:python:Pipfile');
function extractPipenvVersion(stdout) {
    /* stdout example:
     * pipenv, version 2018.11.26\n
     */
    let version = null;
    const re = new RegExp(/^pipenv,\sversion\s([0-9.]+)/, 'g');
    const match = re.exec(stdout);
    if (match) {
        version = match[1];
    }
    return version;
}
exports.extractPipenvVersion = extractPipenvVersion;
async function isPipenvInstalled() {
    let res;
    try {
        res = await child_process_1.execute('pipenv', ['--version'], {});
    }
    catch (e) {
        debug('Execute failed with', e);
        res = e;
    }
    if (res.exitCode !== 0) {
        throw res.error;
    }
    return { version: extractPipenvVersion(res.stdout) };
}
exports.isPipenvInstalled = isPipenvInstalled;
//# sourceMappingURL=check-pip-env-installed.js.map

/***/ }),

/***/ 91989:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var check_pip_env_installed_1 = __webpack_require__(21591);
Object.defineProperty(exports, "isPipenvInstalled", ({ enumerable: true, get: function () { return check_pip_env_installed_1.isPipenvInstalled; } }));
var is_pipenv_supported_version_1 = __webpack_require__(97149);
Object.defineProperty(exports, "isPipenvSupportedVersion", ({ enumerable: true, get: function () { return is_pipenv_supported_version_1.isPipenvSupportedVersion; } }));
var pipenv_install_1 = __webpack_require__(96194);
Object.defineProperty(exports, "pipenvInstall", ({ enumerable: true, get: function () { return pipenv_install_1.pipenvInstall; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 97149:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPipenvSupportedVersion = void 0;
function isPipenvSupportedVersion(version) {
    // See all versions: https://pipenv.pypa.io/en/latest/changelog/
    // Update SUPPORTED.md when this is updated
    const SUPPORTED_PIPENV_VERSIONS = [
        '2020.11.4',
        '2020.8.13',
        '2020.6.2',
        '2020.5.28',
        '2018.11.26',
        '2018.11.14',
        '2018.10.13',
        '2018.10.9',
        '2018.7.1',
        '2018.6.25',
    ];
    let supported = false;
    if (SUPPORTED_PIPENV_VERSIONS.includes(version)) {
        supported = true;
    }
    return {
        supported,
        versions: SUPPORTED_PIPENV_VERSIONS,
    };
}
exports.isPipenvSupportedVersion = isPipenvSupportedVersion;
//# sourceMappingURL=is-pipenv-supported-version.js.map

/***/ }),

/***/ 96194:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pipenvInstall = void 0;
const debugLib = __webpack_require__(92259);
const bottleneck_1 = __webpack_require__(35861);
const child_process_1 = __webpack_require__(68026);
const debug = debugLib('snyk-fix:python:Pipfile');
const limiter = new bottleneck_1.default({
    maxConcurrent: 4,
});
// https://pipenv.pypa.io/en/latest/advanced/#changing-default-python-versions
function getPythonArgs(config) {
    const args = [];
    if (config.python) {
        args.push('--python', config.python); // Performs the installation in a virtualenv using the provided Python interpreter.
    }
    if (process.env.PIPENV_SKIP_LOCK) {
        args.push('--skip-lock');
    }
    return args;
}
async function runPipenvInstall(projectPath, requirements, config) {
    const args = ['install', ...requirements];
    const pythonArg = getPythonArgs(config);
    if (pythonArg) {
        args.push(...pythonArg);
    }
    let res;
    try {
        res = await child_process_1.execute('pipenv', args, {
            cwd: projectPath,
        });
    }
    catch (e) {
        debug('Execute failed with', e);
        res = e;
    }
    return res;
}
exports.pipenvInstall = limiter.wrap(runPipenvInstall);
//# sourceMappingURL=pipenv-install.js.map

/***/ }),

/***/ 35535:
/***/ ((module, exports, __webpack_require__) => {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(97977)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ 97977:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(57824);
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => enableOverride === null ? createDebug.enabled(namespace) : enableOverride,
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ 92259:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = __webpack_require__(35535);
} else {
	module.exports = __webpack_require__(66862);
}


/***/ }),

/***/ 66862:
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

const tty = __webpack_require__(33867);
const util = __webpack_require__(31669);

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(
	() => {},
	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
);

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = __webpack_require__(92130);

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = __webpack_require__(97977)(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.split('\n')
		.map(str => str.trim())
		.join(' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


/***/ }),

/***/ 42925:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPoetryInstalled = exports.extractPoetryVersion = void 0;
const debugLib = __webpack_require__(15158);
const child_process_1 = __webpack_require__(68026);
const debug = debugLib('snyk-fix:poetry');
function extractPoetryVersion(stdout) {
    /* stdout example:
     * Poetry version 1.1.4
     */
    let version = null;
    const re = new RegExp(/^Poetry\sversion\s([0-9.]+)/, 'g');
    const match = re.exec(stdout);
    if (match) {
        version = match[1];
    }
    return version;
}
exports.extractPoetryVersion = extractPoetryVersion;
async function isPoetryInstalled() {
    let res;
    try {
        res = await child_process_1.execute('poetry', ['--version'], {});
    }
    catch (e) {
        debug('Execute failed with', e);
        res = e;
    }
    if (res.exitCode !== 0) {
        throw res.error;
    }
    return { version: extractPoetryVersion(res.stdout) };
}
exports.isPoetryInstalled = isPoetryInstalled;
//# sourceMappingURL=check-poetry-is-installed.js.map

/***/ }),

/***/ 69671:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var check_poetry_is_installed_1 = __webpack_require__(42925);
Object.defineProperty(exports, "isPoetryInstalled", ({ enumerable: true, get: function () { return check_poetry_is_installed_1.isPoetryInstalled; } }));
var is_poetry_supported_version_1 = __webpack_require__(29257);
Object.defineProperty(exports, "isPoetrySupportedVersion", ({ enumerable: true, get: function () { return is_poetry_supported_version_1.isPoetrySupportedVersion; } }));
var poetry_add_1 = __webpack_require__(10055);
Object.defineProperty(exports, "poetryAdd", ({ enumerable: true, get: function () { return poetry_add_1.poetryAdd; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 29257:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPoetrySupportedVersion = void 0;
function isPoetrySupportedVersion(version) {
    // See all versions: https://github.com/python-poetry/poetry/releases
    // Update SUPPORTED.md when this is updated
    // Not all versions listed below as not all are tested but most likely
    // they are supported
    const SUPPORTED_POETRY_VERSIONS = [
        '1.1.9',
        '1.1.8',
        '1.1.7',
        '1.1.6',
        '1.1.5',
        '1.1.4',
        '1.0.9',
        '1.0.8',
        '1.0.7',
    ];
    let supported = false;
    if (SUPPORTED_POETRY_VERSIONS.includes(version)) {
        supported = true;
    }
    return {
        supported,
        versions: SUPPORTED_POETRY_VERSIONS,
    };
}
exports.isPoetrySupportedVersion = isPoetrySupportedVersion;
//# sourceMappingURL=is-poetry-supported-version.js.map

/***/ }),

/***/ 10055:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.poetryAdd = void 0;
const debugLib = __webpack_require__(15158);
const bottleneck_1 = __webpack_require__(35861);
const child_process_1 = __webpack_require__(68026);
const debug = debugLib('snyk-fix:poetry');
const limiter = new bottleneck_1.default({
    maxConcurrent: 4,
});
async function runPoetryAdd(projectPath, dependencyUpdates, config) {
    const args = ['add', ...dependencyUpdates];
    let res;
    if (config.dev) {
        args.push('--dev');
    }
    if (config.python) {
        try {
            // tell poetry to use the given interpreter
            // https://python-poetry.org/docs/managing-environments/
            await child_process_1.execute('poetry', ['env', 'use', config.python], {
                cwd: projectPath,
            });
        }
        catch (e) {
            debug(`'poetry use env ${config.python}' failed with`, e);
        }
    }
    try {
        res = await child_process_1.execute('poetry', args, {
            cwd: projectPath,
        });
    }
    catch (e) {
        debug('Execute failed with', e);
        res = e;
    }
    if (config.python) {
        try {
            // set it back to system python
            await child_process_1.execute('poetry', ['env', 'use', 'system'], {
                cwd: projectPath,
            });
        }
        catch (e) {
            debug(`'poetry use env system' failed with`, e);
        }
    }
    return res;
}
exports.poetryAdd = limiter.wrap(runPoetryAdd);
//# sourceMappingURL=poetry-add.js.map

/***/ }),

/***/ 9526:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Batcher, Events, parser;
parser = __webpack_require__(88092);
Events = __webpack_require__(33800);

Batcher = function () {
  class Batcher {
    constructor(options = {}) {
      this.options = options;
      parser.load(this.options, this.defaults, this);
      this.Events = new Events(this);
      this._arr = [];

      this._resetPromise();

      this._lastFlush = Date.now();
    }

    _resetPromise() {
      return this._promise = new this.Promise((res, rej) => {
        return this._resolve = res;
      });
    }

    _flush() {
      clearTimeout(this._timeout);
      this._lastFlush = Date.now();

      this._resolve();

      this.Events.trigger("batch", this._arr);
      this._arr = [];
      return this._resetPromise();
    }

    add(data) {
      var ret;

      this._arr.push(data);

      ret = this._promise;

      if (this._arr.length === this.maxSize) {
        this._flush();
      } else if (this.maxTime != null && this._arr.length === 1) {
        this._timeout = setTimeout(() => {
          return this._flush();
        }, this.maxTime);
      }

      return ret;
    }

  }

  ;
  Batcher.prototype.defaults = {
    maxTime: null,
    maxSize: null,
    Promise: Promise
  };
  return Batcher;
}.call(void 0);

module.exports = Batcher;

/***/ }),

/***/ 19529:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Bottleneck,
    DEFAULT_PRIORITY,
    Events,
    Job,
    LocalDatastore,
    NUM_PRIORITIES,
    Queues,
    RedisDatastore,
    States,
    Sync,
    parser,
    splice = [].splice;
NUM_PRIORITIES = 10;
DEFAULT_PRIORITY = 5;
parser = __webpack_require__(88092);
Queues = __webpack_require__(21186);
Job = __webpack_require__(21262);
LocalDatastore = __webpack_require__(27705);
RedisDatastore = __webpack_require__(36220);
Events = __webpack_require__(33800);
States = __webpack_require__(65376);
Sync = __webpack_require__(64915);

Bottleneck = function () {
  class Bottleneck {
    constructor(options = {}, ...invalid) {
      var storeInstanceOptions, storeOptions;
      this._addToQueue = this._addToQueue.bind(this);

      this._validateOptions(options, invalid);

      parser.load(options, this.instanceDefaults, this);
      this._queues = new Queues(NUM_PRIORITIES);
      this._scheduled = {};
      this._states = new States(["RECEIVED", "QUEUED", "RUNNING", "EXECUTING"].concat(this.trackDoneStatus ? ["DONE"] : []));
      this._limiter = null;
      this.Events = new Events(this);
      this._submitLock = new Sync("submit", this.Promise);
      this._registerLock = new Sync("register", this.Promise);
      storeOptions = parser.load(options, this.storeDefaults, {});

      this._store = function () {
        if (this.datastore === "redis" || this.datastore === "ioredis" || this.connection != null) {
          storeInstanceOptions = parser.load(options, this.redisStoreDefaults, {});
          return new RedisDatastore(this, storeOptions, storeInstanceOptions);
        } else if (this.datastore === "local") {
          storeInstanceOptions = parser.load(options, this.localStoreDefaults, {});
          return new LocalDatastore(this, storeOptions, storeInstanceOptions);
        } else {
          throw new Bottleneck.prototype.BottleneckError(`Invalid datastore type: ${this.datastore}`);
        }
      }.call(this);

      this._queues.on("leftzero", () => {
        var ref;
        return (ref = this._store.heartbeat) != null ? typeof ref.ref === "function" ? ref.ref() : void 0 : void 0;
      });

      this._queues.on("zero", () => {
        var ref;
        return (ref = this._store.heartbeat) != null ? typeof ref.unref === "function" ? ref.unref() : void 0 : void 0;
      });
    }

    _validateOptions(options, invalid) {
      if (!(options != null && typeof options === "object" && invalid.length === 0)) {
        throw new Bottleneck.prototype.BottleneckError("Bottleneck v2 takes a single object argument. Refer to https://github.com/SGrondin/bottleneck#upgrading-to-v2 if you're upgrading from Bottleneck v1.");
      }
    }

    ready() {
      return this._store.ready;
    }

    clients() {
      return this._store.clients;
    }

    channel() {
      return `b_${this.id}`;
    }

    channel_client() {
      return `b_${this.id}_${this._store.clientId}`;
    }

    publish(message) {
      return this._store.__publish__(message);
    }

    disconnect(flush = true) {
      return this._store.__disconnect__(flush);
    }

    chain(_limiter) {
      this._limiter = _limiter;
      return this;
    }

    queued(priority) {
      return this._queues.queued(priority);
    }

    clusterQueued() {
      return this._store.__queued__();
    }

    empty() {
      return this.queued() === 0 && this._submitLock.isEmpty();
    }

    running() {
      return this._store.__running__();
    }

    done() {
      return this._store.__done__();
    }

    jobStatus(id) {
      return this._states.jobStatus(id);
    }

    jobs(status) {
      return this._states.statusJobs(status);
    }

    counts() {
      return this._states.statusCounts();
    }

    _randomIndex() {
      return Math.random().toString(36).slice(2);
    }

    check(weight = 1) {
      return this._store.__check__(weight);
    }

    _clearGlobalState(index) {
      if (this._scheduled[index] != null) {
        clearTimeout(this._scheduled[index].expiration);
        delete this._scheduled[index];
        return true;
      } else {
        return false;
      }
    }

    _free(index, job, options, eventInfo) {
      var _this = this;

      return _asyncToGenerator(function* () {
        var e, running;

        try {
          var _ref = yield _this._store.__free__(index, options.weight);

          running = _ref.running;

          _this.Events.trigger("debug", `Freed ${options.id}`, eventInfo);

          if (running === 0 && _this.empty()) {
            return _this.Events.trigger("idle");
          }
        } catch (error1) {
          e = error1;
          return _this.Events.trigger("error", e);
        }
      })();
    }

    _run(index, job, wait) {
      var clearGlobalState, free, run;
      job.doRun();
      clearGlobalState = this._clearGlobalState.bind(this, index);
      run = this._run.bind(this, index, job);
      free = this._free.bind(this, index, job);
      return this._scheduled[index] = {
        timeout: setTimeout(() => {
          return job.doExecute(this._limiter, clearGlobalState, run, free);
        }, wait),
        expiration: job.options.expiration != null ? setTimeout(function () {
          return job.doExpire(clearGlobalState, run, free);
        }, wait + job.options.expiration) : void 0,
        job: job
      };
    }

    _drainOne(capacity) {
      return this._registerLock.schedule(() => {
        var args, index, next, options, queue;

        if (this.queued() === 0) {
          return this.Promise.resolve(null);
        }

        queue = this._queues.getFirst();

        var _next2 = next = queue.first();

        options = _next2.options;
        args = _next2.args;

        if (capacity != null && options.weight > capacity) {
          return this.Promise.resolve(null);
        }

        this.Events.trigger("debug", `Draining ${options.id}`, {
          args,
          options
        });
        index = this._randomIndex();
        return this._store.__register__(index, options.weight, options.expiration).then(({
          success,
          wait,
          reservoir
        }) => {
          var empty;
          this.Events.trigger("debug", `Drained ${options.id}`, {
            success,
            args,
            options
          });

          if (success) {
            queue.shift();
            empty = this.empty();

            if (empty) {
              this.Events.trigger("empty");
            }

            if (reservoir === 0) {
              this.Events.trigger("depleted", empty);
            }

            this._run(index, next, wait);

            return this.Promise.resolve(options.weight);
          } else {
            return this.Promise.resolve(null);
          }
        });
      });
    }

    _drainAll(capacity, total = 0) {
      return this._drainOne(capacity).then(drained => {
        var newCapacity;

        if (drained != null) {
          newCapacity = capacity != null ? capacity - drained : capacity;
          return this._drainAll(newCapacity, total + drained);
        } else {
          return this.Promise.resolve(total);
        }
      }).catch(e => {
        return this.Events.trigger("error", e);
      });
    }

    _dropAllQueued(message) {
      return this._queues.shiftAll(function (job) {
        return job.doDrop({
          message
        });
      });
    }

    stop(options = {}) {
      var done, waitForExecuting;
      options = parser.load(options, this.stopDefaults);

      waitForExecuting = at => {
        var finished;

        finished = () => {
          var counts;
          counts = this._states.counts;
          return counts[0] + counts[1] + counts[2] + counts[3] === at;
        };

        return new this.Promise((resolve, reject) => {
          if (finished()) {
            return resolve();
          } else {
            return this.on("done", () => {
              if (finished()) {
                this.removeAllListeners("done");
                return resolve();
              }
            });
          }
        });
      };

      done = options.dropWaitingJobs ? (this._run = function (index, next) {
        return next.doDrop({
          message: options.dropErrorMessage
        });
      }, this._drainOne = () => {
        return this.Promise.resolve(null);
      }, this._registerLock.schedule(() => {
        return this._submitLock.schedule(() => {
          var k, ref, v;
          ref = this._scheduled;

          for (k in ref) {
            v = ref[k];

            if (this.jobStatus(v.job.options.id) === "RUNNING") {
              clearTimeout(v.timeout);
              clearTimeout(v.expiration);
              v.job.doDrop({
                message: options.dropErrorMessage
              });
            }
          }

          this._dropAllQueued(options.dropErrorMessage);

          return waitForExecuting(0);
        });
      })) : this.schedule({
        priority: NUM_PRIORITIES - 1,
        weight: 0
      }, () => {
        return waitForExecuting(1);
      });

      this._receive = function (job) {
        return job._reject(new Bottleneck.prototype.BottleneckError(options.enqueueErrorMessage));
      };

      this.stop = () => {
        return this.Promise.reject(new Bottleneck.prototype.BottleneckError("stop() has already been called"));
      };

      return done;
    }

    _addToQueue(job) {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var args, blocked, error, options, reachedHWM, shifted, strategy;
        args = job.args;
        options = job.options;

        try {
          var _ref2 = yield _this2._store.__submit__(_this2.queued(), options.weight);

          reachedHWM = _ref2.reachedHWM;
          blocked = _ref2.blocked;
          strategy = _ref2.strategy;
        } catch (error1) {
          error = error1;

          _this2.Events.trigger("debug", `Could not queue ${options.id}`, {
            args,
            options,
            error
          });

          job.doDrop({
            error
          });
          return false;
        }

        if (blocked) {
          job.doDrop();
          return true;
        } else if (reachedHWM) {
          shifted = strategy === Bottleneck.prototype.strategy.LEAK ? _this2._queues.shiftLastFrom(options.priority) : strategy === Bottleneck.prototype.strategy.OVERFLOW_PRIORITY ? _this2._queues.shiftLastFrom(options.priority + 1) : strategy === Bottleneck.prototype.strategy.OVERFLOW ? job : void 0;

          if (shifted != null) {
            shifted.doDrop();
          }

          if (shifted == null || strategy === Bottleneck.prototype.strategy.OVERFLOW) {
            if (shifted == null) {
              job.doDrop();
            }

            return reachedHWM;
          }
        }

        job.doQueue(reachedHWM, blocked);

        _this2._queues.push(job);

        yield _this2._drainAll();
        return reachedHWM;
      })();
    }

    _receive(job) {
      if (this._states.jobStatus(job.options.id) != null) {
        job._reject(new Bottleneck.prototype.BottleneckError(`A job with the same id already exists (id=${job.options.id})`));

        return false;
      } else {
        job.doReceive();
        return this._submitLock.schedule(this._addToQueue, job);
      }
    }

    submit(...args) {
      var cb, fn, job, options, ref, ref1, task;

      if (typeof args[0] === "function") {
        var _ref3, _ref4, _splice$call, _splice$call2;

        ref = args, (_ref3 = ref, _ref4 = _toArray(_ref3), fn = _ref4[0], args = _ref4.slice(1), _ref3), (_splice$call = splice.call(args, -1), _splice$call2 = _slicedToArray(_splice$call, 1), cb = _splice$call2[0], _splice$call);
        options = parser.load({}, this.jobDefaults);
      } else {
        var _ref5, _ref6, _splice$call3, _splice$call4;

        ref1 = args, (_ref5 = ref1, _ref6 = _toArray(_ref5), options = _ref6[0], fn = _ref6[1], args = _ref6.slice(2), _ref5), (_splice$call3 = splice.call(args, -1), _splice$call4 = _slicedToArray(_splice$call3, 1), cb = _splice$call4[0], _splice$call3);
        options = parser.load(options, this.jobDefaults);
      }

      task = (...args) => {
        return new this.Promise(function (resolve, reject) {
          return fn(...args, function (...args) {
            return (args[0] != null ? reject : resolve)(args);
          });
        });
      };

      job = new Job(task, args, options, this.jobDefaults, this.rejectOnDrop, this.Events, this._states, this.Promise);
      job.promise.then(function (args) {
        return typeof cb === "function" ? cb(...args) : void 0;
      }).catch(function (args) {
        if (Array.isArray(args)) {
          return typeof cb === "function" ? cb(...args) : void 0;
        } else {
          return typeof cb === "function" ? cb(args) : void 0;
        }
      });
      return this._receive(job);
    }

    schedule(...args) {
      var job, options, task;

      if (typeof args[0] === "function") {
        var _args = args;

        var _args2 = _toArray(_args);

        task = _args2[0];
        args = _args2.slice(1);
        options = {};
      } else {
        var _args3 = args;

        var _args4 = _toArray(_args3);

        options = _args4[0];
        task = _args4[1];
        args = _args4.slice(2);
      }

      job = new Job(task, args, options, this.jobDefaults, this.rejectOnDrop, this.Events, this._states, this.Promise);

      this._receive(job);

      return job.promise;
    }

    wrap(fn) {
      var schedule, wrapped;
      schedule = this.schedule.bind(this);

      wrapped = function wrapped(...args) {
        return schedule(fn.bind(this), ...args);
      };

      wrapped.withOptions = function (options, ...args) {
        return schedule(options, fn, ...args);
      };

      return wrapped;
    }

    updateSettings(options = {}) {
      var _this3 = this;

      return _asyncToGenerator(function* () {
        yield _this3._store.__updateSettings__(parser.overwrite(options, _this3.storeDefaults));
        parser.overwrite(options, _this3.instanceDefaults, _this3);
        return _this3;
      })();
    }

    currentReservoir() {
      return this._store.__currentReservoir__();
    }

    incrementReservoir(incr = 0) {
      return this._store.__incrementReservoir__(incr);
    }

  }

  ;
  Bottleneck.default = Bottleneck;
  Bottleneck.Events = Events;
  Bottleneck.version = Bottleneck.prototype.version = __webpack_require__(82636)/* .version */ .i;
  Bottleneck.strategy = Bottleneck.prototype.strategy = {
    LEAK: 1,
    OVERFLOW: 2,
    OVERFLOW_PRIORITY: 4,
    BLOCK: 3
  };
  Bottleneck.BottleneckError = Bottleneck.prototype.BottleneckError = __webpack_require__(34006);
  Bottleneck.Group = Bottleneck.prototype.Group = __webpack_require__(99158);
  Bottleneck.RedisConnection = Bottleneck.prototype.RedisConnection = __webpack_require__(66427);
  Bottleneck.IORedisConnection = Bottleneck.prototype.IORedisConnection = __webpack_require__(9442);
  Bottleneck.Batcher = Bottleneck.prototype.Batcher = __webpack_require__(9526);
  Bottleneck.prototype.jobDefaults = {
    priority: DEFAULT_PRIORITY,
    weight: 1,
    expiration: null,
    id: "<no-id>"
  };
  Bottleneck.prototype.storeDefaults = {
    maxConcurrent: null,
    minTime: 0,
    highWater: null,
    strategy: Bottleneck.prototype.strategy.LEAK,
    penalty: null,
    reservoir: null,
    reservoirRefreshInterval: null,
    reservoirRefreshAmount: null,
    reservoirIncreaseInterval: null,
    reservoirIncreaseAmount: null,
    reservoirIncreaseMaximum: null
  };
  Bottleneck.prototype.localStoreDefaults = {
    Promise: Promise,
    timeout: null,
    heartbeatInterval: 250
  };
  Bottleneck.prototype.redisStoreDefaults = {
    Promise: Promise,
    timeout: null,
    heartbeatInterval: 5000,
    clientTimeout: 10000,
    Redis: null,
    clientOptions: {},
    clusterNodes: null,
    clearDatastore: false,
    connection: null
  };
  Bottleneck.prototype.instanceDefaults = {
    datastore: "local",
    connection: null,
    id: "<no-id>",
    rejectOnDrop: true,
    trackDoneStatus: false,
    Promise: Promise
  };
  Bottleneck.prototype.stopDefaults = {
    enqueueErrorMessage: "This limiter has been stopped and cannot accept new jobs.",
    dropWaitingJobs: true,
    dropErrorMessage: "This limiter has been stopped."
  };
  return Bottleneck;
}.call(void 0);

module.exports = Bottleneck;

/***/ }),

/***/ 34006:
/***/ ((module) => {

"use strict";


var BottleneckError;
BottleneckError = class BottleneckError extends Error {};
module.exports = BottleneckError;

/***/ }),

/***/ 70938:
/***/ ((module) => {

"use strict";


var DLList;
DLList = class DLList {
  constructor(incr, decr) {
    this.incr = incr;
    this.decr = decr;
    this._first = null;
    this._last = null;
    this.length = 0;
  }

  push(value) {
    var node;
    this.length++;

    if (typeof this.incr === "function") {
      this.incr();
    }

    node = {
      value,
      prev: this._last,
      next: null
    };

    if (this._last != null) {
      this._last.next = node;
      this._last = node;
    } else {
      this._first = this._last = node;
    }

    return void 0;
  }

  shift() {
    var value;

    if (this._first == null) {
      return;
    } else {
      this.length--;

      if (typeof this.decr === "function") {
        this.decr();
      }
    }

    value = this._first.value;

    if ((this._first = this._first.next) != null) {
      this._first.prev = null;
    } else {
      this._last = null;
    }

    return value;
  }

  first() {
    if (this._first != null) {
      return this._first.value;
    }
  }

  getArray() {
    var node, ref, results;
    node = this._first;
    results = [];

    while (node != null) {
      results.push((ref = node, node = node.next, ref.value));
    }

    return results;
  }

  forEachShift(cb) {
    var node;
    node = this.shift();

    while (node != null) {
      cb(node), node = this.shift();
    }

    return void 0;
  }

  debug() {
    var node, ref, ref1, ref2, results;
    node = this._first;
    results = [];

    while (node != null) {
      results.push((ref = node, node = node.next, {
        value: ref.value,
        prev: (ref1 = ref.prev) != null ? ref1.value : void 0,
        next: (ref2 = ref.next) != null ? ref2.value : void 0
      }));
    }

    return results;
  }

};
module.exports = DLList;

/***/ }),

/***/ 33800:
/***/ ((module) => {

"use strict";


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Events;
Events = class Events {
  constructor(instance) {
    this.instance = instance;
    this._events = {};

    if (this.instance.on != null || this.instance.once != null || this.instance.removeAllListeners != null) {
      throw new Error("An Emitter already exists for this object");
    }

    this.instance.on = (name, cb) => {
      return this._addListener(name, "many", cb);
    };

    this.instance.once = (name, cb) => {
      return this._addListener(name, "once", cb);
    };

    this.instance.removeAllListeners = (name = null) => {
      if (name != null) {
        return delete this._events[name];
      } else {
        return this._events = {};
      }
    };
  }

  _addListener(name, status, cb) {
    var base;

    if ((base = this._events)[name] == null) {
      base[name] = [];
    }

    this._events[name].push({
      cb,
      status
    });

    return this.instance;
  }

  listenerCount(name) {
    if (this._events[name] != null) {
      return this._events[name].length;
    } else {
      return 0;
    }
  }

  trigger(name, ...args) {
    var _this = this;

    return _asyncToGenerator(function* () {
      var e, promises;

      try {
        if (name !== "debug") {
          _this.trigger("debug", `Event triggered: ${name}`, args);
        }

        if (_this._events[name] == null) {
          return;
        }

        _this._events[name] = _this._events[name].filter(function (listener) {
          return listener.status !== "none";
        });
        promises = _this._events[name].map(
        /*#__PURE__*/
        function () {
          var _ref = _asyncToGenerator(function* (listener) {
            var e, returned;

            if (listener.status === "none") {
              return;
            }

            if (listener.status === "once") {
              listener.status = "none";
            }

            try {
              returned = typeof listener.cb === "function" ? listener.cb(...args) : void 0;

              if (typeof (returned != null ? returned.then : void 0) === "function") {
                return yield returned;
              } else {
                return returned;
              }
            } catch (error) {
              e = error;

              if (true) {
                _this.trigger("error", e);
              }

              return null;
            }
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }());
        return (yield Promise.all(promises)).find(function (x) {
          return x != null;
        });
      } catch (error) {
        e = error;

        if (true) {
          _this.trigger("error", e);
        }

        return null;
      }
    })();
  }

};
module.exports = Events;

/***/ }),

/***/ 99158:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Events, Group, IORedisConnection, RedisConnection, Scripts, parser;
parser = __webpack_require__(88092);
Events = __webpack_require__(33800);
RedisConnection = __webpack_require__(66427);
IORedisConnection = __webpack_require__(9442);
Scripts = __webpack_require__(40812);

Group = function () {
  class Group {
    constructor(limiterOptions = {}) {
      this.deleteKey = this.deleteKey.bind(this);
      this.limiterOptions = limiterOptions;
      parser.load(this.limiterOptions, this.defaults, this);
      this.Events = new Events(this);
      this.instances = {};
      this.Bottleneck = __webpack_require__(19529);

      this._startAutoCleanup();

      this.sharedConnection = this.connection != null;

      if (this.connection == null) {
        if (this.limiterOptions.datastore === "redis") {
          this.connection = new RedisConnection(Object.assign({}, this.limiterOptions, {
            Events: this.Events
          }));
        } else if (this.limiterOptions.datastore === "ioredis") {
          this.connection = new IORedisConnection(Object.assign({}, this.limiterOptions, {
            Events: this.Events
          }));
        }
      }
    }

    key(key = "") {
      var ref;
      return (ref = this.instances[key]) != null ? ref : (() => {
        var limiter;
        limiter = this.instances[key] = new this.Bottleneck(Object.assign(this.limiterOptions, {
          id: `${this.id}-${key}`,
          timeout: this.timeout,
          connection: this.connection
        }));
        this.Events.trigger("created", limiter, key);
        return limiter;
      })();
    }

    deleteKey(key = "") {
      var _this = this;

      return _asyncToGenerator(function* () {
        var deleted, instance;
        instance = _this.instances[key];

        if (_this.connection) {
          deleted = yield _this.connection.__runCommand__(['del', ...Scripts.allKeys(`${_this.id}-${key}`)]);
        }

        if (instance != null) {
          delete _this.instances[key];
          yield instance.disconnect();
        }

        return instance != null || deleted > 0;
      })();
    }

    limiters() {
      var k, ref, results, v;
      ref = this.instances;
      results = [];

      for (k in ref) {
        v = ref[k];
        results.push({
          key: k,
          limiter: v
        });
      }

      return results;
    }

    keys() {
      return Object.keys(this.instances);
    }

    clusterKeys() {
      var _this2 = this;

      return _asyncToGenerator(function* () {
        var cursor, end, found, i, k, keys, len, next, start;

        if (_this2.connection == null) {
          return _this2.Promise.resolve(_this2.keys());
        }

        keys = [];
        cursor = null;
        start = `b_${_this2.id}-`.length;
        end = "_settings".length;

        while (cursor !== 0) {
          var _ref = yield _this2.connection.__runCommand__(["scan", cursor != null ? cursor : 0, "match", `b_${_this2.id}-*_settings`, "count", 10000]);

          var _ref2 = _slicedToArray(_ref, 2);

          next = _ref2[0];
          found = _ref2[1];
          cursor = ~~next;

          for (i = 0, len = found.length; i < len; i++) {
            k = found[i];
            keys.push(k.slice(start, -end));
          }
        }

        return keys;
      })();
    }

    _startAutoCleanup() {
      var _this3 = this;

      var base;
      clearInterval(this.interval);
      return typeof (base = this.interval = setInterval(
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        var e, k, ref, results, time, v;
        time = Date.now();
        ref = _this3.instances;
        results = [];

        for (k in ref) {
          v = ref[k];

          try {
            if (yield v._store.__groupCheck__(time)) {
              results.push(_this3.deleteKey(k));
            } else {
              results.push(void 0);
            }
          } catch (error) {
            e = error;
            results.push(v.Events.trigger("error", e));
          }
        }

        return results;
      }), this.timeout / 2)).unref === "function" ? base.unref() : void 0;
    }

    updateSettings(options = {}) {
      parser.overwrite(options, this.defaults, this);
      parser.overwrite(options, options, this.limiterOptions);

      if (options.timeout != null) {
        return this._startAutoCleanup();
      }
    }

    disconnect(flush = true) {
      var ref;

      if (!this.sharedConnection) {
        return (ref = this.connection) != null ? ref.disconnect(flush) : void 0;
      }
    }

  }

  ;
  Group.prototype.defaults = {
    timeout: 1000 * 60 * 5,
    connection: null,
    Promise: Promise,
    id: "group-key"
  };
  return Group;
}.call(void 0);

module.exports = Group;

/***/ }),

/***/ 9442:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Events, IORedisConnection, Scripts, parser;
parser = __webpack_require__(88092);
Events = __webpack_require__(33800);
Scripts = __webpack_require__(40812);

IORedisConnection = function () {
  class IORedisConnection {
    constructor(options = {}) {
      parser.load(options, this.defaults, this);

      if (this.Redis == null) {
        this.Redis = eval("require")("ioredis"); // Obfuscated or else Webpack/Angular will try to inline the optional ioredis module. To override this behavior: pass the ioredis module to Bottleneck as the 'Redis' option.
      }

      if (this.Events == null) {
        this.Events = new Events(this);
      }

      this.terminated = false;

      if (this.clusterNodes != null) {
        this.client = new this.Redis.Cluster(this.clusterNodes, this.clientOptions);
        this.subscriber = new this.Redis.Cluster(this.clusterNodes, this.clientOptions);
      } else if (this.client != null && this.client.duplicate == null) {
        this.subscriber = new this.Redis.Cluster(this.client.startupNodes, this.client.options);
      } else {
        if (this.client == null) {
          this.client = new this.Redis(this.clientOptions);
        }

        this.subscriber = this.client.duplicate();
      }

      this.limiters = {};
      this.ready = this.Promise.all([this._setup(this.client, false), this._setup(this.subscriber, true)]).then(() => {
        this._loadScripts();

        return {
          client: this.client,
          subscriber: this.subscriber
        };
      });
    }

    _setup(client, sub) {
      client.setMaxListeners(0);
      return new this.Promise((resolve, reject) => {
        client.on("error", e => {
          return this.Events.trigger("error", e);
        });

        if (sub) {
          client.on("message", (channel, message) => {
            var ref;
            return (ref = this.limiters[channel]) != null ? ref._store.onMessage(channel, message) : void 0;
          });
        }

        if (client.status === "ready") {
          return resolve();
        } else {
          return client.once("ready", resolve);
        }
      });
    }

    _loadScripts() {
      return Scripts.names.forEach(name => {
        return this.client.defineCommand(name, {
          lua: Scripts.payload(name)
        });
      });
    }

    __runCommand__(cmd) {
      var _this = this;

      return _asyncToGenerator(function* () {
        var _, deleted;

        yield _this.ready;

        var _ref = yield _this.client.pipeline([cmd]).exec();

        var _ref2 = _slicedToArray(_ref, 1);

        var _ref2$ = _slicedToArray(_ref2[0], 2);

        _ = _ref2$[0];
        deleted = _ref2$[1];
        return deleted;
      })();
    }

    __addLimiter__(instance) {
      return this.Promise.all([instance.channel(), instance.channel_client()].map(channel => {
        return new this.Promise((resolve, reject) => {
          return this.subscriber.subscribe(channel, () => {
            this.limiters[channel] = instance;
            return resolve();
          });
        });
      }));
    }

    __removeLimiter__(instance) {
      var _this2 = this;

      return [instance.channel(), instance.channel_client()].forEach(
      /*#__PURE__*/
      function () {
        var _ref3 = _asyncToGenerator(function* (channel) {
          if (!_this2.terminated) {
            yield _this2.subscriber.unsubscribe(channel);
          }

          return delete _this2.limiters[channel];
        });

        return function (_x) {
          return _ref3.apply(this, arguments);
        };
      }());
    }

    __scriptArgs__(name, id, args, cb) {
      var keys;
      keys = Scripts.keys(name, id);
      return [keys.length].concat(keys, args, cb);
    }

    __scriptFn__(name) {
      return this.client[name].bind(this.client);
    }

    disconnect(flush = true) {
      var i, k, len, ref;
      ref = Object.keys(this.limiters);

      for (i = 0, len = ref.length; i < len; i++) {
        k = ref[i];
        clearInterval(this.limiters[k]._store.heartbeat);
      }

      this.limiters = {};
      this.terminated = true;

      if (flush) {
        return this.Promise.all([this.client.quit(), this.subscriber.quit()]);
      } else {
        this.client.disconnect();
        this.subscriber.disconnect();
        return this.Promise.resolve();
      }
    }

  }

  ;
  IORedisConnection.prototype.datastore = "ioredis";
  IORedisConnection.prototype.defaults = {
    Redis: null,
    clientOptions: {},
    clusterNodes: null,
    client: null,
    Promise: Promise,
    Events: null
  };
  return IORedisConnection;
}.call(void 0);

module.exports = IORedisConnection;

/***/ }),

/***/ 21262:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var BottleneckError, DEFAULT_PRIORITY, Job, NUM_PRIORITIES, parser;
NUM_PRIORITIES = 10;
DEFAULT_PRIORITY = 5;
parser = __webpack_require__(88092);
BottleneckError = __webpack_require__(34006);
Job = class Job {
  constructor(task, args, options, jobDefaults, rejectOnDrop, Events, _states, Promise) {
    this.task = task;
    this.args = args;
    this.rejectOnDrop = rejectOnDrop;
    this.Events = Events;
    this._states = _states;
    this.Promise = Promise;
    this.options = parser.load(options, jobDefaults);
    this.options.priority = this._sanitizePriority(this.options.priority);

    if (this.options.id === jobDefaults.id) {
      this.options.id = `${this.options.id}-${this._randomIndex()}`;
    }

    this.promise = new this.Promise((_resolve, _reject) => {
      this._resolve = _resolve;
      this._reject = _reject;
    });
    this.retryCount = 0;
  }

  _sanitizePriority(priority) {
    var sProperty;
    sProperty = ~~priority !== priority ? DEFAULT_PRIORITY : priority;

    if (sProperty < 0) {
      return 0;
    } else if (sProperty > NUM_PRIORITIES - 1) {
      return NUM_PRIORITIES - 1;
    } else {
      return sProperty;
    }
  }

  _randomIndex() {
    return Math.random().toString(36).slice(2);
  }

  doDrop({
    error,
    message = "This job has been dropped by Bottleneck"
  } = {}) {
    if (this._states.remove(this.options.id)) {
      if (this.rejectOnDrop) {
        this._reject(error != null ? error : new BottleneckError(message));
      }

      this.Events.trigger("dropped", {
        args: this.args,
        options: this.options,
        task: this.task,
        promise: this.promise
      });
      return true;
    } else {
      return false;
    }
  }

  _assertStatus(expected) {
    var status;
    status = this._states.jobStatus(this.options.id);

    if (!(status === expected || expected === "DONE" && status === null)) {
      throw new BottleneckError(`Invalid job status ${status}, expected ${expected}. Please open an issue at https://github.com/SGrondin/bottleneck/issues`);
    }
  }

  doReceive() {
    this._states.start(this.options.id);

    return this.Events.trigger("received", {
      args: this.args,
      options: this.options
    });
  }

  doQueue(reachedHWM, blocked) {
    this._assertStatus("RECEIVED");

    this._states.next(this.options.id);

    return this.Events.trigger("queued", {
      args: this.args,
      options: this.options,
      reachedHWM,
      blocked
    });
  }

  doRun() {
    if (this.retryCount === 0) {
      this._assertStatus("QUEUED");

      this._states.next(this.options.id);
    } else {
      this._assertStatus("EXECUTING");
    }

    return this.Events.trigger("scheduled", {
      args: this.args,
      options: this.options
    });
  }

  doExecute(chained, clearGlobalState, run, free) {
    var _this = this;

    return _asyncToGenerator(function* () {
      var error, eventInfo, passed;

      if (_this.retryCount === 0) {
        _this._assertStatus("RUNNING");

        _this._states.next(_this.options.id);
      } else {
        _this._assertStatus("EXECUTING");
      }

      eventInfo = {
        args: _this.args,
        options: _this.options,
        retryCount: _this.retryCount
      };

      _this.Events.trigger("executing", eventInfo);

      try {
        passed = yield chained != null ? chained.schedule(_this.options, _this.task, ..._this.args) : _this.task(..._this.args);

        if (clearGlobalState()) {
          _this.doDone(eventInfo);

          yield free(_this.options, eventInfo);

          _this._assertStatus("DONE");

          return _this._resolve(passed);
        }
      } catch (error1) {
        error = error1;
        return _this._onFailure(error, eventInfo, clearGlobalState, run, free);
      }
    })();
  }

  doExpire(clearGlobalState, run, free) {
    var error, eventInfo;

    if (this._states.jobStatus(this.options.id === "RUNNING")) {
      this._states.next(this.options.id);
    }

    this._assertStatus("EXECUTING");

    eventInfo = {
      args: this.args,
      options: this.options,
      retryCount: this.retryCount
    };
    error = new BottleneckError(`This job timed out after ${this.options.expiration} ms.`);
    return this._onFailure(error, eventInfo, clearGlobalState, run, free);
  }

  _onFailure(error, eventInfo, clearGlobalState, run, free) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var retry, retryAfter;

      if (clearGlobalState()) {
        retry = yield _this2.Events.trigger("failed", error, eventInfo);

        if (retry != null) {
          retryAfter = ~~retry;

          _this2.Events.trigger("retry", `Retrying ${_this2.options.id} after ${retryAfter} ms`, eventInfo);

          _this2.retryCount++;
          return run(retryAfter);
        } else {
          _this2.doDone(eventInfo);

          yield free(_this2.options, eventInfo);

          _this2._assertStatus("DONE");

          return _this2._reject(error);
        }
      }
    })();
  }

  doDone(eventInfo) {
    this._assertStatus("EXECUTING");

    this._states.next(this.options.id);

    return this.Events.trigger("done", eventInfo);
  }

};
module.exports = Job;

/***/ }),

/***/ 27705:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var BottleneckError, LocalDatastore, parser;
parser = __webpack_require__(88092);
BottleneckError = __webpack_require__(34006);
LocalDatastore = class LocalDatastore {
  constructor(instance, storeOptions, storeInstanceOptions) {
    this.instance = instance;
    this.storeOptions = storeOptions;
    this.clientId = this.instance._randomIndex();
    parser.load(storeInstanceOptions, storeInstanceOptions, this);
    this._nextRequest = this._lastReservoirRefresh = this._lastReservoirIncrease = Date.now();
    this._running = 0;
    this._done = 0;
    this._unblockTime = 0;
    this.ready = this.Promise.resolve();
    this.clients = {};

    this._startHeartbeat();
  }

  _startHeartbeat() {
    var base;

    if (this.heartbeat == null && (this.storeOptions.reservoirRefreshInterval != null && this.storeOptions.reservoirRefreshAmount != null || this.storeOptions.reservoirIncreaseInterval != null && this.storeOptions.reservoirIncreaseAmount != null)) {
      return typeof (base = this.heartbeat = setInterval(() => {
        var amount, incr, maximum, now, reservoir;
        now = Date.now();

        if (this.storeOptions.reservoirRefreshInterval != null && now >= this._lastReservoirRefresh + this.storeOptions.reservoirRefreshInterval) {
          this._lastReservoirRefresh = now;
          this.storeOptions.reservoir = this.storeOptions.reservoirRefreshAmount;

          this.instance._drainAll(this.computeCapacity());
        }

        if (this.storeOptions.reservoirIncreaseInterval != null && now >= this._lastReservoirIncrease + this.storeOptions.reservoirIncreaseInterval) {
          var _this$storeOptions = this.storeOptions;
          amount = _this$storeOptions.reservoirIncreaseAmount;
          maximum = _this$storeOptions.reservoirIncreaseMaximum;
          reservoir = _this$storeOptions.reservoir;
          this._lastReservoirIncrease = now;
          incr = maximum != null ? Math.min(amount, maximum - reservoir) : amount;

          if (incr > 0) {
            this.storeOptions.reservoir += incr;
            return this.instance._drainAll(this.computeCapacity());
          }
        }
      }, this.heartbeatInterval)).unref === "function" ? base.unref() : void 0;
    } else {
      return clearInterval(this.heartbeat);
    }
  }

  __publish__(message) {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield _this.yieldLoop();
      return _this.instance.Events.trigger("message", message.toString());
    })();
  }

  __disconnect__(flush) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      yield _this2.yieldLoop();
      clearInterval(_this2.heartbeat);
      return _this2.Promise.resolve();
    })();
  }

  yieldLoop(t = 0) {
    return new this.Promise(function (resolve, reject) {
      return setTimeout(resolve, t);
    });
  }

  computePenalty() {
    var ref;
    return (ref = this.storeOptions.penalty) != null ? ref : 15 * this.storeOptions.minTime || 5000;
  }

  __updateSettings__(options) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      yield _this3.yieldLoop();
      parser.overwrite(options, options, _this3.storeOptions);

      _this3._startHeartbeat();

      _this3.instance._drainAll(_this3.computeCapacity());

      return true;
    })();
  }

  __running__() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _this4.yieldLoop();
      return _this4._running;
    })();
  }

  __queued__() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      yield _this5.yieldLoop();
      return _this5.instance.queued();
    })();
  }

  __done__() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      yield _this6.yieldLoop();
      return _this6._done;
    })();
  }

  __groupCheck__(time) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      yield _this7.yieldLoop();
      return _this7._nextRequest + _this7.timeout < time;
    })();
  }

  computeCapacity() {
    var maxConcurrent, reservoir;
    var _this$storeOptions2 = this.storeOptions;
    maxConcurrent = _this$storeOptions2.maxConcurrent;
    reservoir = _this$storeOptions2.reservoir;

    if (maxConcurrent != null && reservoir != null) {
      return Math.min(maxConcurrent - this._running, reservoir);
    } else if (maxConcurrent != null) {
      return maxConcurrent - this._running;
    } else if (reservoir != null) {
      return reservoir;
    } else {
      return null;
    }
  }

  conditionsCheck(weight) {
    var capacity;
    capacity = this.computeCapacity();
    return capacity == null || weight <= capacity;
  }

  __incrementReservoir__(incr) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      var reservoir;
      yield _this8.yieldLoop();
      reservoir = _this8.storeOptions.reservoir += incr;

      _this8.instance._drainAll(_this8.computeCapacity());

      return reservoir;
    })();
  }

  __currentReservoir__() {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      yield _this9.yieldLoop();
      return _this9.storeOptions.reservoir;
    })();
  }

  isBlocked(now) {
    return this._unblockTime >= now;
  }

  check(weight, now) {
    return this.conditionsCheck(weight) && this._nextRequest - now <= 0;
  }

  __check__(weight) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      var now;
      yield _this10.yieldLoop();
      now = Date.now();
      return _this10.check(weight, now);
    })();
  }

  __register__(index, weight, expiration) {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      var now, wait;
      yield _this11.yieldLoop();
      now = Date.now();

      if (_this11.conditionsCheck(weight)) {
        _this11._running += weight;

        if (_this11.storeOptions.reservoir != null) {
          _this11.storeOptions.reservoir -= weight;
        }

        wait = Math.max(_this11._nextRequest - now, 0);
        _this11._nextRequest = now + wait + _this11.storeOptions.minTime;
        return {
          success: true,
          wait,
          reservoir: _this11.storeOptions.reservoir
        };
      } else {
        return {
          success: false
        };
      }
    })();
  }

  strategyIsBlock() {
    return this.storeOptions.strategy === 3;
  }

  __submit__(queueLength, weight) {
    var _this12 = this;

    return _asyncToGenerator(function* () {
      var blocked, now, reachedHWM;
      yield _this12.yieldLoop();

      if (_this12.storeOptions.maxConcurrent != null && weight > _this12.storeOptions.maxConcurrent) {
        throw new BottleneckError(`Impossible to add a job having a weight of ${weight} to a limiter having a maxConcurrent setting of ${_this12.storeOptions.maxConcurrent}`);
      }

      now = Date.now();
      reachedHWM = _this12.storeOptions.highWater != null && queueLength === _this12.storeOptions.highWater && !_this12.check(weight, now);
      blocked = _this12.strategyIsBlock() && (reachedHWM || _this12.isBlocked(now));

      if (blocked) {
        _this12._unblockTime = now + _this12.computePenalty();
        _this12._nextRequest = _this12._unblockTime + _this12.storeOptions.minTime;

        _this12.instance._dropAllQueued();
      }

      return {
        reachedHWM,
        blocked,
        strategy: _this12.storeOptions.strategy
      };
    })();
  }

  __free__(index, weight) {
    var _this13 = this;

    return _asyncToGenerator(function* () {
      yield _this13.yieldLoop();
      _this13._running -= weight;
      _this13._done += weight;

      _this13.instance._drainAll(_this13.computeCapacity());

      return {
        running: _this13._running
      };
    })();
  }

};
module.exports = LocalDatastore;

/***/ }),

/***/ 21186:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var DLList, Events, Queues;
DLList = __webpack_require__(70938);
Events = __webpack_require__(33800);
Queues = class Queues {
  constructor(num_priorities) {
    var i;
    this.Events = new Events(this);
    this._length = 0;

    this._lists = function () {
      var j, ref, results;
      results = [];

      for (i = j = 1, ref = num_priorities; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        results.push(new DLList(() => {
          return this.incr();
        }, () => {
          return this.decr();
        }));
      }

      return results;
    }.call(this);
  }

  incr() {
    if (this._length++ === 0) {
      return this.Events.trigger("leftzero");
    }
  }

  decr() {
    if (--this._length === 0) {
      return this.Events.trigger("zero");
    }
  }

  push(job) {
    return this._lists[job.options.priority].push(job);
  }

  queued(priority) {
    if (priority != null) {
      return this._lists[priority].length;
    } else {
      return this._length;
    }
  }

  shiftAll(fn) {
    return this._lists.forEach(function (list) {
      return list.forEachShift(fn);
    });
  }

  getFirst(arr = this._lists) {
    var j, len, list;

    for (j = 0, len = arr.length; j < len; j++) {
      list = arr[j];

      if (list.length > 0) {
        return list;
      }
    }

    return [];
  }

  shiftLastFrom(priority) {
    return this.getFirst(this._lists.slice(priority).reverse()).shift();
  }

};
module.exports = Queues;

/***/ }),

/***/ 66427:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Events, RedisConnection, Scripts, parser;
parser = __webpack_require__(88092);
Events = __webpack_require__(33800);
Scripts = __webpack_require__(40812);

RedisConnection = function () {
  class RedisConnection {
    constructor(options = {}) {
      parser.load(options, this.defaults, this);

      if (this.Redis == null) {
        this.Redis = eval("require")("redis"); // Obfuscated or else Webpack/Angular will try to inline the optional redis module. To override this behavior: pass the redis module to Bottleneck as the 'Redis' option.
      }

      if (this.Events == null) {
        this.Events = new Events(this);
      }

      this.terminated = false;

      if (this.client == null) {
        this.client = this.Redis.createClient(this.clientOptions);
      }

      this.subscriber = this.client.duplicate();
      this.limiters = {};
      this.shas = {};
      this.ready = this.Promise.all([this._setup(this.client, false), this._setup(this.subscriber, true)]).then(() => {
        return this._loadScripts();
      }).then(() => {
        return {
          client: this.client,
          subscriber: this.subscriber
        };
      });
    }

    _setup(client, sub) {
      client.setMaxListeners(0);
      return new this.Promise((resolve, reject) => {
        client.on("error", e => {
          return this.Events.trigger("error", e);
        });

        if (sub) {
          client.on("message", (channel, message) => {
            var ref;
            return (ref = this.limiters[channel]) != null ? ref._store.onMessage(channel, message) : void 0;
          });
        }

        if (client.ready) {
          return resolve();
        } else {
          return client.once("ready", resolve);
        }
      });
    }

    _loadScript(name) {
      return new this.Promise((resolve, reject) => {
        var payload;
        payload = Scripts.payload(name);
        return this.client.multi([["script", "load", payload]]).exec((err, replies) => {
          if (err != null) {
            return reject(err);
          }

          this.shas[name] = replies[0];
          return resolve(replies[0]);
        });
      });
    }

    _loadScripts() {
      return this.Promise.all(Scripts.names.map(k => {
        return this._loadScript(k);
      }));
    }

    __runCommand__(cmd) {
      var _this = this;

      return _asyncToGenerator(function* () {
        yield _this.ready;
        return new _this.Promise((resolve, reject) => {
          return _this.client.multi([cmd]).exec_atomic(function (err, replies) {
            if (err != null) {
              return reject(err);
            } else {
              return resolve(replies[0]);
            }
          });
        });
      })();
    }

    __addLimiter__(instance) {
      return this.Promise.all([instance.channel(), instance.channel_client()].map(channel => {
        return new this.Promise((resolve, reject) => {
          var handler;

          handler = chan => {
            if (chan === channel) {
              this.subscriber.removeListener("subscribe", handler);
              this.limiters[channel] = instance;
              return resolve();
            }
          };

          this.subscriber.on("subscribe", handler);
          return this.subscriber.subscribe(channel);
        });
      }));
    }

    __removeLimiter__(instance) {
      var _this2 = this;

      return this.Promise.all([instance.channel(), instance.channel_client()].map(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (channel) {
          if (!_this2.terminated) {
            yield new _this2.Promise((resolve, reject) => {
              return _this2.subscriber.unsubscribe(channel, function (err, chan) {
                if (err != null) {
                  return reject(err);
                }

                if (chan === channel) {
                  return resolve();
                }
              });
            });
          }

          return delete _this2.limiters[channel];
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }()));
    }

    __scriptArgs__(name, id, args, cb) {
      var keys;
      keys = Scripts.keys(name, id);
      return [this.shas[name], keys.length].concat(keys, args, cb);
    }

    __scriptFn__(name) {
      return this.client.evalsha.bind(this.client);
    }

    disconnect(flush = true) {
      var i, k, len, ref;
      ref = Object.keys(this.limiters);

      for (i = 0, len = ref.length; i < len; i++) {
        k = ref[i];
        clearInterval(this.limiters[k]._store.heartbeat);
      }

      this.limiters = {};
      this.terminated = true;
      this.client.end(flush);
      this.subscriber.end(flush);
      return this.Promise.resolve();
    }

  }

  ;
  RedisConnection.prototype.datastore = "redis";
  RedisConnection.prototype.defaults = {
    Redis: null,
    clientOptions: {},
    client: null,
    Promise: Promise,
    Events: null
  };
  return RedisConnection;
}.call(void 0);

module.exports = RedisConnection;

/***/ }),

/***/ 36220:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var BottleneckError, IORedisConnection, RedisConnection, RedisDatastore, parser;
parser = __webpack_require__(88092);
BottleneckError = __webpack_require__(34006);
RedisConnection = __webpack_require__(66427);
IORedisConnection = __webpack_require__(9442);
RedisDatastore = class RedisDatastore {
  constructor(instance, storeOptions, storeInstanceOptions) {
    this.instance = instance;
    this.storeOptions = storeOptions;
    this.originalId = this.instance.id;
    this.clientId = this.instance._randomIndex();
    parser.load(storeInstanceOptions, storeInstanceOptions, this);
    this.clients = {};
    this.capacityPriorityCounters = {};
    this.sharedConnection = this.connection != null;

    if (this.connection == null) {
      this.connection = this.instance.datastore === "redis" ? new RedisConnection({
        Redis: this.Redis,
        clientOptions: this.clientOptions,
        Promise: this.Promise,
        Events: this.instance.Events
      }) : this.instance.datastore === "ioredis" ? new IORedisConnection({
        Redis: this.Redis,
        clientOptions: this.clientOptions,
        clusterNodes: this.clusterNodes,
        Promise: this.Promise,
        Events: this.instance.Events
      }) : void 0;
    }

    this.instance.connection = this.connection;
    this.instance.datastore = this.connection.datastore;
    this.ready = this.connection.ready.then(clients => {
      this.clients = clients;
      return this.runScript("init", this.prepareInitSettings(this.clearDatastore));
    }).then(() => {
      return this.connection.__addLimiter__(this.instance);
    }).then(() => {
      return this.runScript("register_client", [this.instance.queued()]);
    }).then(() => {
      var base;

      if (typeof (base = this.heartbeat = setInterval(() => {
        return this.runScript("heartbeat", []).catch(e => {
          return this.instance.Events.trigger("error", e);
        });
      }, this.heartbeatInterval)).unref === "function") {
        base.unref();
      }

      return this.clients;
    });
  }

  __publish__(message) {
    var _this = this;

    return _asyncToGenerator(function* () {
      var client;

      var _ref = yield _this.ready;

      client = _ref.client;
      return client.publish(_this.instance.channel(), `message:${message.toString()}`);
    })();
  }

  onMessage(channel, message) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      var capacity, counter, data, drained, e, newCapacity, pos, priorityClient, rawCapacity, type;

      try {
        pos = message.indexOf(":");
        var _ref2 = [message.slice(0, pos), message.slice(pos + 1)];
        type = _ref2[0];
        data = _ref2[1];

        if (type === "capacity") {
          return yield _this2.instance._drainAll(data.length > 0 ? ~~data : void 0);
        } else if (type === "capacity-priority") {
          var _data$split = data.split(":");

          var _data$split2 = _slicedToArray(_data$split, 3);

          rawCapacity = _data$split2[0];
          priorityClient = _data$split2[1];
          counter = _data$split2[2];
          capacity = rawCapacity.length > 0 ? ~~rawCapacity : void 0;

          if (priorityClient === _this2.clientId) {
            drained = yield _this2.instance._drainAll(capacity);
            newCapacity = capacity != null ? capacity - (drained || 0) : "";
            return yield _this2.clients.client.publish(_this2.instance.channel(), `capacity-priority:${newCapacity}::${counter}`);
          } else if (priorityClient === "") {
            clearTimeout(_this2.capacityPriorityCounters[counter]);
            delete _this2.capacityPriorityCounters[counter];
            return _this2.instance._drainAll(capacity);
          } else {
            return _this2.capacityPriorityCounters[counter] = setTimeout(
            /*#__PURE__*/
            _asyncToGenerator(function* () {
              var e;

              try {
                delete _this2.capacityPriorityCounters[counter];
                yield _this2.runScript("blacklist_client", [priorityClient]);
                return yield _this2.instance._drainAll(capacity);
              } catch (error) {
                e = error;
                return _this2.instance.Events.trigger("error", e);
              }
            }), 1000);
          }
        } else if (type === "message") {
          return _this2.instance.Events.trigger("message", data);
        } else if (type === "blocked") {
          return yield _this2.instance._dropAllQueued();
        }
      } catch (error) {
        e = error;
        return _this2.instance.Events.trigger("error", e);
      }
    })();
  }

  __disconnect__(flush) {
    clearInterval(this.heartbeat);

    if (this.sharedConnection) {
      return this.connection.__removeLimiter__(this.instance);
    } else {
      return this.connection.disconnect(flush);
    }
  }

  runScript(name, args) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      if (!(name === "init" || name === "register_client")) {
        yield _this3.ready;
      }

      return new _this3.Promise((resolve, reject) => {
        var all_args, arr;
        all_args = [Date.now(), _this3.clientId].concat(args);

        _this3.instance.Events.trigger("debug", `Calling Redis script: ${name}.lua`, all_args);

        arr = _this3.connection.__scriptArgs__(name, _this3.originalId, all_args, function (err, replies) {
          if (err != null) {
            return reject(err);
          }

          return resolve(replies);
        });
        return _this3.connection.__scriptFn__(name)(...arr);
      }).catch(e => {
        if (e.message === "SETTINGS_KEY_NOT_FOUND") {
          if (name === "heartbeat") {
            return _this3.Promise.resolve();
          } else {
            return _this3.runScript("init", _this3.prepareInitSettings(false)).then(() => {
              return _this3.runScript(name, args);
            });
          }
        } else if (e.message === "UNKNOWN_CLIENT") {
          return _this3.runScript("register_client", [_this3.instance.queued()]).then(() => {
            return _this3.runScript(name, args);
          });
        } else {
          return _this3.Promise.reject(e);
        }
      });
    })();
  }

  prepareArray(arr) {
    var i, len, results, x;
    results = [];

    for (i = 0, len = arr.length; i < len; i++) {
      x = arr[i];
      results.push(x != null ? x.toString() : "");
    }

    return results;
  }

  prepareObject(obj) {
    var arr, k, v;
    arr = [];

    for (k in obj) {
      v = obj[k];
      arr.push(k, v != null ? v.toString() : "");
    }

    return arr;
  }

  prepareInitSettings(clear) {
    var args;
    args = this.prepareObject(Object.assign({}, this.storeOptions, {
      id: this.originalId,
      version: this.instance.version,
      groupTimeout: this.timeout,
      clientTimeout: this.clientTimeout
    }));
    args.unshift(clear ? 1 : 0, this.instance.version);
    return args;
  }

  convertBool(b) {
    return !!b;
  }

  __updateSettings__(options) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _this4.runScript("update_settings", _this4.prepareObject(options));
      return parser.overwrite(options, options, _this4.storeOptions);
    })();
  }

  __running__() {
    return this.runScript("running", []);
  }

  __queued__() {
    return this.runScript("queued", []);
  }

  __done__() {
    return this.runScript("done", []);
  }

  __groupCheck__() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return _this5.convertBool((yield _this5.runScript("group_check", [])));
    })();
  }

  __incrementReservoir__(incr) {
    return this.runScript("increment_reservoir", [incr]);
  }

  __currentReservoir__() {
    return this.runScript("current_reservoir", []);
  }

  __check__(weight) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      return _this6.convertBool((yield _this6.runScript("check", _this6.prepareArray([weight]))));
    })();
  }

  __register__(index, weight, expiration) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      var reservoir, success, wait;

      var _ref4 = yield _this7.runScript("register", _this7.prepareArray([index, weight, expiration]));

      var _ref5 = _slicedToArray(_ref4, 3);

      success = _ref5[0];
      wait = _ref5[1];
      reservoir = _ref5[2];
      return {
        success: _this7.convertBool(success),
        wait,
        reservoir
      };
    })();
  }

  __submit__(queueLength, weight) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      var blocked, e, maxConcurrent, overweight, reachedHWM, strategy;

      try {
        var _ref6 = yield _this8.runScript("submit", _this8.prepareArray([queueLength, weight]));

        var _ref7 = _slicedToArray(_ref6, 3);

        reachedHWM = _ref7[0];
        blocked = _ref7[1];
        strategy = _ref7[2];
        return {
          reachedHWM: _this8.convertBool(reachedHWM),
          blocked: _this8.convertBool(blocked),
          strategy
        };
      } catch (error) {
        e = error;

        if (e.message.indexOf("OVERWEIGHT") === 0) {
          var _e$message$split = e.message.split(":");

          var _e$message$split2 = _slicedToArray(_e$message$split, 3);

          overweight = _e$message$split2[0];
          weight = _e$message$split2[1];
          maxConcurrent = _e$message$split2[2];
          throw new BottleneckError(`Impossible to add a job having a weight of ${weight} to a limiter having a maxConcurrent setting of ${maxConcurrent}`);
        } else {
          throw e;
        }
      }
    })();
  }

  __free__(index, weight) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      var running;
      running = yield _this9.runScript("free", _this9.prepareArray([index]));
      return {
        running
      };
    })();
  }

};
module.exports = RedisDatastore;

/***/ }),

/***/ 40812:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var headers, lua, templates;
lua = __webpack_require__(31936);
headers = {
  refs: lua["refs.lua"],
  validate_keys: lua["validate_keys.lua"],
  validate_client: lua["validate_client.lua"],
  refresh_expiration: lua["refresh_expiration.lua"],
  process_tick: lua["process_tick.lua"],
  conditions_check: lua["conditions_check.lua"],
  get_time: lua["get_time.lua"]
};

exports.allKeys = function (id) {
  return [
  /*
  HASH
  */
  `b_${id}_settings`,
  /*
  HASH
  job index -> weight
  */
  `b_${id}_job_weights`,
  /*
  ZSET
  job index -> expiration
  */
  `b_${id}_job_expirations`,
  /*
  HASH
  job index -> client
  */
  `b_${id}_job_clients`,
  /*
  ZSET
  client -> sum running
  */
  `b_${id}_client_running`,
  /*
  HASH
  client -> num queued
  */
  `b_${id}_client_num_queued`,
  /*
  ZSET
  client -> last job registered
  */
  `b_${id}_client_last_registered`,
  /*
  ZSET
  client -> last seen
  */
  `b_${id}_client_last_seen`];
};

templates = {
  init: {
    keys: exports.allKeys,
    headers: ["process_tick"],
    refresh_expiration: true,
    code: lua["init.lua"]
  },
  group_check: {
    keys: exports.allKeys,
    headers: [],
    refresh_expiration: false,
    code: lua["group_check.lua"]
  },
  register_client: {
    keys: exports.allKeys,
    headers: ["validate_keys"],
    refresh_expiration: false,
    code: lua["register_client.lua"]
  },
  blacklist_client: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client"],
    refresh_expiration: false,
    code: lua["blacklist_client.lua"]
  },
  heartbeat: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client", "process_tick"],
    refresh_expiration: false,
    code: lua["heartbeat.lua"]
  },
  update_settings: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client", "process_tick"],
    refresh_expiration: true,
    code: lua["update_settings.lua"]
  },
  running: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client", "process_tick"],
    refresh_expiration: false,
    code: lua["running.lua"]
  },
  queued: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client"],
    refresh_expiration: false,
    code: lua["queued.lua"]
  },
  done: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client", "process_tick"],
    refresh_expiration: false,
    code: lua["done.lua"]
  },
  check: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client", "process_tick", "conditions_check"],
    refresh_expiration: false,
    code: lua["check.lua"]
  },
  submit: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client", "process_tick", "conditions_check"],
    refresh_expiration: true,
    code: lua["submit.lua"]
  },
  register: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client", "process_tick", "conditions_check"],
    refresh_expiration: true,
    code: lua["register.lua"]
  },
  free: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client", "process_tick"],
    refresh_expiration: true,
    code: lua["free.lua"]
  },
  current_reservoir: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client", "process_tick"],
    refresh_expiration: false,
    code: lua["current_reservoir.lua"]
  },
  increment_reservoir: {
    keys: exports.allKeys,
    headers: ["validate_keys", "validate_client", "process_tick"],
    refresh_expiration: true,
    code: lua["increment_reservoir.lua"]
  }
};
exports.names = Object.keys(templates);

exports.keys = function (name, id) {
  return templates[name].keys(id);
};

exports.payload = function (name) {
  var template;
  template = templates[name];
  return Array.prototype.concat(headers.refs, template.headers.map(function (h) {
    return headers[h];
  }), template.refresh_expiration ? headers.refresh_expiration : "", template.code).join("\n");
};

/***/ }),

/***/ 65376:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var BottleneckError, States;
BottleneckError = __webpack_require__(34006);
States = class States {
  constructor(status1) {
    this.status = status1;
    this._jobs = {};
    this.counts = this.status.map(function () {
      return 0;
    });
  }

  next(id) {
    var current, next;
    current = this._jobs[id];
    next = current + 1;

    if (current != null && next < this.status.length) {
      this.counts[current]--;
      this.counts[next]++;
      return this._jobs[id]++;
    } else if (current != null) {
      this.counts[current]--;
      return delete this._jobs[id];
    }
  }

  start(id) {
    var initial;
    initial = 0;
    this._jobs[id] = initial;
    return this.counts[initial]++;
  }

  remove(id) {
    var current;
    current = this._jobs[id];

    if (current != null) {
      this.counts[current]--;
      delete this._jobs[id];
    }

    return current != null;
  }

  jobStatus(id) {
    var ref;
    return (ref = this.status[this._jobs[id]]) != null ? ref : null;
  }

  statusJobs(status) {
    var k, pos, ref, results, v;

    if (status != null) {
      pos = this.status.indexOf(status);

      if (pos < 0) {
        throw new BottleneckError(`status must be one of ${this.status.join(', ')}`);
      }

      ref = this._jobs;
      results = [];

      for (k in ref) {
        v = ref[k];

        if (v === pos) {
          results.push(k);
        }
      }

      return results;
    } else {
      return Object.keys(this._jobs);
    }
  }

  statusCounts() {
    return this.counts.reduce((acc, v, i) => {
      acc[this.status[i]] = v;
      return acc;
    }, {});
  }

};
module.exports = States;

/***/ }),

/***/ 64915:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var DLList, Sync;
DLList = __webpack_require__(70938);
Sync = class Sync {
  constructor(name, Promise) {
    this.schedule = this.schedule.bind(this);
    this.name = name;
    this.Promise = Promise;
    this._running = 0;
    this._queue = new DLList();
  }

  isEmpty() {
    return this._queue.length === 0;
  }

  _tryToRun() {
    var _this = this;

    return _asyncToGenerator(function* () {
      var args, cb, error, reject, resolve, returned, task;

      if (_this._running < 1 && _this._queue.length > 0) {
        _this._running++;

        var _this$_queue$shift = _this._queue.shift();

        task = _this$_queue$shift.task;
        args = _this$_queue$shift.args;
        resolve = _this$_queue$shift.resolve;
        reject = _this$_queue$shift.reject;
        cb = yield _asyncToGenerator(function* () {
          try {
            returned = yield task(...args);
            return function () {
              return resolve(returned);
            };
          } catch (error1) {
            error = error1;
            return function () {
              return reject(error);
            };
          }
        })();
        _this._running--;

        _this._tryToRun();

        return cb();
      }
    })();
  }

  schedule(task, ...args) {
    var promise, reject, resolve;
    resolve = reject = null;
    promise = new this.Promise(function (_resolve, _reject) {
      resolve = _resolve;
      return reject = _reject;
    });

    this._queue.push({
      task,
      args,
      resolve,
      reject
    });

    this._tryToRun();

    return promise;
  }

};
module.exports = Sync;

/***/ }),

/***/ 35861:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(19529);

/***/ }),

/***/ 88092:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.load = function (received, defaults, onto = {}) {
  var k, ref, v;

  for (k in defaults) {
    v = defaults[k];
    onto[k] = (ref = received[k]) != null ? ref : v;
  }

  return onto;
};

exports.overwrite = function (received, defaults, onto = {}) {
  var k, v;

  for (k in received) {
    v = received[k];

    if (defaults[k] !== void 0) {
      onto[k] = v;
    }
  }

  return onto;
};

/***/ }),

/***/ 76158:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* module decorator */ module = __webpack_require__.nmd(module);


const wrapAnsi16 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => (...args) => {
	const rgb = fn(...args);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

const ansi2ansi = n => n;
const rgb2rgb = (r, g, b) => [r, g, b];

const setLazyProperty = (object, property, get) => {
	Object.defineProperty(object, property, {
		get: () => {
			const value = get();

			Object.defineProperty(object, property, {
				value,
				enumerable: true,
				configurable: true
			});

			return value;
		},
		enumerable: true,
		configurable: true
	});
};

/** @type {typeof import('color-convert')} */
let colorConvert;
const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
	if (colorConvert === undefined) {
		colorConvert = __webpack_require__(91497);
	}

	const offset = isBackground ? 10 : 0;
	const styles = {};

	for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
		const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
		if (sourceSpace === targetSpace) {
			styles[name] = wrap(identity, offset);
		} else if (typeof suite === 'object') {
			styles[name] = wrap(suite[targetSpace], offset);
		}
	}

	return styles;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],

			// Bright color
			blackBright: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Alias bright black as gray (and grey)
	styles.color.gray = styles.color.blackBright;
	styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
	styles.color.grey = styles.color.blackBright;
	styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
	setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});


/***/ }),

/***/ 98250:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const ansiStyles = __webpack_require__(76158);
const {stdout: stdoutColor, stderr: stderrColor} = __webpack_require__(8442);
const {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
} = __webpack_require__(45173);

const {isArray} = Array;

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m'
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class ChalkClass {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = {};
	applyOptions(chalk, options);

	chalk.template = (...arguments_) => chalkTag(chalk.template, ...arguments_);

	Object.setPrototypeOf(chalk, Chalk.prototype);
	Object.setPrototypeOf(chalk.template, chalk);

	chalk.template.constructor = () => {
		throw new Error('`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.');
	};

	chalk.template.Instance = ChalkClass;

	return chalk.template;
};

function Chalk(options) {
	return chalkFactory(options);
}

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		}
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this._styler, true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	}
};

const usedModels = ['rgb', 'hex', 'keyword', 'hsl', 'hsv', 'hwb', 'ansi', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

for (const model of usedModels) {
	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this._generator.level;
		},
		set(level) {
			this._generator.level = level;
		}
	}
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	const builder = (...arguments_) => {
		if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
			// Called as a template literal, for example: chalk.red`2 + 3 = {bold ${2+3}}`
			return applyStyle(builder, chalkTag(builder, ...arguments_));
		}

		// Single argument is hot path, implicit coercion is faster than anything
		// eslint-disable-next-line no-implicit-coercion
		return applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));
	};

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder._generator = self;
	builder._styler = _styler;
	builder._isEmpty = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self._isEmpty ? '' : string;
	}

	let styler = self._styler;

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.indexOf('\u001B') !== -1) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

let template;
const chalkTag = (chalk, ...strings) => {
	const [firstString] = strings;

	if (!isArray(firstString) || !isArray(firstString.raw)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return strings.join(' ');
	}

	const arguments_ = strings.slice(1);
	const parts = [firstString.raw[0]];

	for (let i = 1; i < firstString.length; i++) {
		parts.push(
			String(arguments_[i - 1]).replace(/[{}\\]/g, '\\$&'),
			String(firstString.raw[i])
		);
	}

	if (template === undefined) {
		template = __webpack_require__(68452);
	}

	return template(chalk, parts.join(''));
};

Object.defineProperties(Chalk.prototype, styles);

const chalk = Chalk(); // eslint-disable-line new-cap
chalk.supportsColor = stdoutColor;
chalk.stderr = Chalk({level: stderrColor ? stderrColor.level : 0}); // eslint-disable-line new-cap
chalk.stderr.supportsColor = stderrColor;

module.exports = chalk;


/***/ }),

/***/ 68452:
/***/ ((module) => {

"use strict";

const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;

const ESCAPES = new Map([
	['n', '\n'],
	['r', '\r'],
	['t', '\t'],
	['b', '\b'],
	['f', '\f'],
	['v', '\v'],
	['0', '\0'],
	['\\', '\\'],
	['e', '\u001B'],
	['a', '\u0007']
]);

function unescape(c) {
	const u = c[0] === 'u';
	const bracket = c[1] === '{';

	if ((u && !bracket && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
		return String.fromCharCode(parseInt(c.slice(1), 16));
	}

	if (u && bracket) {
		return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
	}

	return ESCAPES.get(c) || c;
}

function parseArguments(name, arguments_) {
	const results = [];
	const chunks = arguments_.trim().split(/\s*,\s*/g);
	let matches;

	for (const chunk of chunks) {
		const number = Number(chunk);
		if (!Number.isNaN(number)) {
			results.push(number);
		} else if ((matches = chunk.match(STRING_REGEX))) {
			results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
		} else {
			throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
		}
	}

	return results;
}

function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;

	const results = [];
	let matches;

	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		const name = matches[1];

		if (matches[2]) {
			const args = parseArguments(name, matches[2]);
			results.push([name].concat(args));
		} else {
			results.push([name]);
		}
	}

	return results;
}

function buildStyle(chalk, styles) {
	const enabled = {};

	for (const layer of styles) {
		for (const style of layer.styles) {
			enabled[style[0]] = layer.inverse ? null : style.slice(1);
		}
	}

	let current = chalk;
	for (const [styleName, styles] of Object.entries(enabled)) {
		if (!Array.isArray(styles)) {
			continue;
		}

		if (!(styleName in current)) {
			throw new Error(`Unknown Chalk style: ${styleName}`);
		}

		current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
	}

	return current;
}

module.exports = (chalk, temporary) => {
	const styles = [];
	const chunks = [];
	let chunk = [];

	// eslint-disable-next-line max-params
	temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
		if (escapeCharacter) {
			chunk.push(unescape(escapeCharacter));
		} else if (style) {
			const string = chunk.join('');
			chunk = [];
			chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
			styles.push({inverse, styles: parseStyle(style)});
		} else if (close) {
			if (styles.length === 0) {
				throw new Error('Found extraneous } in Chalk template literal');
			}

			chunks.push(buildStyle(chalk, styles)(chunk.join('')));
			chunk = [];
			styles.pop();
		} else {
			chunk.push(character);
		}
	});

	chunks.push(chunk.join(''));

	if (styles.length > 0) {
		const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
		throw new Error(errMessage);
	}

	return chunks.join('');
};


/***/ }),

/***/ 45173:
/***/ ((module) => {

"use strict";


const stringReplaceAll = (string, substring, replacer) => {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

const stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

module.exports = {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
};


/***/ }),

/***/ 53302:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* MIT license */
/* eslint-disable no-mixed-operators */
const cssKeywords = __webpack_require__(65460);

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

const reverseKeywords = {};
for (const key of Object.keys(cssKeywords)) {
	reverseKeywords[cssKeywords[key]] = key;
}

const convert = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

module.exports = convert;

// Hide .channels and .labels properties
for (const model of Object.keys(convert)) {
	if (!('channels' in convert[model])) {
		throw new Error('missing channels property: ' + model);
	}

	if (!('labels' in convert[model])) {
		throw new Error('missing channel labels property: ' + model);
	}

	if (convert[model].labels.length !== convert[model].channels) {
		throw new Error('channel and label counts mismatch: ' + model);
	}

	const {channels, labels} = convert[model];
	delete convert[model].channels;
	delete convert[model].labels;
	Object.defineProperty(convert[model], 'channels', {value: channels});
	Object.defineProperty(convert[model], 'labels', {value: labels});
}

convert.rgb.hsl = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h;
	let s;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	let rdif;
	let gdif;
	let bdif;
	let h;
	let s;

	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}

		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	const r = rgb[0];
	const g = rgb[1];
	let b = rgb[2];
	const h = convert.rgb.hsl(rgb)[0];
	const w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
	/*
		See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	*/
	return (
		((x[0] - y[0]) ** 2) +
		((x[1] - y[1]) ** 2) +
		((x[2] - y[2]) ** 2)
	);
}

convert.rgb.keyword = function (rgb) {
	const reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	let currentClosestDistance = Infinity;
	let currentClosestKeyword;

	for (const keyword of Object.keys(cssKeywords)) {
		const value = cssKeywords[keyword];

		// Compute comparative distance
		const distance = comparativeDistance(rgb, value);

		// Check if its less, if so set as closest
		if (distance < currentClosestDistance) {
			currentClosestDistance = distance;
			currentClosestKeyword = keyword;
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;

	// Assume sRGB
	r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
	g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
	b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

	const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	const xyz = convert.rgb.xyz(rgb);
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t2;
	let t3;
	let val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}

		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	const h = hsl[0];
	let s = hsl[1] / 100;
	let l = hsl[2] / 100;
	let smin = s;
	const lmin = Math.max(l, 0.01);

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	const v = (l + s) / 2;
	const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;

	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const vmin = Math.max(v, 0.01);
	let sl;
	let l;

	l = (2 - s) * v;
	const lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	const h = hwb[0] / 360;
	let wh = hwb[1] / 100;
	let bl = hwb[2] / 100;
	const ratio = wh + bl;
	let f;

	// Wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	const i = Math.floor(6 * h);
	const v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	const n = wh + f * (v - wh); // Linear interpolation

	let r;
	let g;
	let b;
	/* eslint-disable max-statements-per-line,no-multi-spaces */
	switch (i) {
		default:
		case 6:
		case 0: r = v;  g = n;  b = wh; break;
		case 1: r = n;  g = v;  b = wh; break;
		case 2: r = wh; g = v;  b = n; break;
		case 3: r = wh; g = n;  b = v; break;
		case 4: r = n;  g = wh; b = v; break;
		case 5: r = v;  g = wh; b = n; break;
	}
	/* eslint-enable max-statements-per-line,no-multi-spaces */

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;

	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r;
	let g;
	let b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// Assume sRGB
	r = r > 0.0031308
		? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let x;
	let y;
	let z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let h;

	const hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	const c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	const l = lch[0];
	const c = lch[1];
	const h = lch[2];

	const hr = h / 360 * 2 * Math.PI;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args, saturation = null) {
	const [r, g, b] = args;
	let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	let ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// Optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	const r = args[0];
	const g = args[1];
	const b = args[2];

	// We use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	const ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	let color = args % 10;

	// Handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	const mult = (~~(args > 50) + 1) * 0.5;
	const r = ((color & 1) * mult) * 255;
	const g = (((color >> 1) & 1) * mult) * 255;
	const b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// Handle greyscale
	if (args >= 232) {
		const c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	let rem;
	const r = Math.floor(args / 36) / 5 * 255;
	const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	const b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	const integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(char => {
			return char + char;
		}).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(Math.max(r, g), b);
	const min = Math.min(Math.min(r, g), b);
	const chroma = (max - min);
	let grayscale;
	let hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

	let f = 0;
	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;

	const c = s * v;
	let f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	const h = hcg[0] / 360;
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	const pure = [0, 0, 0];
	const hi = (h % 1) * 6;
	const v = hi % 1;
	const w = 1 - v;
	let mg = 0;

	/* eslint-disable max-statements-per-line */
	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}
	/* eslint-enable max-statements-per-line */

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const v = c + g * (1.0 - c);
	let f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const l = g * (1.0 - c) + 0.5 * c;
	let s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;
	const v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	const w = hwb[1] / 100;
	const b = hwb[2] / 100;
	const v = 1 - b;
	const c = v - w;
	let g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hsv = convert.gray.hsl;

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	const val = Math.round(gray[0] / 100 * 255) & 0xFF;
	const integer = (val << 16) + (val << 8) + val;

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};


/***/ }),

/***/ 91497:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const conversions = __webpack_require__(53302);
const route = __webpack_require__(60091);

const convert = {};

const models = Object.keys(conversions);

function wrapRaw(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];
		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		return fn(args);
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];

		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		const result = fn(args);

		// We're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (let len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(fromModel => {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	const routes = route(fromModel);
	const routeModels = Object.keys(routes);

	routeModels.forEach(toModel => {
		const fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;


/***/ }),

/***/ 60091:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const conversions = __webpack_require__(53302);

/*
	This function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	const graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	const models = Object.keys(conversions);

	for (let len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	const graph = buildGraph();
	const queue = [fromModel]; // Unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		const current = queue.pop();
		const adjacents = Object.keys(conversions[current]);

		for (let len = adjacents.length, i = 0; i < len; i++) {
			const adjacent = adjacents[i];
			const node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	const path = [graph[toModel].parent, toModel];
	let fn = conversions[graph[toModel].parent][toModel];

	let cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	const graph = deriveBFS(fromModel);
	const conversion = {};

	const models = Object.keys(graph);
	for (let len = models.length, i = 0; i < len; i++) {
		const toModel = models[i];
		const node = graph[toModel];

		if (node.parent === null) {
			// No possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};



/***/ }),

/***/ 65460:
/***/ ((module) => {

"use strict";


module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};


/***/ }),

/***/ 19835:
/***/ ((module) => {

"use strict";


module.exports = (flag, argv = process.argv) => {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};


/***/ }),

/***/ 54270:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const AggregateError = __webpack_require__(56455);

module.exports = async (
	iterable,
	mapper,
	{
		concurrency = Infinity,
		stopOnError = true
	} = {}
) => {
	return new Promise((resolve, reject) => {
		if (typeof mapper !== 'function') {
			throw new TypeError('Mapper function is required');
		}

		if (!((Number.isSafeInteger(concurrency) || concurrency === Infinity) && concurrency >= 1)) {
			throw new TypeError(`Expected \`concurrency\` to be an integer from 1 and up or \`Infinity\`, got \`${concurrency}\` (${typeof concurrency})`);
		}

		const result = [];
		const errors = [];
		const iterator = iterable[Symbol.iterator]();
		let isRejected = false;
		let isIterableDone = false;
		let resolvingCount = 0;
		let currentIndex = 0;

		const next = () => {
			if (isRejected) {
				return;
			}

			const nextItem = iterator.next();
			const index = currentIndex;
			currentIndex++;

			if (nextItem.done) {
				isIterableDone = true;

				if (resolvingCount === 0) {
					if (!stopOnError && errors.length !== 0) {
						reject(new AggregateError(errors));
					} else {
						resolve(result);
					}
				}

				return;
			}

			resolvingCount++;

			(async () => {
				try {
					const element = await nextItem.value;
					result[index] = await mapper(element, index);
					resolvingCount--;
					next();
				} catch (error) {
					if (stopOnError) {
						isRejected = true;
						reject(error);
					} else {
						errors.push(error);
						resolvingCount--;
						next();
					}
				}
			})();
		};

		for (let i = 0; i < concurrency; i++) {
			next();

			if (isIterableDone) {
				break;
			}
		}
	});
};


/***/ }),

/***/ 71990:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const ansiRegex = __webpack_require__(14277);

module.exports = string => typeof string === 'string' ? string.replace(ansiRegex(), '') : string;


/***/ }),

/***/ 8442:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const os = __webpack_require__(12087);
const tty = __webpack_require__(33867);
const hasFlag = __webpack_require__(19835);

const {env} = process;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false') ||
	hasFlag('color=never')) {
	forceColor = 0;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = 1;
}

if ('FORCE_COLOR' in env) {
	if (env.FORCE_COLOR === 'true') {
		forceColor = 1;
	} else if (env.FORCE_COLOR === 'false') {
		forceColor = 0;
	} else {
		forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(haveStream, streamIsTTY) {
	if (forceColor === 0) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream, stream && stream.isTTY);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: translateLevel(supportsColor(true, tty.isatty(1))),
	stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};


/***/ }),

/***/ 31936:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"blacklist_client.lua":"local blacklist = ARGV[num_static_argv + 1]\\n\\nif redis.call(\'zscore\', client_last_seen_key, blacklist) then\\n  redis.call(\'zadd\', client_last_seen_key, 0, blacklist)\\nend\\n\\n\\nreturn {}\\n","check.lua":"local weight = tonumber(ARGV[num_static_argv + 1])\\n\\nlocal capacity = process_tick(now, false)[\'capacity\']\\nlocal nextRequest = tonumber(redis.call(\'hget\', settings_key, \'nextRequest\'))\\n\\nreturn conditions_check(capacity, weight) and nextRequest - now <= 0\\n","conditions_check.lua":"local conditions_check = function (capacity, weight)\\n  return capacity == nil or weight <= capacity\\nend\\n","current_reservoir.lua":"return process_tick(now, false)[\'reservoir\']\\n","done.lua":"process_tick(now, false)\\n\\nreturn tonumber(redis.call(\'hget\', settings_key, \'done\'))\\n","free.lua":"local index = ARGV[num_static_argv + 1]\\n\\nredis.call(\'zadd\', job_expirations_key, 0, index)\\n\\nreturn process_tick(now, false)[\'running\']\\n","get_time.lua":"redis.replicate_commands()\\n\\nlocal get_time = function ()\\n  local time = redis.call(\'time\')\\n\\n  return tonumber(time[1]..string.sub(time[2], 1, 3))\\nend\\n","group_check.lua":"return not (redis.call(\'exists\', settings_key) == 1)\\n","heartbeat.lua":"process_tick(now, true)\\n","increment_reservoir.lua":"local incr = tonumber(ARGV[num_static_argv + 1])\\n\\nredis.call(\'hincrby\', settings_key, \'reservoir\', incr)\\n\\nlocal reservoir = process_tick(now, true)[\'reservoir\']\\n\\nlocal groupTimeout = tonumber(redis.call(\'hget\', settings_key, \'groupTimeout\'))\\nrefresh_expiration(0, 0, groupTimeout)\\n\\nreturn reservoir\\n","init.lua":"local clear = tonumber(ARGV[num_static_argv + 1])\\nlocal limiter_version = ARGV[num_static_argv + 2]\\nlocal num_local_argv = num_static_argv + 2\\n\\nif clear == 1 then\\n  redis.call(\'del\', unpack(KEYS))\\nend\\n\\nif redis.call(\'exists\', settings_key) == 0 then\\n  -- Create\\n  local args = {\'hmset\', settings_key}\\n\\n  for i = num_local_argv + 1, #ARGV do\\n    table.insert(args, ARGV[i])\\n  end\\n\\n  redis.call(unpack(args))\\n  redis.call(\'hmset\', settings_key,\\n    \'nextRequest\', now,\\n    \'lastReservoirRefresh\', now,\\n    \'lastReservoirIncrease\', now,\\n    \'running\', 0,\\n    \'done\', 0,\\n    \'unblockTime\', 0,\\n    \'capacityPriorityCounter\', 0\\n  )\\n\\nelse\\n  -- Apply migrations\\n  local settings = redis.call(\'hmget\', settings_key,\\n    \'id\',\\n    \'version\'\\n  )\\n  local id = settings[1]\\n  local current_version = settings[2]\\n\\n  if current_version ~= limiter_version then\\n    local version_digits = {}\\n    for k, v in string.gmatch(current_version, \\"([^.]+)\\") do\\n      table.insert(version_digits, tonumber(k))\\n    end\\n\\n    -- 2.10.0\\n    if version_digits[2] < 10 then\\n      redis.call(\'hsetnx\', settings_key, \'reservoirRefreshInterval\', \'\')\\n      redis.call(\'hsetnx\', settings_key, \'reservoirRefreshAmount\', \'\')\\n      redis.call(\'hsetnx\', settings_key, \'lastReservoirRefresh\', \'\')\\n      redis.call(\'hsetnx\', settings_key, \'done\', 0)\\n      redis.call(\'hset\', settings_key, \'version\', \'2.10.0\')\\n    end\\n\\n    -- 2.11.1\\n    if version_digits[2] < 11 or (version_digits[2] == 11 and version_digits[3] < 1) then\\n      if redis.call(\'hstrlen\', settings_key, \'lastReservoirRefresh\') == 0 then\\n        redis.call(\'hmset\', settings_key,\\n          \'lastReservoirRefresh\', now,\\n          \'version\', \'2.11.1\'\\n        )\\n      end\\n    end\\n\\n    -- 2.14.0\\n    if version_digits[2] < 14 then\\n      local old_running_key = \'b_\'..id..\'_running\'\\n      local old_executing_key = \'b_\'..id..\'_executing\'\\n\\n      if redis.call(\'exists\', old_running_key) == 1 then\\n        redis.call(\'rename\', old_running_key, job_weights_key)\\n      end\\n      if redis.call(\'exists\', old_executing_key) == 1 then\\n        redis.call(\'rename\', old_executing_key, job_expirations_key)\\n      end\\n      redis.call(\'hset\', settings_key, \'version\', \'2.14.0\')\\n    end\\n\\n    -- 2.15.2\\n    if version_digits[2] < 15 or (version_digits[2] == 15 and version_digits[3] < 2) then\\n      redis.call(\'hsetnx\', settings_key, \'capacityPriorityCounter\', 0)\\n      redis.call(\'hset\', settings_key, \'version\', \'2.15.2\')\\n    end\\n\\n    -- 2.17.0\\n    if version_digits[2] < 17 then\\n      redis.call(\'hsetnx\', settings_key, \'clientTimeout\', 10000)\\n      redis.call(\'hset\', settings_key, \'version\', \'2.17.0\')\\n    end\\n\\n    -- 2.18.0\\n    if version_digits[2] < 18 then\\n      redis.call(\'hsetnx\', settings_key, \'reservoirIncreaseInterval\', \'\')\\n      redis.call(\'hsetnx\', settings_key, \'reservoirIncreaseAmount\', \'\')\\n      redis.call(\'hsetnx\', settings_key, \'reservoirIncreaseMaximum\', \'\')\\n      redis.call(\'hsetnx\', settings_key, \'lastReservoirIncrease\', now)\\n      redis.call(\'hset\', settings_key, \'version\', \'2.18.0\')\\n    end\\n\\n  end\\n\\n  process_tick(now, false)\\nend\\n\\nlocal groupTimeout = tonumber(redis.call(\'hget\', settings_key, \'groupTimeout\'))\\nrefresh_expiration(0, 0, groupTimeout)\\n\\nreturn {}\\n","process_tick.lua":"local process_tick = function (now, always_publish)\\n\\n  local compute_capacity = function (maxConcurrent, running, reservoir)\\n    if maxConcurrent ~= nil and reservoir ~= nil then\\n      return math.min((maxConcurrent - running), reservoir)\\n    elseif maxConcurrent ~= nil then\\n      return maxConcurrent - running\\n    elseif reservoir ~= nil then\\n      return reservoir\\n    else\\n      return nil\\n    end\\n  end\\n\\n  local settings = redis.call(\'hmget\', settings_key,\\n    \'id\',\\n    \'maxConcurrent\',\\n    \'running\',\\n    \'reservoir\',\\n    \'reservoirRefreshInterval\',\\n    \'reservoirRefreshAmount\',\\n    \'lastReservoirRefresh\',\\n    \'reservoirIncreaseInterval\',\\n    \'reservoirIncreaseAmount\',\\n    \'reservoirIncreaseMaximum\',\\n    \'lastReservoirIncrease\',\\n    \'capacityPriorityCounter\',\\n    \'clientTimeout\'\\n  )\\n  local id = settings[1]\\n  local maxConcurrent = tonumber(settings[2])\\n  local running = tonumber(settings[3])\\n  local reservoir = tonumber(settings[4])\\n  local reservoirRefreshInterval = tonumber(settings[5])\\n  local reservoirRefreshAmount = tonumber(settings[6])\\n  local lastReservoirRefresh = tonumber(settings[7])\\n  local reservoirIncreaseInterval = tonumber(settings[8])\\n  local reservoirIncreaseAmount = tonumber(settings[9])\\n  local reservoirIncreaseMaximum = tonumber(settings[10])\\n  local lastReservoirIncrease = tonumber(settings[11])\\n  local capacityPriorityCounter = tonumber(settings[12])\\n  local clientTimeout = tonumber(settings[13])\\n\\n  local initial_capacity = compute_capacity(maxConcurrent, running, reservoir)\\n\\n  --\\n  -- Process \'running\' changes\\n  --\\n  local expired = redis.call(\'zrangebyscore\', job_expirations_key, \'-inf\', \'(\'..now)\\n\\n  if #expired > 0 then\\n    redis.call(\'zremrangebyscore\', job_expirations_key, \'-inf\', \'(\'..now)\\n\\n    local flush_batch = function (batch, acc)\\n      local weights = redis.call(\'hmget\', job_weights_key, unpack(batch))\\n                      redis.call(\'hdel\',  job_weights_key, unpack(batch))\\n      local clients = redis.call(\'hmget\', job_clients_key, unpack(batch))\\n                      redis.call(\'hdel\',  job_clients_key, unpack(batch))\\n\\n      -- Calculate sum of removed weights\\n      for i = 1, #weights do\\n        acc[\'total\'] = acc[\'total\'] + (tonumber(weights[i]) or 0)\\n      end\\n\\n      -- Calculate sum of removed weights by client\\n      local client_weights = {}\\n      for i = 1, #clients do\\n        local removed = tonumber(weights[i]) or 0\\n        if removed > 0 then\\n          acc[\'client_weights\'][clients[i]] = (acc[\'client_weights\'][clients[i]] or 0) + removed\\n        end\\n      end\\n    end\\n\\n    local acc = {\\n      [\'total\'] = 0,\\n      [\'client_weights\'] = {}\\n    }\\n    local batch_size = 1000\\n\\n    -- Compute changes to Zsets and apply changes to Hashes\\n    for i = 1, #expired, batch_size do\\n      local batch = {}\\n      for j = i, math.min(i + batch_size - 1, #expired) do\\n        table.insert(batch, expired[j])\\n      end\\n\\n      flush_batch(batch, acc)\\n    end\\n\\n    -- Apply changes to Zsets\\n    if acc[\'total\'] > 0 then\\n      redis.call(\'hincrby\', settings_key, \'done\', acc[\'total\'])\\n      running = tonumber(redis.call(\'hincrby\', settings_key, \'running\', -acc[\'total\']))\\n    end\\n\\n    for client, weight in pairs(acc[\'client_weights\']) do\\n      redis.call(\'zincrby\', client_running_key, -weight, client)\\n    end\\n  end\\n\\n  --\\n  -- Process \'reservoir\' changes\\n  --\\n  local reservoirRefreshActive = reservoirRefreshInterval ~= nil and reservoirRefreshAmount ~= nil\\n  if reservoirRefreshActive and now >= lastReservoirRefresh + reservoirRefreshInterval then\\n    reservoir = reservoirRefreshAmount\\n    redis.call(\'hmset\', settings_key,\\n      \'reservoir\', reservoir,\\n      \'lastReservoirRefresh\', now\\n    )\\n  end\\n\\n  local reservoirIncreaseActive = reservoirIncreaseInterval ~= nil and reservoirIncreaseAmount ~= nil\\n  if reservoirIncreaseActive and now >= lastReservoirIncrease + reservoirIncreaseInterval then\\n    local num_intervals = math.floor((now - lastReservoirIncrease) / reservoirIncreaseInterval)\\n    local incr = reservoirIncreaseAmount * num_intervals\\n    if reservoirIncreaseMaximum ~= nil then\\n      incr = math.min(incr, reservoirIncreaseMaximum - (reservoir or 0))\\n    end\\n    if incr > 0 then\\n      reservoir = (reservoir or 0) + incr\\n    end\\n    redis.call(\'hmset\', settings_key,\\n      \'reservoir\', reservoir,\\n      \'lastReservoirIncrease\', lastReservoirIncrease + (num_intervals * reservoirIncreaseInterval)\\n    )\\n  end\\n\\n  --\\n  -- Clear unresponsive clients\\n  --\\n  local unresponsive = redis.call(\'zrangebyscore\', client_last_seen_key, \'-inf\', (now - clientTimeout))\\n  local unresponsive_lookup = {}\\n  local terminated_clients = {}\\n  for i = 1, #unresponsive do\\n    unresponsive_lookup[unresponsive[i]] = true\\n    if tonumber(redis.call(\'zscore\', client_running_key, unresponsive[i])) == 0 then\\n      table.insert(terminated_clients, unresponsive[i])\\n    end\\n  end\\n  if #terminated_clients > 0 then\\n    redis.call(\'zrem\', client_running_key,         unpack(terminated_clients))\\n    redis.call(\'hdel\', client_num_queued_key,      unpack(terminated_clients))\\n    redis.call(\'zrem\', client_last_registered_key, unpack(terminated_clients))\\n    redis.call(\'zrem\', client_last_seen_key,       unpack(terminated_clients))\\n  end\\n\\n  --\\n  -- Broadcast capacity changes\\n  --\\n  local final_capacity = compute_capacity(maxConcurrent, running, reservoir)\\n\\n  if always_publish or (initial_capacity ~= nil and final_capacity == nil) then\\n    -- always_publish or was not unlimited, now unlimited\\n    redis.call(\'publish\', \'b_\'..id, \'capacity:\'..(final_capacity or \'\'))\\n\\n  elseif initial_capacity ~= nil and final_capacity ~= nil and final_capacity > initial_capacity then\\n    -- capacity was increased\\n    -- send the capacity message to the limiter having the lowest number of running jobs\\n    -- the tiebreaker is the limiter having not registered a job in the longest time\\n\\n    local lowest_concurrency_value = nil\\n    local lowest_concurrency_clients = {}\\n    local lowest_concurrency_last_registered = {}\\n    local client_concurrencies = redis.call(\'zrange\', client_running_key, 0, -1, \'withscores\')\\n\\n    for i = 1, #client_concurrencies, 2 do\\n      local client = client_concurrencies[i]\\n      local concurrency = tonumber(client_concurrencies[i+1])\\n\\n      if (\\n        lowest_concurrency_value == nil or lowest_concurrency_value == concurrency\\n      ) and (\\n        not unresponsive_lookup[client]\\n      ) and (\\n        tonumber(redis.call(\'hget\', client_num_queued_key, client)) > 0\\n      ) then\\n        lowest_concurrency_value = concurrency\\n        table.insert(lowest_concurrency_clients, client)\\n        local last_registered = tonumber(redis.call(\'zscore\', client_last_registered_key, client))\\n        table.insert(lowest_concurrency_last_registered, last_registered)\\n      end\\n    end\\n\\n    if #lowest_concurrency_clients > 0 then\\n      local position = 1\\n      local earliest = lowest_concurrency_last_registered[1]\\n\\n      for i,v in ipairs(lowest_concurrency_last_registered) do\\n        if v < earliest then\\n          position = i\\n          earliest = v\\n        end\\n      end\\n\\n      local next_client = lowest_concurrency_clients[position]\\n      redis.call(\'publish\', \'b_\'..id,\\n        \'capacity-priority:\'..(final_capacity or \'\')..\\n        \':\'..next_client..\\n        \':\'..capacityPriorityCounter\\n      )\\n      redis.call(\'hincrby\', settings_key, \'capacityPriorityCounter\', \'1\')\\n    else\\n      redis.call(\'publish\', \'b_\'..id, \'capacity:\'..(final_capacity or \'\'))\\n    end\\n  end\\n\\n  return {\\n    [\'capacity\'] = final_capacity,\\n    [\'running\'] = running,\\n    [\'reservoir\'] = reservoir\\n  }\\nend\\n","queued.lua":"local clientTimeout = tonumber(redis.call(\'hget\', settings_key, \'clientTimeout\'))\\nlocal valid_clients = redis.call(\'zrangebyscore\', client_last_seen_key, (now - clientTimeout), \'inf\')\\nlocal client_queued = redis.call(\'hmget\', client_num_queued_key, unpack(valid_clients))\\n\\nlocal sum = 0\\nfor i = 1, #client_queued do\\n  sum = sum + tonumber(client_queued[i])\\nend\\n\\nreturn sum\\n","refresh_expiration.lua":"local refresh_expiration = function (now, nextRequest, groupTimeout)\\n\\n  if groupTimeout ~= nil then\\n    local ttl = (nextRequest + groupTimeout) - now\\n\\n    for i = 1, #KEYS do\\n      redis.call(\'pexpire\', KEYS[i], ttl)\\n    end\\n  end\\n\\nend\\n","refs.lua":"local settings_key = KEYS[1]\\nlocal job_weights_key = KEYS[2]\\nlocal job_expirations_key = KEYS[3]\\nlocal job_clients_key = KEYS[4]\\nlocal client_running_key = KEYS[5]\\nlocal client_num_queued_key = KEYS[6]\\nlocal client_last_registered_key = KEYS[7]\\nlocal client_last_seen_key = KEYS[8]\\n\\nlocal now = tonumber(ARGV[1])\\nlocal client = ARGV[2]\\n\\nlocal num_static_argv = 2\\n","register.lua":"local index = ARGV[num_static_argv + 1]\\nlocal weight = tonumber(ARGV[num_static_argv + 2])\\nlocal expiration = tonumber(ARGV[num_static_argv + 3])\\n\\nlocal state = process_tick(now, false)\\nlocal capacity = state[\'capacity\']\\nlocal reservoir = state[\'reservoir\']\\n\\nlocal settings = redis.call(\'hmget\', settings_key,\\n  \'nextRequest\',\\n  \'minTime\',\\n  \'groupTimeout\'\\n)\\nlocal nextRequest = tonumber(settings[1])\\nlocal minTime = tonumber(settings[2])\\nlocal groupTimeout = tonumber(settings[3])\\n\\nif conditions_check(capacity, weight) then\\n\\n  redis.call(\'hincrby\', settings_key, \'running\', weight)\\n  redis.call(\'hset\', job_weights_key, index, weight)\\n  if expiration ~= nil then\\n    redis.call(\'zadd\', job_expirations_key, now + expiration, index)\\n  end\\n  redis.call(\'hset\', job_clients_key, index, client)\\n  redis.call(\'zincrby\', client_running_key, weight, client)\\n  redis.call(\'hincrby\', client_num_queued_key, client, -1)\\n  redis.call(\'zadd\', client_last_registered_key, now, client)\\n\\n  local wait = math.max(nextRequest - now, 0)\\n  local newNextRequest = now + wait + minTime\\n\\n  if reservoir == nil then\\n    redis.call(\'hset\', settings_key,\\n      \'nextRequest\', newNextRequest\\n    )\\n  else\\n    reservoir = reservoir - weight\\n    redis.call(\'hmset\', settings_key,\\n      \'reservoir\', reservoir,\\n      \'nextRequest\', newNextRequest\\n    )\\n  end\\n\\n  refresh_expiration(now, newNextRequest, groupTimeout)\\n\\n  return {true, wait, reservoir}\\n\\nelse\\n  return {false}\\nend\\n","register_client.lua":"local queued = tonumber(ARGV[num_static_argv + 1])\\n\\n-- Could have been re-registered concurrently\\nif not redis.call(\'zscore\', client_last_seen_key, client) then\\n  redis.call(\'zadd\', client_running_key, 0, client)\\n  redis.call(\'hset\', client_num_queued_key, client, queued)\\n  redis.call(\'zadd\', client_last_registered_key, 0, client)\\nend\\n\\nredis.call(\'zadd\', client_last_seen_key, now, client)\\n\\nreturn {}\\n","running.lua":"return process_tick(now, false)[\'running\']\\n","submit.lua":"local queueLength = tonumber(ARGV[num_static_argv + 1])\\nlocal weight = tonumber(ARGV[num_static_argv + 2])\\n\\nlocal capacity = process_tick(now, false)[\'capacity\']\\n\\nlocal settings = redis.call(\'hmget\', settings_key,\\n  \'id\',\\n  \'maxConcurrent\',\\n  \'highWater\',\\n  \'nextRequest\',\\n  \'strategy\',\\n  \'unblockTime\',\\n  \'penalty\',\\n  \'minTime\',\\n  \'groupTimeout\'\\n)\\nlocal id = settings[1]\\nlocal maxConcurrent = tonumber(settings[2])\\nlocal highWater = tonumber(settings[3])\\nlocal nextRequest = tonumber(settings[4])\\nlocal strategy = tonumber(settings[5])\\nlocal unblockTime = tonumber(settings[6])\\nlocal penalty = tonumber(settings[7])\\nlocal minTime = tonumber(settings[8])\\nlocal groupTimeout = tonumber(settings[9])\\n\\nif maxConcurrent ~= nil and weight > maxConcurrent then\\n  return redis.error_reply(\'OVERWEIGHT:\'..weight..\':\'..maxConcurrent)\\nend\\n\\nlocal reachedHWM = (highWater ~= nil and queueLength == highWater\\n  and not (\\n    conditions_check(capacity, weight)\\n    and nextRequest - now <= 0\\n  )\\n)\\n\\nlocal blocked = strategy == 3 and (reachedHWM or unblockTime >= now)\\n\\nif blocked then\\n  local computedPenalty = penalty\\n  if computedPenalty == nil then\\n    if minTime == 0 then\\n      computedPenalty = 5000\\n    else\\n      computedPenalty = 15 * minTime\\n    end\\n  end\\n\\n  local newNextRequest = now + computedPenalty + minTime\\n\\n  redis.call(\'hmset\', settings_key,\\n    \'unblockTime\', now + computedPenalty,\\n    \'nextRequest\', newNextRequest\\n  )\\n\\n  local clients_queued_reset = redis.call(\'hkeys\', client_num_queued_key)\\n  local queued_reset = {}\\n  for i = 1, #clients_queued_reset do\\n    table.insert(queued_reset, clients_queued_reset[i])\\n    table.insert(queued_reset, 0)\\n  end\\n  redis.call(\'hmset\', client_num_queued_key, unpack(queued_reset))\\n\\n  redis.call(\'publish\', \'b_\'..id, \'blocked:\')\\n\\n  refresh_expiration(now, newNextRequest, groupTimeout)\\nend\\n\\nif not blocked and not reachedHWM then\\n  redis.call(\'hincrby\', client_num_queued_key, client, 1)\\nend\\n\\nreturn {reachedHWM, blocked, strategy}\\n","update_settings.lua":"local args = {\'hmset\', settings_key}\\n\\nfor i = num_static_argv + 1, #ARGV do\\n  table.insert(args, ARGV[i])\\nend\\n\\nredis.call(unpack(args))\\n\\nprocess_tick(now, true)\\n\\nlocal groupTimeout = tonumber(redis.call(\'hget\', settings_key, \'groupTimeout\'))\\nrefresh_expiration(0, 0, groupTimeout)\\n\\nreturn {}\\n","validate_client.lua":"if not redis.call(\'zscore\', client_last_seen_key, client) then\\n  return redis.error_reply(\'UNKNOWN_CLIENT\')\\nend\\n\\nredis.call(\'zadd\', client_last_seen_key, now, client)\\n","validate_keys.lua":"if not (redis.call(\'exists\', settings_key) == 1) then\\n  return redis.error_reply(\'SETTINGS_KEY_NOT_FOUND\')\\nend\\n"}');

/***/ }),

/***/ 82636:
/***/ ((module) => {

"use strict";
module.exports = {"i":"2.19.5"};

/***/ })

};
;
//# sourceMappingURL=779.index.js.map