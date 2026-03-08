using System;
using LyricsForge.Api.Models;

namespace LyricsForge.Api.Data.Repository.Interface;

public interface ILyricsLineRepository
{
    Task AddRangeAsync(IEnumerable<LyricsLine> entities);
}
