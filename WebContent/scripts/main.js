let myHeading = document.querySelector('h1');
myHeading.textContent = 'Bonjour, monde !';
var freqByteData;

const player = document.getElementById('player');

const handleSuccess = function (stream) {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(1024, 1, 1);
    var analyser = context.createAnalyser();
    var period; // ms

    console.log("Sample rate: " + context.sampleRate);

    analyser.fftSize = 2048;
    period = analyser.fftSize / context.sampleRate;
    console.log("Period: " + period);
    for (i = 0; i < analyser.fftSize; i++)
        console.log("freq " + i + ": " + (i / period));

    freqByteData = new Uint8Array(analyser.frequencyBinCount);
    source.connect(processor);
    source.connect(analyser);
    processor.connect(context.destination);

    var canvas = document.getElementById("analyser");
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    analyserContext = canvas.getContext('2d');

    processor.onaudioprocess = function(e) {
        analyser.getByteFrequencyData(freqByteData);
        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.fillStyle = '#F6D565';
        analyserContext.lineCap = 'round';
        var SPACING = 1;
        var BAR_WIDTH = 1;
        var numBars = Math.round(canvasWidth / SPACING);
        var multiplier = analyser.frequencyBinCount / numBars;

        // Draw rectangle for each frequency bin.
        for (var i = 0; i < numBars; ++i) {
            var magnitude = 0;
            var offset = Math.floor( i * multiplier );
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
            for (var j = 0; j< multiplier; j++)
                magnitude += freqByteData[offset + j];
            magnitude = magnitude / multiplier;
            var magnitude2 = freqByteData[i * multiplier];
            color = i == 464 ? 0 : 180;
            analyserContext.fillStyle = "hsl(" + color + ", 100%, 50%)";
//            analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
            analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
        }
          // Do something with the data, e.g. convert it to WAV
//        const data = e.inputBuffer.getChannelData(0)
//        for (v in data)
//            console.log(v);
    };
}

navigator.mediaDevices.getUserMedia({
    audio : true,
    video : false
}).then(handleSuccess);
