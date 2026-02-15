using System;
using LyricsForge.Api.Models;

namespace LyricsForge.Api.Services.Interfaces;

public interface IFfmpegService
{
    Task<string> RenderAsync(string audioPath, List<LyricTiming> timings);
}
