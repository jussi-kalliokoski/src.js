/*
 Main



*/

function Data () {
	return this.init.apply(this, arguments);
}

Data.prototype = {
	input: null,
	output: null,

	readPos: 0,
	writePos: 0,
	readFrames: 0,
	writeFrames: 0,
	framesRead: 0,
	framesWritten: 0,

	endOfInput: false,

	init: function (ratio, input, output) {
		this.input	= input;
		this.output	= output;
	},

	resetPos: function () {
		this.readPos = this.writePos = 0;
	},
};


function Converter (options) {
	var type = options && (options.type || options.quality && SRC.converters[options.quality]);
	if (type) {
		return new type(options);
	}
};

Converter.prototype = {
	channelCount:		1,
	arrayType:		typeof Float32Array === 'undefined' ? Array : Float32Array,
	ratio:			1.0,
	reset:			true,

	lastRatio:		null,
	lastValue:		null,

	processConstantSpeed:	null,
	processVariableSpeed:	null,

	readCount:		0,
	writeCount:		0,
	readFrames:		0,
	writeFrames:		0,
	lastPos:		0,

	initConverter: function (options) {
		__extend(this, options);
		this.setArrayType(this.arrayType);
		this.setChannelCount(this.channelCount);
	},

	isBadRatio: function (ratio) {
		return ratio < 1 / SRC.MAX_RATIO || ratio > SRC.MAX_RATIO;
	},

	process: function (data, readFrames, writeFrames) {
		if ( this.isBadRatio(data.ratio) ) {
			throw SRC.Error( SRC.Error.BAD_RATIO );
		}

		data.readFrames		= isNaN(readFrames) || readFrames === null ? data.input.length / this.channelCount : readFrames;
		data.writeFrames	= isNaN(writeFrames) || writeFrames === null ? data.output.length / this.channelCount : writeFrames;
		data.writeAmount	= data.writeAmount < 0 ? 0 : data.writeAmount;

		data.readPos = data.writePos = 0;

		this.lastRatio = this.lastRatio === null ? this.ratio : this.lastRatio;

		data.input.constructor === data.output.constructor && this.arrayType !== data.input.constructor && this.setArrayType(this.input.constructor);

		Math.abs(this.lastRatio - this.ratio) < 1e-15 ? this.processConstantSpeed(data) : this.processVariableSpeed(data);
	},

	setArrayType: function (type, length) {
		this.arrayType		= type = type || this.arrayType;
		length			= length || this.channelCount;
		this.lastValue		= new type(length);
	},

	setChannelCount: function (channelCount) {
		if (this.channelCount === channelCount) return;
		var type = this.arrayType;
		this.lastValue		= new type(channelCount);
		this.channelCount	= channelCount;
	},
};


function Callback () {
	return this.init.apply(this, arguments);
}

Callback.prototype = {
	channelCount:	2,
	bufferSize:	0x2000,
	ratio:		1.0,

	offset:		null,
	data:		null,
	quality:	null,
	callback:	null,
	converter:	null,

	init: function (options) {
		var self = this;

		SRC.EventEmitter.call(self);

		options && __extend(self, options);

		self.converter = self.converter || SRC.Converter({
			channelCount: self.channelCount,
			quality: self.quality || SRC.DEFAULT_QUALITY,
			ratio: self.ratio,
		});

		self.callback = function () {
			self.process.apply(self, arguments);
		};

		self.resetData();
	},

	process: function (buffer, channelCount) {
		this.offset === null && this.loadBuffer();

		for (var i=0; i<buffer.length; i++) {
			this.offset >= this.samplesAvailable && this.loadBuffer();
			buffer[i] = this.data.output[this.offset++];
		}
	},

	loadBuffer: function () {
		this.offset = 0;
		this.resetData();
		this.emit('audioprocess', [this.data.input, this.channelCount]);
		this.converter.process(this.data);
		this.samplesAvailable = this.data.framesWritten * this.channelCount;
	},

	resetData: function () {
		var	data	= this.data,
			type	= this.converter.arrayType,
			l	= Math.ceil(this.bufferSize / this.channelCount / this.ratio) * this.channelCount,
			fmt	= !data;

		if ( data === null || !(data.input instanceof type) ) {
			data = SRC.Data(this.ratio, new type(this.bufferSize), new type(l));
			data.zeroBuffer		= null;
		}

		this.converter.setChannelCount(this.channelCount);

		if (data.storedInput === null) {
			data.storedInput = data.input;
		}
		if (data.storedOutput === null) {
			data.storedOutput = data.output;
		}
		if (data.zeroBuffer === null || data.zeroBuffer.length < this.bufferSize) {
			data.zeroBuffer = new type(this.bufferSize);
		}

		if (this.bufferSize > data.input.length) {
			if (data.storedInput.length < this.bufferSize) {
				data.input		= new type(this.bufferSize);
				data.storedInput	= data.input;
			} else {
				data.input		=  __memslice(data.storedInput, 0, this.bufferSize);
			}
		} else if (this.bufferSize < data.input.length) {
			data.input		= __memslice(data.storedInput, 0, this.bufferSize);
		}

		if (l > data.output.length) {
			if (data.storedOutput.length < l) {
				data.output		= new type(l);
				data.storedOutput	= data.output;
			} else {
				/* FIXME: This drops values */
				data.output		=  __memslice(data.storedOutput, 0, l);
			}
		} else if (l < data.output.length) {
			data.output		= __memslice(data.storedOutput, 0, l);
		}

		fmt && __memcpy(data.zeroBuffer, 0, data.input, 0, this.bufferSize);

		data.resetPos();


		this.converter.ratio = this.ratio;

		this.data = data;
	},
};

function resample(options) {
	options = __extend({}, resample.defaults, options);

	if (!options.input) throw new SyntaxError("input is a required argument!");

	var	type	= options.input.constructor,
		l	= options.input.length / options.channelCount,
		data	= SRC.Data(options.ratio, options.input, options.output || new type(Math.floor(l * options.ratio * options.channelCount))),
		conv	= SRC.Converter();

	conv.setConverter(options.method === null ? SRC.DEFAULT_QUALITY : options.method);
	conv.setChannelCount(options.channelCount);

	data.readAmount		= l;
	data.writeAmount	= data.output.length / options.channelCount;

	conv.process(data);

	return data.output;
}

resample.defaults = {
	channelCount: 1,
	ratio: 1,

	input: null,
	output: null,
	method: null,
};


