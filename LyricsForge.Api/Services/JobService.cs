using System;
using LyricsForge.Api.Helpers.Interfaces;
using LyricsForge.Api.Services.Interfaces;

namespace LyricsForge.Api.Services;

public class JobService:IJobService
{
    private readonly IWhisperService _whisperService;
    private readonly ILyricsMapper _mapper;
    private readonly IFfmpegService _ffmpegService;
    private readonly IWebHostEnvironment _env;
    public JobService(IWhisperService whisperService, IFfmpegService ffmpegService,
     IWebHostEnvironment env, ILyricsMapper mapper)
    {
        _whisperService = whisperService;
        _ffmpegService = ffmpegService;
        _env = env;
        _mapper = mapper;
    }

    public async Task<string> CreateJobAsync(IFormFile audio,IFormFile lyrics)
    {
       var uploads = Path.Combine(_env.WebRootPath, "uploads");
        Directory.CreateDirectory(uploads);

        var audioPath = Path.Combine(uploads, audio.FileName);
        var lyricsPath = Path.Combine(uploads, lyrics.FileName);

        using (var stream = new FileStream(audioPath, FileMode.Create))
            await audio.CopyToAsync(stream);

        using (var stream = new FileStream(lyricsPath, FileMode.Create))
            await lyrics.CopyToAsync(stream);

        var words = await _whisperService.TranscribeAsync(audioPath);
        var lyricsText = await File.ReadAllTextAsync(lyricsPath);

        var timings = _mapper.MapLines(lyricsText, words);

        var videoUrl = await _ffmpegService.RenderAsync(audioPath, timings);

        return videoUrl;
    }
}
