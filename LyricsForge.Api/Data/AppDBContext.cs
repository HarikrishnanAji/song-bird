using System;
using LyricsForge.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LyricsForge.Api.Data;

public class AppDBContext:DbContext
{
    public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
    {
    }

    public DbSet<LyricsLine> LyricsLines { get; set; }
    public DbSet<VideoProject> VideoProjects { get; set; }
}
