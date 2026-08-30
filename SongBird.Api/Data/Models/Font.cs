using System;
using System.ComponentModel.DataAnnotations;
using SongBird.Api.Models;

namespace SongBird.Api.Data.Models;

public class Font
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; 
    public string FilePath { get; set; } = string.Empty; 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public ICollection<VideoProject> VideoProjects { get; set; } = new List<VideoProject>();
}
