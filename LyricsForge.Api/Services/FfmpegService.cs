using System;
using System.Text;
using LyricsForge.Api.Helpers.Interfaces;
using LyricsForge.Api.Models;
using LyricsForge.Api.Services.Interfaces;

namespace LyricsForge.Api.Services;

public class FfmpegService:IFfmpegService
{
    private readonly IProcessRunner _processRunner;
    private readonly IWebHostEnvironment _env;

    public FfmpegService(IProcessRunner processRunner, IWebHostEnvironment env)
    {
        _processRunner = processRunner;
        _env = env;
    }
    public async Task<string> RenderAsync(string audioPath, List<LyricTiming> timings)
    {
        var outputFolder = Path.Combine(_env.WebRootPath, "output");
        Directory.CreateDirectory(outputFolder);

        var srtPath = Path.Combine(outputFolder, $"{Guid.NewGuid()}.srt");
        var videoPath = Path.Combine(outputFolder, $"{Guid.NewGuid()}.mp4");

        await File.WriteAllTextAsync(srtPath, GenerateSrt(timings));

        var arguments =
            $"-loop 1 -i background.png -i \"{audioPath}\" " +
            $"-vf subtitles=\"{srtPath}\" " +
            "-c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest " +
            $"\"{videoPath}\"";

        await _processRunner.RunAsync("ffmpeg", arguments);

        return $"/output/{Path.GetFileName(videoPath)}";
    }
    #region Private Methods
    private string GenerateSrt(List<LyricTiming> timings)
    {
        var sb = new StringBuilder();
        int index = 1;

        foreach (var line in timings)
        {
            sb.AppendLine(index.ToString());
            sb.AppendLine($"{Format(line.Start)} --> {Format(line.End)}");
            sb.AppendLine(line.Text);
            sb.AppendLine();
            index++;
        }

        return sb.ToString();
    }

    private string Format(double seconds)
    {
        var t = TimeSpan.FromSeconds(seconds);
        return $"{t:hh\\:mm\\:ss\\,fff}";
    }
    #endregion
}
