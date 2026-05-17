using System;

namespace SongBird.Api.Data.Models;

public class LyricLine
{
    public TimeSpan Timestamp { get; set; }
    public string Text { get; set; }
}
