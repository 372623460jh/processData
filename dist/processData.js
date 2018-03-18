!(function (global, undefined) {
    'use strict';
    var trim = "".trim, dom = window.document, regtrim = /^[\s\uFEFF\xA0]+||[\s\uFEFF\xA0]+$/g,
        regCheckJson = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\'},
        rep;

    function _error(msg) {
        throw new Error(msg)
    }

    var _trim = trim && !trim.call("\uFEFF\xA0") ? function (text) {
        return text === null ? "" : trim.call(text)
    } : function (text) {
        return text === null ? "" : (text + "").replace(regtrim, "")
    };

    function _checkout_json(json_str) {
        var requireNonComma, depth = null;
        return json_str.replace(regCheckJson, function (token, comma, open, close) {
            if (requireNonComma && comma) {
                depth = 0
            }
            if (depth === 0) {
                return token
            }
            requireNonComma = open || comma;
            depth += !close - !open;
            return ""
        })
    }

    function str(key, holder) {
        var i, k, v, length, mind = gap, partial, value = holder[key];
        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key)
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value)
        }
        switch (typeof value) {
            case'string':
                return quote(value);
            case'number':
                return isFinite(value) ? String(value) : 'null';
            case'boolean':
            case'null':
                return String(value);
            case'object':
                if (!value) {
                    return 'null'
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null'
                    }
                    v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v)
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v)
                            }
                        }
                    }
                }
                v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v
        }
    }

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4)
            }) + '"' : '"' + string + '"'
    }

    function _json2str(value, replacer, space) {
        var i;
        gap = '';
        indent = '';
        if (typeof space === 'number') {
            for (i = 0; i < space; i += 1) {
                indent += ' '
            }
        } else if (typeof space === 'string') {
            indent = space
        }
        rep = replacer;
        if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
            throw new Error('JSON.stringify');
        }
        return str('', {'': value})
    };
    function _parseJSON(data) {
        if (window.JSON && window.JSON.parse) {
            return window.JSON.parse(data + "")
        }
        var str = _trim(data + "");
        return str && !_checkout_json(str) ? (Function("return " + str))() : _error("无效的JSON字符串: " + data)
    }

    function _parseXML(data) {
        var xml, tmp;
        if (!data || typeof data !== "string") {
            return null
        }
        try {
            if (window.DOMParser) {
                tmp = new DOMParser();
                xml = tmp.parseFromString(data, "text/xml")
            } else {
                xml = new ActiveXObject("Microsoft.XMLDOM");
                xml.async = "false";
                xml.loadXML(data)
            }
        } catch (e) {
            xml = undefined
        }
        if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
            _error("无效的XML字符串: " + data)
        }
        return xml
    }

    function _xml2str(xml) {
        var xmldom;
        try {
            xmldom = xml.childNodes[0]
        } catch (e) {
            xmldom = undefined
        }
        if (xmldom) {
            if (xmldom.outerHTML) {
                return xmldom.outerHTML
            } else {
                if (xmldom.xml) {
                    return xmldom.xml
                }
                var div = dom.createElement("div");
                div.appendChild(xmldom);
                return div.innerHTML
            }
        }
        _error("无效的XML对象: " + xml)
    }

    var processData = {
        parseJSON: function (jsonstr) {
            return _parseJSON(jsonstr)
        }, json2str: function (jsonObject) {
            return _json2str(jsonObject)
        }, parseXML: function (xmlstr) {
            return _parseXML(xmlstr)
        }, xml2str: function (xml) {
            return _xml2str(xml)
        }
    };
    if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
        module.exports = processData
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], processData)
    } else {
        global.processData = processData
    }
})(window);