using System;

namespace LyricsForge.Api.Models;

public class LyricTiming
{
    public string Text { get; set; } = string.Empty;
    public double Start { get; set; }
    public double End { get; set; }
}
