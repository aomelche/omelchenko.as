/*
 * QR Code generator input demo (compiled from TypeScript)
 *
 * Copyright (c) Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/qr-code-generator-library
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */
"use strict";
var app;
(function (app) {
    function initialize() {
        let elems = document.querySelectorAll("input[type=number], input[type=text], textarea");
        for (let el of elems) {
            if (el.id.indexOf("version-") != 0)
                el.oninput = redrawQrCode;
        }
        elems = document.querySelectorAll("input[type=radio], input[type=checkbox]");
        for (let el of elems)
            el.onchange = redrawQrCode;
        redrawQrCode();
    }
    function redrawQrCode() {
        // Reset output images in case of early termination
        const canvas = getElem("qrcode-canvas");
        canvas.style.display = "none";
        // Returns a QrCode.Ecc object based on the radio buttons in the HTML form.
        function getInputErrorCorrectionLevel() {
            if (getInput("errcorlvl-medium").checked)
                return qrcodegen.QrCode.Ecc.MEDIUM;
            else if (getInput("errcorlvl-quartile").checked)
                return qrcodegen.QrCode.Ecc.QUARTILE;
            else if (getInput("errcorlvl-high").checked)
                return qrcodegen.QrCode.Ecc.HIGH;
            else // In case no radio button is depressed
                return qrcodegen.QrCode.Ecc.LOW;
        }
        // Get form inputs and compute QR Code
        const text = getElem("text-input").value;
        const ecl = getInputErrorCorrectionLevel();
        const segs = qrcodegen.QrSegment.makeSegments(text);
        const minVer = 1;
        const maxVer = 40;
        const mask = -1;
        const boostEcc = getInput("boost-ecc-input").checked;
        const qr = qrcodegen.QrCode.encodeSegments(segs, ecl, minVer, maxVer, mask, boostEcc);
        // Draw image output
        const border = 4;
        const lightColor = "#FFFFFF";
        const darkColor = "#000000";
		const scale = parseInt(getInput("scale-input").value, 10);
		if (scale <= 0 || scale > 30)
			return;
		drawCanvas(qr, scale, border, lightColor, darkColor, canvas);
		canvas.style.removeProperty("display");
        // Returns a string to describe the given list of segments.
        function describeSegments(segs) {
            if (segs.length == 0)
                return "none";
            else if (segs.length == 1) {
                const mode = segs[0].mode;
                const Mode = qrcodegen.QrSegment.Mode;
                if (mode == Mode.NUMERIC)
                    return "numeric";
                if (mode == Mode.ALPHANUMERIC)
                    return "alphanumeric";
                if (mode == Mode.BYTE)
                    return "byte";
                if (mode == Mode.KANJI)
                    return "kanji";
                return "unknown";
            }
            else
                return "multiple";
        }
        // Returns the number of Unicode code points in the given UTF-16 string.
        function countUnicodeChars(str) {
            let result = 0;
            for (const ch of str) {
                const cc = ch.codePointAt(0);
                if (0xD800 <= cc && cc < 0xE000)
                    throw new RangeError("Invalid UTF-16 string");
                result++;
            }
            return result;
        }
        // Show the QR Code symbol's statistics as a string
        getElem("statistics-output").textContent = `QR Code version = ${qr.version}, ` +
            `mask pattern = ${qr.mask}, ` +
            `character count = ${countUnicodeChars(text)},\n` +
            `encoding mode = ${describeSegments(segs)}, ` +
            `error correction = level ${"LMQH".charAt(qr.errorCorrectionLevel.ordinal)}, ` +
            `data bits = ${qrcodegen.QrSegment.getTotalBits(segs, qr.version)}.`;
    }
    function drawCanvas(qr, scale, border, lightColor, darkColor, canvas) {
        if (scale <= 0 || border < 0)
            throw new RangeError("Value out of range");
        const width = (qr.size + border * 2) * scale;
        canvas.width = width;
        canvas.height = width;
        let ctx = canvas.getContext("2d");
        for (let y = -border; y < qr.size + border; y++) {
            for (let x = -border; x < qr.size + border; x++) {
                ctx.fillStyle = qr.getModule(x, y) ? darkColor : lightColor;
                ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
            }
        }
    }
    function handleVersionMinMax(which) {
        const minElem = getInput("version-min-input");
        const maxElem = getInput("version-max-input");
        let minVal = parseInt(minElem.value, 10);
        let maxVal = parseInt(maxElem.value, 10);
        minVal = Math.max(Math.min(minVal, qrcodegen.QrCode.MAX_VERSION), qrcodegen.QrCode.MIN_VERSION);
        maxVal = Math.max(Math.min(maxVal, qrcodegen.QrCode.MAX_VERSION), qrcodegen.QrCode.MIN_VERSION);
        if (which == "min" && minVal > maxVal)
            maxVal = minVal;
        else if (which == "max" && maxVal < minVal)
            minVal = maxVal;
        minElem.value = minVal.toString();
        maxElem.value = maxVal.toString();
        redrawQrCode();
    }
    app.handleVersionMinMax = handleVersionMinMax;
    function getElem(id) {
        const result = document.getElementById(id);
        if (result instanceof HTMLElement)
            return result;
        throw new Error("Assertion error");
    }
    function getInput(id) {
        const result = getElem(id);
        if (result instanceof HTMLInputElement)
            return result;
        throw new Error("Assertion error");
    }
    initialize();
})(app || (app = {}));
