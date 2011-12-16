/*
 Errors



*/

function SRCError(code) {
	if (!SRCError.hasOwnProperty(code)) throw SRCError(1);
	if (!(this instanceof SRCError)) return new SRCError(code);

	var k;
	for (k in SRCError[code]) {
		if (SRCError[code].hasOwnProperty(k)) {
			this[k] = SRCError[code][k];
		}
	}

	this.code = code;
}

SRCError.prototype = new Error();

SRCError.prototype.toString = function () {
	return 'SRCError 0x' + this.code.toString(16) + ': ' + this.message;
};

SRCError[0x01] = {
	message: 'No such error code.',
	explanation: 'The error code does not exist.',
};
SRCError[0x02] = {
	message: 'Unexplainable error.',
	explanation: 'Consult the heavens for further advice.',
};
SRCError[0x03] = {
	message: 'Bad conversion ratio.',
	explanation: 'The conversion ratio must be under MAX_RATIO and above its inverse.',
};


