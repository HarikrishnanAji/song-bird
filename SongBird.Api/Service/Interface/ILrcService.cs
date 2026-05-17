using System;
using SongBird.Api.Data.Models;

namespace SongBird.Api.Service.Interface;

public interface ILrcService
{
    List<LyricLine> Parse(string path);
    Task<string> GetLrc(string artist, string title);
    Task<string> SaveLrc(Guid projectId, string lrcContent);
    Task<string> SaveAsSrt(Guid projectId, List<LyricLine> lines);
}
