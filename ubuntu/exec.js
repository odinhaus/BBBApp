/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var cordova = require('cordova'),
    utils = require('cordova/utils');

var callbackId = 1;
cordova.callbacks = [];

cordova.callback = function() {
    var scId = arguments[0];
    var callbackRef = null;

    var parameters = [];
    for (var i = 1; i < arguments.length; i++) {
        parameters[i-1] = arguments[i];
    }
    callbackRef = cordova.callbacks[scId];

    // Even IDs are success-, odd are error-callbacks - make sure we remove both
    if ((scId % 2) !== 0) {
        scId = scId - 1;
    }
    // Remove both the success as well as the error callback from the stack
    delete cordova.callbacks[scId];
    delete cordova.callbacks[scId + 1];

    if (typeof callbackRef == "function") callbackRef.apply(this, parameters);
};

cordova.callbackWithoutRemove = function() {
    var scId = arguments[0];
    var callbackRef = null;

    var parameters = [];
    for (var i = 1; i < arguments.length; i++) {
        parameters[i-1] = arguments[i];
    }
    callbackRef = cordova.callbacks[scId];

    if (typeof(callbackRef) == "function") callbackRef.apply(this, parameters);
};

function ubuntuExec(success, fail, service, action, args) {
    if (callbackId % 2) {
        callbackId++;
    }

    var scId = callbackId++;
    var ecId = callbackId++;
    cordova.callbacks[scId] = success;
    cordova.callbacks[ecId] = fail;

    args.unshift(ecId);
    args.unshift(scId);

    navigator.qt.postMessage(JSON.stringify({messageType: "callPluginFunction", plugin: service, func: action, params: args}));
}
module.exports = ubuntuExec;
