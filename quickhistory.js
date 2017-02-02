/* ========================================================================
 * Quick History
 * ========================================================================
 * Copyright 2016 Daniel Stainback
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

var quickHistory = (function () {
    'use strict';

    var hasPushState = (
        ('pushState' in window.history) &&
        window.history['pushState'] !== null
    );

    var events = {
        'change': []
    };

    var trigger = function (event, parameters) {
        var preventDefault = false;

        if (events[event] && typeof events[event] === 'object') {
            events[event].forEach(function (callback, index) {
                if (typeof callback === "function") {
                    if (callback.apply(callback, parameters || []) === false) {
                        preventDefault = true;
                    }
                }
            });
        }

        return preventDefault === false;
    };

    return {
        off: function (event, callback) {
            if (events[event] && typeof events[event] === 'object') {
                events[event].forEach(function (eventCallback, index) {
                    if (
                        eventCallback &&
                        (!callback || eventCallback.toString() === callback.toString())
                    ) {
                        delete events[event][index];
                    }
                });
            }
        },

        on: function (event, callback) {
            if (events[event]) {
                events[event].push(callback);
            }
        },

        currentURL: function() {
            return window.location.href;
        },

        same: function (path) {
            // Ensure there is a domain
            if (path.charAt(0) === '/') {
                path = window.location.hostname + url;
            }

            return (path === this.currentURL());
        },

        change: function (path, data) {
            var pathname = location.pathname;
            var hash = location.hash;
            var isHash = /^#/.test(path);
            var reload = (
                isHash ? path === hash :
                    hasPushState ? path === pathname + hash :
                    path === hash.substr(1)
            );

            if (!reload) {
                this.set(path, data);
                return true;
            }

            return false;
        },

        replace: function (path, data) {
            if (trigger('change', [path]) === false) return false;

            if (hasPushState) {
                window.history.replaceState(data, null, path);
                return true;
            }

            window.location.replace(path);
            return true;
        },

        set: function (path, data) {
            if (trigger('change', [path]) === false) return false;

            // Skip duplicates
            if (this.same(path)) {
                return true
            }

            if (hasPushState) {
                window.history.pushState(data, null, path);
                return true;
            }

            window.location.hash = path;
            return true;
        }
    };

})();