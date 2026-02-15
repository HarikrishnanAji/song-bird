using System;
using LyricsForge.Api.Models;

namespace LyricsForge.Api.Services.Interfaces;

public interface IWhisperService
{
    Task<List<WordTimestamp>> TranscribeAsync(string audioPath);
    
}
