using System;
using Microsoft.AspNetCore.Mvc;

namespace SongBird.Api.DTOs;

public class FontDto
{
    public int? Id { get; set; }
    public string Name { get; set; } = string.Empty; 
    public string FilePath { get; set; } = string.Empty; 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
