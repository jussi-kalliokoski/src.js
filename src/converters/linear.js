/*
Linear interpolator.



*/

function Linear () {
	this.initConverter.apply(this, arguments);
}

Linear.prototype = {
	processVariableSpeed: function (data) {
		var	readPos		= data.readPos,
			writePos	= data.writePos,
			ratio,
			r, i, ch;

		if (this.reset) {
			for (ch=0; ch < this.channelCount; ch++) {
				this.lastValue[ch] = data.input[ch];
			}
			this.reset = false;
		}

		this.readCount	= data.readFrames * this.channelCount;
		this.writeCount	= data.writeFrames * this.channelCount;

		ratio		= this.lastRatio;
		i		= this.lastPos;

		while (i < 1 && writePos < this.writeCount) {
			if (readPos + this.channelCount * (i + 1) >= this.readCount) {
				break;
			}

			if (this.writeCount > 0 && Math.abs( this.lastRatio - data.ratio ) > SRC.MIN_RATIO_DIFF) {
				ratio = this.lastRatio + writePos * (data.ratio - this.lastRatio) / this.writeCount;
			}

			for (ch=0; ch < this.channelCount; ch++) {
				data.output[writePos++] = ( this.lastValue[ch] + i * (data.input[ch] - this.lastValue[ch]) );
			}

			i += 1 / ratio;
		}

		r		= i % 1;
		readPos	+= this.channelCount * Math.round(i - r);
		i		= r;

		while (writePos < this.writeCount && readPos + this.channelCount * i < this.readCount) {
			if (SRC.DEBUG && readPos < this.channelCount && i < 1) {
				SRC.debug("Something bad happened, we shouldn't be here.", readPos, this.channelCount, i);
				throw SRC.Error(SRC.Error.UNKNOWN_ERROR);
			}

			for (ch=0; ch < this.channelCount; ch++) {
				data.output[writePos] = (data.input[readPos - this.channelCount + ch] + i * 
					(data.input[readPos + ch] - data.input[readPos - this.channelCount + ch]));
				writePos++;
			}

			i	+= ratio;
			r	= i % 1;

			readPos	+= this.channelCount * Math.round(i - r);
			i		= r;
		}

		if (readPos > this.readCount) {
			i		+= (readPos - this.readCount) / this.channelCount;
			readPos	= this.readCount;
		}

		if (readPos > 0) {
			for (ch=0; ch < this.channelCount; ch++) {
				this.lastValue[ch] = data.input[readPos - this.channelCount + ch];
			}
		}


		this.lastPos		= i;
		this.lastRatio		= ratio;

		data.framesRead		= readPos / this.channelCount;
		data.framesWritten	= writePos / this.channelCount;

		data.readPos		= readPos;
		data.writePos		= writePos;
	},
};
