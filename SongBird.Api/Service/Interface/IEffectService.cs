using System;
using SongBird.Api.Data.Models;

namespace SongBird.Api.Service.Interface;

public interface IEffectService
{
    Task<ApiResponse<Effect>> AddEffectAsync(IFormFile file, string type, string name, bool? isShorts = null);
    Task<List<Effect>> GetAllEffectsAsync(string? type);
    Task<Effect?> GetEffectByIdAsync(int id);
    Task DeleteEffectAsync(int id);
}
