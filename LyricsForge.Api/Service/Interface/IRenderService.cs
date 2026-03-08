using System;
using LyricsForge.Api.Models;

namespace LyricsForge.Api.Service.Interface;

public interface IRenderService
{
    Task RenderAsync(Guid projectId);
    Task<VideoProject> GetVideoProjectWithLyricsByIdAsync(Guid id);
    Task AddVideoProjectAsync(Guid id,string title, string audioPath, string bgPath);
    Task AddRangeLyricsLinesAsync(Guid id,IEnumerable<LyricsLine> lines);
}
