/* ================================================================
 * chrome-localIp by bruce.jcw@gmail.com
 *
 * Copyright 2016 jia
 *
 * Licensed under the MIT License
 *
 * ================================================================ */

'use strict';

var promise = require('./promise')

// refrence: http://stackoverflow.com/questions/18572365/get-local-ip-of-a-device-in-chrome-extension
function getLocalIPs(callback) {
    var ips = [];

    var RTCPeerConnection = window.RTCPeerConnection ||
        window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    var pc = new RTCPeerConnection({
        // Don't specify any stun/turn servers, otherwise you will
        // also find your public IP addresses.
        iceServers: []
    });
    // Add a media line, this is needed to activate candidate gathering.
    pc.createDataChannel('');

    // onicecandidate is triggered whenever a candidate has been found.
    pc.onicecandidate = function(e) {
        if (!e.candidate) { // Candidate gathering completed.
            pc.close();
            callback(ips);
            return;
        }
        /**
         * get candidate which endwith 'network-id 1', it should be the right ip
         */
        var result = /^candidate:.+ (\S+) \d+ typ .* network-id 1/.exec(e.candidate.candidate);
        if (result){
          var ip = result[1]
          if (ips.indexOf(ip) == -1){ // avoid duplicate entries (tcp/udp)
            ips.push(ip);
          }
        }
    };
    pc.createOffer(function(sdp) {
        pc.setLocalDescription(sdp);
    }, function onerror() {});
}

/**
 * exports
 */
module.exports = {
  getIp: function(){
    var defer = promise.getDefer()
    getLocalIPs(function(ips){
      defer.resolve(ips[0])
    })
    return defer.promise;
  }
}
