using System;

namespace LyricsForge.Api.Models;

public class LyricsLine
{
    public Guid LyricsLineId { get; set; }
    public Guid ProjectId { get; set; }
    public string Text { get; set; }
    public double StartTime { get; set; }
    public double EndTime { get; set; }

    public VideoProject Project { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
