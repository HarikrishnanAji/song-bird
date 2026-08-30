using System;
using SongBird.Api.Data.Models;

namespace SongBird.Api.Data.Repository.Interface;

public interface IFontRepository
{
    Task<Font> AddAsync(Font font);
    Task<List<Font>> GetAllAsync();
}
