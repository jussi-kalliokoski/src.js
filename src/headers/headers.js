/*
 Headers



*/

/* ENUM: Error code */

__extend(SRCError, {
	NO_SUCH_ERROR:		0x01,
	UNKNOWN_ERROR:		0x02,
	BAD_RATIO:		0x03,
});

/* ENUM: Quality */

__extend(SRC, {
	SINC_BEST_QUALITY:	0,
	SINC_MEDIUM_QUALITY:	1,
	SINC_FASTEST:		2,
	ZERO_ORDER_HOLD:	3,
	LINEAR:			4,
});

SRC.qualities = [{
	name:		"Best Sinc Interpolator",
	description:	"Band limited sinc interpolation, best quality.",
},
{
	name:		"Medium Sinc Interpolator",
	description:	"Band limited sinc interpolation, medium quality.",
},
{
	name:		"Fastest Sinc Interpolator",
	description:	"Band limited sinc interpolation, fastest.",
},
{
	name:		"ZOH Interpolator",
	description:	"Zero order hold interpolator, very fast, poor quality.",
},
{
	name:		"Linear Interpolator",
	description:	"Linear interpolator, very fast, poor quality.",
}];

__extend(SRC, {
	getName: function(quality) {
		return SRC.qualities[quality].name;
	},
	getDescription: function(quality) {
		return SRC.qualities[quality].name;
	},
});

/* CONST: Configuration values */

__extend(SRC, {
	MAX_RATIO:		0x100,
	MIN_RATIO_DIFF:		1e-20,
	DEFAULT_QUALITY:	SRC.LINEAR,
});

/* Classes */

__extend(SRC, {
	Data:			__class('Data', Data),
	Callback:		__class('Callback', Callback),
	Error:			__class('Error', SRCError),
	Converter:		Converter,
});

/* Converters */

__extend(SRC, {
	Sinc:			Sinc,
	Linear:			Linear,
	ZOH:			ZOH,
});

SRC.converters = [
	Sinc,
	Sinc,
	Sinc,
	ZOH,
	Linear
];

/* Provided functionality */

__extend(SRC, {
	resample:		resample,
});

/* Expose boilerplate */

__extend(SRC, {
	__class:		__class,
	__enum:			__enum,
	__extend:		__extend,
	__memcpy:		__memcpy,
	__memslice:		__memslice,
	EventEmitter:		EventEmitter,
});

/* Debugging */

SRC.debug = typeof console === 'undefined' ? function () {
	typeof print !== 'undefined' && print(SRC.debug.outputMode + ': ' + [].slice.call(arguments).join(' '));
} : function () {
	return console[SRC.debug.outputMode].apply(console, arguments);
};

SRC.debug.outputMode = 'error';
