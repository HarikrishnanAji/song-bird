import "./WaveformDecor.css";

export default function WaveformDecor() {
  const bars = Array.from({ length: 60 }, (_, i) => ({
    height: Math.max(10, Math.round(Math.abs(Math.sin(i * 0.4) * 80 + Math.cos(i * 0.7) * 40))),
    delay: (i * 0.04).toFixed(2),
    dur: (0.5 + (i % 7) * 0.15).toFixed(2),
  }));

  return (
    <div className="waveform-decor">
      {bars.map((b, i) => (
        <span
          key={i}
          className="wf-bar"
          style={{
            height: `${b.height}%`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
