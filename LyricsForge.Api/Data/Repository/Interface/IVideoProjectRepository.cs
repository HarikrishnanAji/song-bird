using System;
using LyricsForge.Api.Models;

namespace LyricsForge.Api.Data.Repository.Interface;

public interface IVideoProjectRepository
{
    Task<VideoProject> GetProjectWithLyricsyIdAsync(Guid id);
    Task UpdateAsync(VideoProject project);
    Task AddAsync(VideoProject project);
    Task<VideoProject> GetByIdAsync(Guid id);
    
}
