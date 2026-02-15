using System;

namespace LyricsForge.Api.Models;

public class WordTimestamp
{
    public string Word { get; set; } = string.Empty;
    public double Start { get; set; }
    public double End { get; set; }
}
