namespace LyricsForge.Api.DTOs;

public record class CreateVideoDto
{
    public IFormFile Audio { get; set; }
    public IFormFile Background { get; set; }
    public string Title { get; set; }
}
