"use strict";
exports.id = 855;
exports.ids = [855];
exports.modules = {

/***/ 66855:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const getWoof_1 = __webpack_require__(76993);
function woof(...args) {
    const woof = getWoof_1.default(args);
    console.log(`
    |         |
   /|         |\\
  | |         | |
  | |/-------\\| |
  \\             /
   |  \\     /  |
   | \\o/   \\o/ |
   |    | |    |
    \\/  | |  \\/
    |   | |   |
     \\  ( )  /
      \\_/ \\_/  /-----\\
        \\U/ --( ${woof} )
               \\-----/
`);
}
exports.default = woof;


/***/ }),

/***/ 76993:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const woofs = {
    en: 'Woof!',
    he: ' !הב ',
    ru: ' Гав!',
    es: 'Guau!',
    cs: ' Haf!',
    uk: ' Гав!',
};
function getWoof(args) {
    const options = args.pop();
    let lang = 'en';
    if (typeof options.language === 'string' &&
        Object.keys(woofs).includes(options.language)) {
        lang = options.language;
    }
    return woofs[lang];
}
exports.default = getWoof;


/***/ })

};
;
//# sourceMappingURL=855.index.js.map