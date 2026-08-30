using System;
using SongBird.Api.Data.Models;
using SongBird.Api.Data.Repository.Interface;

namespace SongBird.Api.Service;

public class FontService
{
    private readonly IFontRepository _fontRepository;
    private readonly IWebHostEnvironment _environment;

    public FontService(
        IFontRepository fontRepository,
        IWebHostEnvironment environment)
    {
        _fontRepository = fontRepository;
        _environment = environment;
    }

    public async Task<Font> UploadAsync(IFormFile file, string name)
    {
        if (file == null || file.Length == 0)
            throw new Exception("No font file selected.");

        if (string.IsNullOrWhiteSpace(name))
            throw new Exception("Font name is required.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension != ".ttf" &&
            extension != ".otf" &&
            extension != ".woff" &&
            extension != ".woff2")
        {
            throw new Exception("Invalid font file.");
        }

        var folder = Path.Combine(
            _environment.ContentRootPath,
            "Assets",
            "Fonts"
        );

        Directory.CreateDirectory(folder);

        var safeName = name.Replace(" ", "_");
        var fileName = $"{safeName}{extension}";

        var physicalPath = Path.Combine(folder, fileName);

        using var stream = new FileStream(
            physicalPath,
            FileMode.Create
        );

        await file.CopyToAsync(stream);

        var font = new Font
        {
            Name = name,
            FilePath = Path.Combine(
                "Assets",
                "fonts",
                fileName
            ),
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        return await _fontRepository.AddAsync(font);
    }

    public async Task<List<Font>> GetAllAsync()
    {
        return await _fontRepository.GetAllAsync();
    }
}
