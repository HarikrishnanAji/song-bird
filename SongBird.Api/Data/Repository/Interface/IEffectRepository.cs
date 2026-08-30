using System;
using SongBird.Api.Data.Models;

namespace SongBird.Api.Data.Repository.Interface;

public interface IEffectRepository
{
    Task AddAsync(Effect effect);
    Task<List<Effect>> GetAllAsync();
    Task<Effect?> GetByIdAsync(int id);
    Task UpdateAsync(Effect effect);
}
