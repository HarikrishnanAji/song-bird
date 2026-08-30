using System;

namespace SongBird.Api.Data.Models;

public class LyricsRangeRequest
{
    public string Artist { get; set; }
    public string Track { get; set; }
    public double StartTime { get; set; }  
    public double EndTime { get; set; } 
}
