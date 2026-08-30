using System;
using SongBird.Api.Data;
using SongBird.Api.Data.Models;
using SongBird.Api.Data.Repository.Interface;
using SongBird.Api.Service.Interface;
using SongBird.Api.Util;

namespace SongBird.Api.Service;

public class EffectService:IEffectService
{
    private readonly IEffectRepository _effectRepository;
    public EffectService(IEffectRepository effectRepository)
    {
        _effectRepository = effectRepository;
    }

    public async Task<ApiResponse<Effect>> AddEffectAsync(IFormFile file, string type, string name, bool? isShorts = null)
    {
        try{
            if(file == null || file.Length == 0)
                return ApiResponse<Effect>.BadRequest("File required");
            
            var folder = string.Empty;
            if (type.Equals("font", StringComparison.OrdinalIgnoreCase))
            {
                folder = Path.Combine(
                    "Assets",
                    "fonts"
                );
            }
            else if (type.Equals("effect", StringComparison.OrdinalIgnoreCase))
            {
                folder = Path.Combine(
                    "Assets",
                    "effects"
                );
            }
            else if (type.Equals("logo", StringComparison.OrdinalIgnoreCase))
            {
                if(isShorts == null)
                    isShorts = false;
                var logoTypeFolder = (bool)isShorts ? "shorts" : "regular";
                folder = Path.Combine(
                    "Assets",
                    "logo",
                    logoTypeFolder
                );
            }
            else
            {
                return ApiResponse<Effect>.BadRequest("Please provide a valid data");
            }

            Directory.CreateDirectory(folder);
            var fileName =
                $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

            var path = Path.Combine(folder,fileName);
            using(var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var effect = new Effect
            {
                Name = Path.GetFileNameWithoutExtension(file.FileName),
                Type = type,
                FilePath = $"effects/{type.ToLower()}/{fileName}"
            };
            await _effectRepository.AddAsync(effect);
            return ApiResponse<Effect>.Success(Messages.EFFECT_CREATE_SUCCESS.ToString(), effect);
        }
        catch(Exception ex)
        {
            throw new Exception(ex.StackTrace);
        }
    }

    public async Task<List<Effect>> GetAllEffectsAsync(string? type)
    {
        return await _effectRepository.GetAllAsync();
    }

    public async Task<Effect?> GetEffectByIdAsync(int id)
    {
        return await _effectRepository.GetByIdAsync(id);
    }
    public async Task DeleteEffectAsync(int id)
    {
        try{   
            var effect =
                await _effectRepository.GetByIdAsync(id);
            
            if(effect == null)
                throw new Exception("Not found");

            effect.IsActive = false;
            effect.UpdatedAt = DateTime.UtcNow;
            await _effectRepository.UpdateAsync(effect);
        }
        catch(Exception ex)
        {
            throw new Exception(ex.StackTrace);
        }
    }
}
