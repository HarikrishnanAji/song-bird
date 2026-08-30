using System;
using SongBird.Api.Models;
using Microsoft.EntityFrameworkCore;
using SongBird.Api.Data.Models;

namespace SongBird.Api.Data;

public class AppDBContext:DbContext
{
    public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
    {
    }

    public DbSet<VideoProject> VideoProjects { get; set; }
    public DbSet<Font> Fonts { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VideoProject>()
            .HasOne(vp => vp.Font)
            .WithMany(f => f.VideoProjects)
            .HasForeignKey(vp => vp.FontId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
