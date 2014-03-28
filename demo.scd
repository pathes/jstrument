(
var noteCount, synth, oscOn, oscOff;

// Settings
~hammondHarmonics = #[0.5, 1, 2, 3, 4, 5, 6, 8];

Server.default.waitForBoot({
    // Synthesizer definition
    SynthDef.new(\Hammond, {
        arg freq = 55,
            lfoFreq = 5,
            bars = #[1, 5, 2, 4, 2, 1, 0, 3],
            volume = 0;
        var n = ~hammondHarmonics.size,
            lfo = SinOsc.kr(lfoFreq, mul: 0.05, add: 0.5);

        Out.ar(
            0,
            Pan2.ar(
                Mix.fill(n, {|i|
                    var mult = 1/(i+1);
                    SinOsc.ar(freq * ~hammondHarmonics[i]) * bars[i] * mult
                }) / n * volume * lfo
            )
        )
    }).add;

    Server.local.sync;

    // Make 10 synthesizers and bind OSC events.
    noteCount = 10;
    synth = Array.fill(noteCount, {
        Synth.new(\Hammond, [\freq, 440])
    });

    OSCdef(\oscOn, { |msg|
        synth[msg[1]].set(\freq, msg[2], \volume, msg[3]);
    }, '/oscOn');

    OSCdef(\oscOff, { |msg|
        synth[msg[1]].set(\freq, 440, \volume, 0);
    }, '/oscOff');
})
)
