using System;
using LyricsForge.Api.Util;

namespace LyricsForge.Api.Models;

public class VideoProject
{
     public Guid Id { get; set; }
    public string Title { get; set; }
    public string AudioPath { get; set; }
    public string BackgroundPath { get; set; }
    public string OutputPath { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public short UserId { get; set; } = Constants.SystemUserId;

    public List<LyricsLine> LyricsLines { get; set; }
}
