"use strict";
exports.id = 875;
exports.ids = [875];
exports.modules = {

/***/ 74970:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const version_1 = __webpack_require__(38217);
async function version() {
    let version = version_1.getVersion();
    if (version_1.isStandaloneBuild()) {
        version += ' (standalone)';
    }
    return version;
}
exports.default = version;


/***/ })

};
;
//# sourceMappingURL=875.index.js.map