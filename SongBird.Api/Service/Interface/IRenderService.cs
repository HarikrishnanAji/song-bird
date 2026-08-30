using System;
using SongBird.Api.Data.Models;
using SongBird.Api.DTOs;
using SongBird.Api.Models;

namespace SongBird.Api.Service.Interface;

public interface IRenderService
{
    Task<string> CreateProjectAsync(CreateVideoDto dto);
    Task<string> RenderAsync(string audio, string background, string srtPath, Guid projectId, string title, string fontName,bool isShort = false);    Task AddAsync(VideoProject project);
    Task UpdateAsync(VideoProject project);
    Task<VideoProject> GetByIdAsync(Guid id);
    Task<IEnumerable<VideoProject>> GetAllAsync();
    Task<string> DownloadVideoAsync(Guid id);
}
