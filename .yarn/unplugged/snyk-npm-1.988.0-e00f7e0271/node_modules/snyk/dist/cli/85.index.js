"use strict";
exports.id = 85;
exports.ids = [85];
exports.modules = {

/***/ 21085:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.findHelpFile = void 0;
const fs = __webpack_require__(35747);
const path = __webpack_require__(85622);
const markdown_renderer_1 = __webpack_require__(99387);
function findHelpFile(helpArgs, helpFolderPath = '../../help/cli-commands') {
    while (helpArgs.length > 0) {
        // cleanse the filename to only contain letters
        // aka: /\W/g but figured this was easier to read
        const file = `${helpArgs.join('-').replace(/[^a-z0-9-]/gi, '')}.md`;
        const testHelpAbsolutePath = path.resolve(__dirname, helpFolderPath, file);
        if (fs.existsSync(testHelpAbsolutePath)) {
            return testHelpAbsolutePath;
        }
        helpArgs = helpArgs.slice(0, -1);
    }
    return path.resolve(__dirname, helpFolderPath, `README.md`); // Default help file
}
exports.findHelpFile = findHelpFile;
async function help(...args) {
    const helpArgs = args.filter((arg) => typeof arg === 'string');
    const helpFileAbsolutePath = findHelpFile(helpArgs);
    return markdown_renderer_1.renderMarkdown(fs.readFileSync(helpFileAbsolutePath, 'utf8'));
}
exports.default = help;


/***/ }),

/***/ 99387:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.renderMarkdown = void 0;
const marked_1 = __webpack_require__(30970);
const chalk_1 = __webpack_require__(32589);
const reflow_text_1 = __webpack_require__(67211);
// stateful variable to control left-padding by header level
let currentHeader = 1;
const listItemSeparator = 'LISTITEMSEPARATOR'; // Helper string for rendering ListItems
/**
 * @description get padding spaces depending on the last header level used
 * @returns string
 */
function getLeftTextPadding() {
    return '  '.repeat(currentHeader === 1 || currentHeader === 2 ? 1 : currentHeader - 1);
}
/**
 * @description Reads current terminal width if available to limit column width for text-reflowing
 * @returns {number}
 */
const defaultMaximumLineWidth = 100;
function getIdealTextWidth(maximumLineWidth = defaultMaximumLineWidth) {
    if (typeof process.stdout.columns === 'number') {
        if (process.stdout.columns < maximumLineWidth) {
            return process.stdout.columns - getLeftTextPadding().length - 5;
        }
    }
    return maximumLineWidth - getLeftTextPadding().length;
}
// Marked custom renderer class
const renderer = {
    em(text) {
        return chalk_1.default.italic(text);
    },
    strong(text) {
        return chalk_1.default.bold(text);
    },
    link(href, title, text) {
        // Don't render links to relative paths (like local files)
        if (href.startsWith('./') || !href.includes('://')) {
            return text;
        }
        const renderedLink = chalk_1.default.bold.blueBright(href);
        if (text && text !== href) {
            return `${text} ${renderedLink}`;
        }
        return renderedLink;
    },
    blockquote(quote) {
        return quote;
    },
    list(body, ordered, start) {
        return (body
            .split(listItemSeparator)
            .map((listItem, listItemIndex) => {
            const bulletPoint = ordered ? `${listItemIndex + start}. ` : '-  ';
            return reflow_text_1.reflowText(listItem, getIdealTextWidth())
                .split('\n')
                .map((listItemLine, listItemLineIndex) => {
                if (!listItemLine) {
                    return '';
                }
                return `${getLeftTextPadding()}${listItemLineIndex === 0 ? bulletPoint : '   '}${listItemLine}`;
            })
                .join('\n');
        })
            .join('\n') + '\n');
    },
    listitem(text) {
        return text + listItemSeparator;
    },
    paragraph(text) {
        return (reflow_text_1.reflowText(text, getIdealTextWidth())
            .split('\n')
            .map((s) => getLeftTextPadding() + chalk_1.default.reset() + s)
            .join('\n') + '\n\n');
    },
    codespan(text) {
        return chalk_1.default.italic.blueBright(`${text}`);
    },
    code(code) {
        return (code
            .split('\n')
            .map((s) => getLeftTextPadding() + chalk_1.default.reset() + s)
            .join('\n') + '\n\n');
    },
    heading(text, level) {
        currentHeader = level;
        let coloring;
        switch (level) {
            case 1:
                coloring = chalk_1.default.bold.underline;
                break;
            case 3:
            case 4:
                coloring = chalk_1.default;
                break;
            default:
                coloring = chalk_1.default.bold;
                break;
        }
        return `${'  '.repeat(level === 1 ? 0 : currentHeader - 2)}${coloring(text)}\n`;
    },
};
marked_1.marked.use({ renderer });
marked_1.marked.setOptions({
    mangle: false,
});
const htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#96;': '`',
    '&#x20;': '',
};
/**
 * @description Replace HTML entities with their non-encoded variant
 * @param {string} text
 * @returns {string}
 */
function unescape(text) {
    Object.entries(htmlUnescapes).forEach(([escapedChar, unescapedChar]) => {
        const escapedCharRegExp = new RegExp(escapedChar, 'g');
        text = text.replace(escapedCharRegExp, unescapedChar);
    });
    return text;
}
function renderMarkdown(markdown) {
    return unescape(marked_1.marked.parse(markdown));
}
exports.renderMarkdown = renderMarkdown;


/***/ }),

/***/ 67211:
/***/ ((__unused_webpack_module, exports) => {


/**
Code in this file is adapted from mikaelbr/marked-terminal
https://github.com/mikaelbr/marked-terminal/blob/7501b8bb24a5ed52ec7d9114d4aeefa14f1bf5e6/index.js#L234-L330


MIT License

Copyright (c) 2017 Mikael Brevik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.reflowText = void 0;
// Compute length of str not including ANSI escape codes.
// See http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
function textLength(str) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\u001b\[(?:\d{1,3})(?:;\d{1,3})*m/g, '').length;
}
// Munge \n's and spaces in "text" so that the number of
// characters between \n's is less than or equal to "width".
function reflowText(text, width) {
    const HARD_RETURN = '\r|\n';
    const HARD_RETURN_GFM_RE = new RegExp(HARD_RETURN + '|<br ?/?>');
    const splitRe = HARD_RETURN_GFM_RE;
    const sections = text.split(splitRe);
    const reflowed = [];
    sections.forEach((section) => {
        // Split the section by escape codes so that we can
        // deal with them separately.
        // eslint-disable-next-line no-control-regex
        const fragments = section.split(/(\u001b\[(?:\d{1,3})(?:;\d{1,3})*m)/g);
        let column = 0;
        let currentLine = '';
        let lastWasEscapeChar = false;
        while (fragments.length) {
            const fragment = fragments[0];
            if (fragment === '') {
                fragments.splice(0, 1);
                lastWasEscapeChar = false;
                continue;
            }
            // This is an escape code - leave it whole and
            // move to the next fragment.
            if (!textLength(fragment)) {
                currentLine += fragment;
                fragments.splice(0, 1);
                lastWasEscapeChar = true;
                continue;
            }
            const words = fragment.split(/[ \t\n]+/);
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                let addSpace = column != 0;
                if (lastWasEscapeChar)
                    addSpace = false;
                // If adding the new word overflows the required width
                if (column + word.length > width) {
                    if (word.length <= width) {
                        // If the new word is smaller than the required width
                        // just add it at the beginning of a new line
                        reflowed.push(currentLine);
                        currentLine = word;
                        column = word.length;
                    }
                    else {
                        // If the new word is longer than the required width
                        // split this word into smaller parts.
                        const w = word.substr(0, width - column);
                        if (addSpace)
                            currentLine += ' ';
                        currentLine += w;
                        reflowed.push(currentLine);
                        currentLine = '';
                        column = 0;
                        word = word.substr(w.length);
                        while (word.length) {
                            const w = word.substr(0, width);
                            if (!w.length)
                                break;
                            if (w.length < width) {
                                currentLine = w;
                                column = w.length;
                                break;
                            }
                            else {
                                reflowed.push(w);
                                word = word.substr(width);
                            }
                        }
                    }
                }
                else {
                    if (addSpace) {
                        currentLine += ' ';
                        column++;
                    }
                    currentLine += word;
                    column += word.length;
                }
                lastWasEscapeChar = false;
            }
            fragments.splice(0, 1);
        }
        if (textLength(currentLine))
            reflowed.push(currentLine);
    });
    return reflowed.join('\n');
}
exports.reflowText = reflowText;


/***/ })

};
;
//# sourceMappingURL=85.index.js.map