# src.js

src.js is a JS library with a simple purpose: Sample Rate Conversion. It offers varying methods and qualities for this purpose, including linear, ZOH and sinc interpolation.

## Usage

src.js ships a single namespace, ```SRC``` from which all the functionality is available.

For example, if you're using [sink.js](https://github.com/jussi-kalliokoski/sink.js), you might want to add multiple sources with varying sample rates to a single Sink instance. For this purpose, there is the Callback interface.

```javascript

// Create a sink.

var sink = Sink();

// Create two callback converters.

var converter1 = SRC.Callback({
	ratio: 22050 / sink.sampleRate,
	channelCount: sink.channelCount,
});

var converter2 = SRC.Callback({
	ratio: 48000 / sink.sampleRate,
	channelCount: sink.channelCount,
	bufferSize: 8096,
});

// Add the converter callbacks as event listeners to our sink.

sink	.on('audioprocess', converter1.callback)
	.on('audioprocess', converter2.callback);

// Now, similarily, we can add event listeners to our callback converter.

converter1.on('audioprocess', function (buffer, channelCount) {
	// Noise it up
	var i = buffer.length;
	while (i--) buffer[i] = Math.random() - 0.5;
});

converter2.on('audioprocess', function (buffer, channelCount) {
	// This should pass, because we defined the buffer size to be this.
	assert(buffer.length === 8096);
});

```

There's also the Converter interface for non-callback-driven continuous time conversion uses.

```javascript

var converter = SRC.Converter({
	type: SRC.Linear,
	ratio: 0.5,
	channelCount: 3,
});

var data = SRC.Data(
	// Input data
	new Uint8Array(3000),
	// Output data
	new Uint8Array(1500)
);

// Process half of the data.
converter.process(
	data,
	// Frames to read
	500,
	// Frames to write
	250
);

// And later...

// Process the rest of the data.

converter.process(data);

```

And for non-continuous-time purposes, there's the ``` SRC.resample() ``` method.

```javascript

var resampled = SRC.resample({
	channelCount: 2,
	input: new Float32Array(500),
	ratio: 0.3,
	quality: SRC.DEFAULT_QUALITY,
});

```
