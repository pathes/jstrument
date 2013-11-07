(
SynthDef.new(\ping, {|freq=440, vol=1.0|
    var out, modulator;
    modulator = EnvGen.kr(Env.perc(0, 1), doneAction: 2);
    freq.postln;
    "aaa".postln;
    out = modulator * SinOsc.ar(freq: freq) * 0.1 * vol;

    Out.ar(0, out);
}).add;
)

(
o = OSCresponderNode(nil, "/foo", {|time, resp, msg|
    Synth(\ping, [freq: msg[1], vol: msg[2]])
}).add;
)

o.remove;
