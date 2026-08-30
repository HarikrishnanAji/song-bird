using System;
using Microsoft.EntityFrameworkCore;
using SongBird.Api.Data.Models;

namespace SongBird.Api.Data.Repository;

public class FontRepository
{
    private readonly AppDBContext _context;

    public FontRepository(AppDBContext context)
    {
        _context = context;
    }

    public async Task<Font> AddAsync(Font font)
    {
        _context.Fonts.Add(font);
        await _context.SaveChangesAsync();

        return font;
    }

    public async Task<List<Font>> GetAllAsync()
    {
        return await _context.Fonts
            .Where(x => x.IsActive)
            .ToListAsync();
    }
}
