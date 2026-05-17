using System;
using SongBird.Api.Models;

namespace SongBird.Api.Data.Repository.Interface;

public interface IVideoProjectRepository
{
    Task UpdateAsync(VideoProject project);
    Task AddAsync(VideoProject project);
    Task<VideoProject> GetByIdAsync(Guid id);
    
}
