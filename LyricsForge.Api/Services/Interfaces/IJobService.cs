using System;

namespace LyricsForge.Api.Services.Interfaces;

public interface IJobService
{
     Task<string> CreateJobAsync(IFormFile audio,IFormFile lyrics);
}
