using System;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Transactions;
using FFMpegCore;
using SongBird.Api.Data;
using SongBird.Api.Data.Models;
using SongBird.Api.Data.Repository.Base;
using SongBird.Api.Data.Repository.Interface;
using SongBird.Api.DTOs;
using SongBird.Api.Models;
using SongBird.Api.Service.Interface;
using Xabe.FFmpeg;

namespace SongBird.Api.Service;

public class RenderService : BaseRepository<VideoProject>, IRenderService
{
    private readonly ILogger<RenderService> _logger;
    public RenderService(AppDBContext context, ILogger<RenderService> logger) : base(context)
    {
        _logger = logger;
    }

    string SafePath(string p) => Path.GetFullPath(p)
                                    .Replace("\\", "/")
                                    .Replace(":", "\\:");

    public async Task<string> CreateProjectAsync(CreateVideoDto dto)
    {
        var id = Guid.NewGuid();
        var folder = Path.Combine("Storage", id.ToString());
        Directory.CreateDirectory(folder);

        var audioPath = Path.Combine(folder, $"audio_{dto.Audio.FileName}");
        var bgPath = Path.Combine(folder, $"background_{dto.Background.FileName}");

        if (File.Exists(audioPath))
        {
            File.Delete(audioPath);
        }

        if (File.Exists(bgPath))
        {
            File.Delete(bgPath);
        }

        using (var stream = File.Create(audioPath))
        {
            await dto.Audio.CopyToAsync(stream);
        }

        using (var stream = File.Create(bgPath))
        {
            await dto.Background.CopyToAsync(stream);
        }

        var project = new VideoProject
        {
            Id = id,
            Title = dto.Title,
            AudioPath = audioPath,
            BackgroundPath = bgPath
        };

        await AddAsync(project);

        return id.ToString();
    }

    public async Task<string> RenderAsync(string audio, string background, string srtPath, Guid projectId, string title, bool isShort = false)
    {
        var folder = Path.Combine("Storage", projectId.ToString(), "Video");
        Directory.CreateDirectory(folder);
        var outputPath = Path.Combine(folder, $"{title}.mp4");

        if (File.Exists(outputPath))
            File.Delete(outputPath);

        var assPath = await ConvertSrtToAss(srtPath, projectId, title, isShort);
        var bgPath = Path.GetFullPath(background).Replace("\\", "/");
        var audioPath = Path.GetFullPath(audio).Replace("\\", "/");
        var assFile = Path.GetFullPath(assPath).Replace("\\", "/");

        // string? logoPath = null;
        var logoFolder = isShort ? "shorts" : "regular";
        var logoPath = Path.GetFullPath(Path.Combine("Assets", "branding", logoFolder, "logo.png"))
            .Replace("\\", "/");
        var fontsDir = Path.GetFullPath(Path.Combine("Assets", "fonts"))
            .Replace("\\", "/");
        var fontFile = Path.Combine("Assets", "fonts", "EDO SZ.ttf")
            .Replace("\\", "/")
            .Replace(":", "\\:");

        string videoFilter;

        if (isShort)
        {
            videoFilter =
                "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p[bg];" +
                "[2:v]scale=816:81[logo];" +
                "[bg][logo]overlay=(W-w)/2:35[tmp];";
        }
        else
        {
            videoFilter =
                    "[0:v]scale=1280:720,format=yuv420p[bg];" +
                    "[2:v]scale=150:150[logo];" +
                    "[bg][logo]overlay=W-w-20:20:enable='gte(t,0.5)'[tmp];";
        }

        var args =
            "-y " +
            $"-loop 1 -t 9999 -i \"{bgPath}\" " +
            $"-i \"{audioPath}\" " +
            $"-i \"{logoPath}\" " +
        "-filter_complex \"" +
        videoFilter +
        $"[tmp]ass=filename='{assFile.Replace(":", "\\:")}':fontsdir='{fontsDir.Replace(":", "\\:")}'[sub];" +
        "[sub]fade=t=in:st=0:d=1," +
        "fade=t=out:st=9998:d=1[video]" +
        "\" " +
            "-map \"[video]\" " +
            "-map 1:a " +
            "-c:v libx264 " +
            "-preset veryfast " +
            "-crf 28 " +
            "-pix_fmt yuv420p " +
            "-c:a aac " +
            "-shortest " +
            $"\"{outputPath.Replace("\\", "/")}\"";

        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "ffmpeg",
                Arguments = args,
                RedirectStandardError = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };
        process.Start();
        string error = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();
        _logger.LogError("FFmpeg EXIT: {code}", process.ExitCode);
        _logger.LogError("FFmpeg ERROR: {error}", error);

        if (process.ExitCode != 0)
            throw new Exception(error);

        var exportFolder = Path.Combine("Storage", "Exports");
        Directory.CreateDirectory(exportFolder);

        var exportPath = Path.Combine(exportFolder, Path.GetFileName(outputPath));
        System.IO.File.Copy(outputPath, exportPath, true);
        return outputPath;
    }

#region Private Methods
    private static string EscapeWin(string path)
    {
        return Path.GetFullPath(path)
            .Replace("\\", "/")
            .Replace(":", "\\:");
    }

    private async Task<string> ConvertSrtToAss(string srtPath, Guid projectId, string title, bool isShort)
    {
        var folder = Path.Combine("Storage", projectId.ToString(), "Video");
        Directory.CreateDirectory(folder);

        var assPath = Path.Combine(folder, "lyrics.ass");

        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "ffmpeg",
                Arguments = $"-y -i \"{srtPath}\" \"{assPath}\"",
                RedirectStandardError = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        process.Start();
        await process.WaitForExitAsync();

        var assContent = await File.ReadAllTextAsync(assPath);
        int fontSize = 32;
        if(isShort){
            fontSize = 21;
        }
        var styleBlock =
            "[Script Info]\n" +
            "ScriptType: v4.00+\n" +
            "PlayResX: 1920\n" +
            "PlayResY: 1080\n\n" +

            "[V4+ Styles]\n" +
            "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, " +
            "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, " +
            "Alignment, MarginL, MarginR, MarginV, Encoding\n" +

            $"Style: Default,EDO SZ,{fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H00000000," +
                "1,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1\n\n";

        assContent = Regex.Replace(assContent, @"\[V4\+ Styles\][\s\S]*?\[Events\]", "[Events]");
        assContent = styleBlock + assContent;
        if(!isShort)
        {
            assContent = assContent.Replace(
                    "[Events]",
                    "[Events]\nDialogue: 0,0:00:00.50,0:00:02.30,Default,,0,0,0,,{\\fad(500,500)\\an5}" + title + "\n"
                );     
        }

        assContent = Regex.Replace(
            assContent,
            @"Dialogue: (.*)",
            "Dialogue: $1{\\fad(300,300)}"
        );

        await File.WriteAllTextAsync(assPath, assContent);

        return assPath;
    }

#endregion
}