"use strict";

const _ = require("lodash");

const getInforData = ({ fields = [], object = {} }) => {
	return _.pick(object, fields);
};

const getSelectData = (select = []) => {
	return Object.fromEntries(select.map(el => [el, 1]))
}

module.exports = {
	getInforData,
	getSelectData
};