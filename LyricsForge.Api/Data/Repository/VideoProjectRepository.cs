using System;
using LyricsForge.Api.Data.Repository.Base;
using LyricsForge.Api.Data.Repository.Interface;
using LyricsForge.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LyricsForge.Api.Data.Repository;

public class VideoProjectRepository:BaseRepository<VideoProject>,IVideoProjectRepository
{
    public VideoProjectRepository(AppDBContext appDBContext):base(appDBContext)
    {
    }

    public async Task<VideoProject> GetProjectWithLyricsyIdAsync(Guid id)
    {
        return await _context.VideoProjects
            .Include(p => p.LyricsLines)
            .FirstOrDefaultAsync(p => p.Id == id);
    }
}
