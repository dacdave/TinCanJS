/*
    Copyright 2012 Rustici Software

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

/**
TinCan client library

@module TinCan
@submodule TinCan.Utils
**/
(function () {
    "use strict";

    /**
    @class TinCan.Utils
    */
    TinCan.Utils = {
        /**
        Generates a UUIDv4 compliant string that should be reasonably unique

        @method getUUID
        @return {String} UUID
        @static

        Excerpt from: http://www.broofa.com/Tools/Math.uuid.js (v1.4)
        http://www.broofa.com
        mailto:robert@broofa.com
        Copyright (c) 2010 Robert Kieffer
        Dual licensed under the MIT and GPL licenses.
        */
        getUUID: function () {
            /*jslint bitwise: true, eqeq: true */
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                /[xy]/g,
                function (c) {
                    var r = Math.random() * 16|0, v = c == "x" ? r : (r&0x3|0x8);
                    return v.toString(16);
                }
            );
        },

        /**
        @method getISODateString
        @static
        @param {Date} date Date to stringify
        @return {String} ISO date String
        */
        getISODateString: function (d) {
            function pad (val, n) {
                var padder,
                    tempVal;
                if (typeof val === "undefined" || val === null) {
                    val = 0;
                }
                if (typeof n === "undefined" || n === null) {
                    n = 2;
                }
                padder = Math.pow(10, n-1);
                tempVal = val.toString();

                while (val < padder && padder > 1) {
                    tempVal = "0" + tempVal;
                    padder = padder / 10;
                }

                return tempVal;
            }

            return d.getUTCFullYear() + "-" +
                pad(d.getUTCMonth() + 1) + "-" +
                pad(d.getUTCDate()) + "T" +
                pad(d.getUTCHours()) + ":" +
                pad(d.getUTCMinutes()) + ":" +
                pad(d.getUTCSeconds()) + "." +
                pad(d.getUTCMilliseconds(), 3) + "Z";
        },

        /**
        @method convertISO8601DurationToMilliseconds
        @static
        @param {String} ISO8601Duration Duration in ISO8601 format
        @return {Int} Duration in milliseconds

        Note: does not handle input strings with years, months and days
        */
        convertISO8601DurationToMilliseconds: function (ISO8601Duration) {
            var isValueNegative = (ISO8601Duration.indexOf("-") >= 0),
                indexOfT = ISO8601Duration.indexOf("T"),
                indexOfH = ISO8601Duration.indexOf("H"),
                indexOfM = ISO8601Duration.indexOf("M"),
                indexOfS = ISO8601Duration.indexOf("S"),
                hours,
                minutes,
                seconds,
                durationInMilliseconds;

            if ((indexOfT === -1) || ((indexOfM !== -1) && (indexOfM < indexOfT)) || (ISO8601Duration.indexOf("D") !== -1) || (ISO8601Duration.indexOf("Y") !== -1)) {
                throw new Error("ISO 8601 timestamps including years, months and/or days are not currently supported");
            }

            if (indexOfH === -1) {
                indexOfH = indexOfT;
                hours = 0;
            }
            else {
                hours = parseInt(ISO8601Duration.slice(indexOfT + 1, indexOfH), 10);
            }

            if (indexOfM === -1) {
                indexOfM = indexOfT;
                minutes = 0;
            }
            else {
                minutes = parseInt(ISO8601Duration.slice(indexOfH + 1, indexOfM), 10);
            }

            seconds = parseFloat(ISO8601Duration.slice(indexOfM + 1, indexOfS));

            durationInMilliseconds = parseInt((((((hours * 60) + minutes) * 60) + seconds) * 1000), 10);
            if (isNaN(durationInMilliseconds)){
                durationInMilliseconds = 0;
            }
            if (isValueNegative) {
                durationInMilliseconds = durationInMilliseconds * -1;
            }

            return durationInMilliseconds;
        },

        /**
        @method convertMillisecondsToISO8601Duration
        @static
        @param {Int} inputMilliseconds Duration in milliseconds
        @return {String} Duration in ISO8601 format
        */
        convertMillisecondsToISO8601Duration: function (inputMilliseconds) {
            var hours,
                minutes,
                seconds,
                i_inputMilliseconds = parseInt(inputMilliseconds, 10),
                inputIsNegative = "",
                rtnStr = "";

            if (i_inputMilliseconds < 0) {
                inputIsNegative = "-";
                i_inputMilliseconds = i_inputMilliseconds * -1;
            }

            hours = parseInt(((i_inputMilliseconds) / 3600000), 10);
            minutes = parseInt((((i_inputMilliseconds) % 3600000) / 60000), 10);
            seconds = (((i_inputMilliseconds) % 3600000) % 60000) / 1000;

            rtnStr = inputIsNegative + "PT";
            if (hours > 0) {
                rtnStr += hours + "H";
            }

            if (minutes > 0) {
                rtnStr += minutes + "M";
            }

            rtnStr += seconds + "S";

            return rtnStr;
        },

        /**
        @method getSHA1String
        @static
        @param {String} str Content to hash
        @return {String} SHA1 for contents
        */
        getSHA1String: function (str) {
            /*global CryptoJS*/

            return CryptoJS.SHA1(str).toString(CryptoJS.enc.Hex);
        },

        /**
        @method getBase64String
        @static
        @param {String} str Content to encode
        @return {String} Base64 encoded contents
        */
        getBase64String: function (str) {
            /*global CryptoJS*/

            return CryptoJS.enc.Base64.stringify(
                CryptoJS.enc.Latin1.parse(str)
            );
        },

        /**
        Intended to be inherited by objects with properties that store
        display values in a language based "dictionary"

        @method getLangDictionaryValue
        @param {String} prop Property name storing the dictionary
        @param {String} [lang] Language to return
        @return {String}
        */
        getLangDictionaryValue: function (prop, lang) {
            var langDict = this[prop],
                key;

            if (typeof lang !== "undefined" && typeof langDict[lang] !== "undefined") {
                return langDict[lang];
            }
            if (typeof langDict.und !== "undefined") {
                return langDict.und;
            }
            if (typeof langDict["en-US"] !== "undefined") {
                return langDict["en-US"];
            }
            for (key in langDict) {
                if (langDict.hasOwnProperty(key)) {
                    return langDict[key];
                }
            }

            return "";
        },

        /**
        @method parseURL
        @param {String} url
        @return {Object} Object of values
        @private
        */
        parseURL: function (url) {
            //
            // see http://stackoverflow.com/a/21553982
            // and http://stackoverflow.com/a/2880929
            //
            var reURLInformation,
                match,
                result,
                paramMatch,
                pl     = /\+/g,  // Regex for replacing addition symbol with a space
                search = /([^&=]+)=?([^&]*)/g,
                decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };

            reURLInformation = new RegExp(
                [
                    "^(https?:)//", // protocol
                    "(([^:/?#]*)(?::([0-9]+))?)", // host (hostname and port)
                    "(/[^?#]*)", // pathname
                    "(\\?[^#]*|)", // search
                    "(#.*|)$" // hash
                ].join("")
            );
            match = url.match(reURLInformation);
            result = {
                protocol: match[1],
                host: match[2],
                hostname: match[3],
                port: match[4],
                pathname: match[5],
                search: match[6],
                hash: match[7],
                params: {}
            };

            // 'path' is for backwards compatibility
            result.path = result.protocol + "//" + result.host + result.pathname;

            if (result.search !== "") {
                // extra parens to let jshint know this is an expression
                while ((paramMatch = search.exec(result.search.substring(1)))) {
                    result.params[decode(paramMatch[1])] = decode(paramMatch[2]);
                }
            }

            return result;
        },

        /**
        @method getServerRoot
        @param {String} absoluteUrl
        @return {String} server root of url
        @private
        */
        getServerRoot: function (absoluteUrl) {
            var urlParts = absoluteUrl.split("/");
            return urlParts[0] + "//" + urlParts[2];
        },

        /**
        @method getContentTypeFromHeader
        @static
        @param {String} Content-Type header value
        @return {String} Primary value from Content-Type
        */
        getContentTypeFromHeader: function (header) {
            return (String(header).split(";"))[0];
        },

        /**
        @method isApplicationJSON
        @static
        @param {String} Content-Type header value
        @return {Boolean} whether "application/json" was matched
        */
        isApplicationJSON: function (header) {
            return TinCan.Utils.getContentTypeFromHeader(header).toLowerCase().indexOf("application/json") === 0;
        }
    };
}());
