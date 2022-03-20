'use strict'

function check(data, type) {
  return Object.prototype.toString.call(data) === `[object ${type}]`
}

function isUndefined(data) {
  return check(data, 'Undefined')
}

function isNull(data) {
  return check(data, 'Null')
}

function isString(data) {
  return check(data, 'String')
}

function isFunction(data) {
  return check(data, 'Function')
}

function isObject(data) {
  return check(data, 'Object')
}

function isNumber(data) {
  return check(data, 'Number')
}

function isRegExp(data) {
  return check(data, 'RegExp')
}

function isArray(data) {
  return check(data, 'Array')
}

function isDate(data) {
  return check(data, 'Date')
}

function isBoolean(data) {
  return check(data, 'Boolean')
}

module.exports = {
  isUndefined,
  isNull,
  isString,
  isFunction,
  isObject,
  isNumber,
  isRegExp,
  isArray,
  isDate,
  isBoolean,
}
