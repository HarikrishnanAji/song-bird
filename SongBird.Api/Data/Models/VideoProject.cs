using System;
using SongBird.Api.Util;

namespace SongBird.Api.Models;

public class VideoProject
{
     public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AudioPath { get; set; } = string.Empty;
    public string BackgroundPath { get; set; } = string.Empty;
    public string LyricsText { get; set; } = string.Empty;
    public string LrcPath { get; set; } = string.Empty;
    public string VideoPath { get; set; } = string.Empty;
    public string Status { get; set; } = Constants.InitialStatus;
    public int RenderProgress { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public short UserId { get; set; } = Constants.SystemUserId;
}
