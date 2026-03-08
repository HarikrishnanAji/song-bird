using System;
using LyricsForge.Api.Data.Repository.Base;
using LyricsForge.Api.Data.Repository.Interface;
using LyricsForge.Api.Models;

namespace LyricsForge.Api.Data.Repository;

public class LyricsLineRepository : BaseRepository<LyricsLine>, ILyricsLineRepository
{
    public LyricsLineRepository(AppDBContext appDBContext) : base(appDBContext)
    {
    } 
}
