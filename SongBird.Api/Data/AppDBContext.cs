using System;
using SongBird.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace SongBird.Api.Data;

public class AppDBContext:DbContext
{
    public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
    {
    }

    public DbSet<VideoProject> VideoProjects { get; set; }
}
