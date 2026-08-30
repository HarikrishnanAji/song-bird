using System;
using SongBird.Api.Data.Models;

namespace SongBird.Api.Service.Interface;

public interface IFontService
{
    Task<Font> UploadAsync(IFormFile file, string name);
    Task<List<Font>> GetAllAsync();
}
