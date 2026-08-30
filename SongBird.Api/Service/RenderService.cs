using System;
using System.Diagnostics;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Transactions;
using FFMpegCore;
using Microsoft.AspNetCore.Http.HttpResults;
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
        var formattedTitle = CultureInfo.CurrentCulture.TextInfo
            .ToTitleCase(dto.Title.ToLower());
        var project = new VideoProject
        {
            Id = id,
            Title = formattedTitle,
            AudioPath = audioPath,
            BackgroundPath = bgPath,
        };

        await AddAsync(project);

        return id.ToString();
    }

    public async Task<string> RenderAsync(string audio, string background, string srtPath, Guid projectId, string title, string fontName,bool isShort = false)
    {
        var folder = Path.Combine("Storage", "Exports");
        Directory.CreateDirectory(folder);
        var fileName = title.Replace(" ", "_");
        var outputPath = Path.Combine(folder, $"{fileName}.mp4");

        if (File.Exists(outputPath))
            File.Delete(outputPath);

        var assPath = await ConvertSrtToAss(srtPath, projectId, title, fontName, isShort);
        var bgPath = Path.GetFullPath(background).Replace("\\", "/");
        var audioPath = Path.GetFullPath(audio).Replace("\\", "/");
        var assFile = Path.GetFullPath(assPath).Replace("\\", "/");

        var logoFolder = isShort ? "shorts" : "regular";
        var logoPath = Path.GetFullPath(Path.Combine("Assets", "branding", logoFolder, "logo.png"))
                        .Replace("\\", "/");
        var fontsDir = Path.GetFullPath(Path.Combine("Assets", "fonts"))
                        .Replace("\\", "/");
        var rainPath = Path.GetFullPath(Path.Combine("Assets", "effects", "rain.mp4"))
                        .Replace("\\", "/");

        string videoFilter;
        string effect = "";
        if (isShort)
        {
            videoFilter = "[0:v]scale=1400:2500," +
                    "zoompan=z='min(zoom+0.00015,1.10)':d=1:s=1080x1920[bg];" +
                    "[3:v]scale=1080:1920,format=rgba,colorchannelmixer=aa=0.15[rain];" +
                    "[bg][rain]overlay=0:0[rainbg];" +
                    "[2:v]scale=500:-1[logo];" +
                    "[rainbg][logo]overlay=(W-w)/2:35[tmp];";
            effect = $"-stream_loop -1 -i \"{rainPath}\" ";
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
            effect +
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
        return outputPath;
    }

    public async Task<string> DownloadVideoAsync(Guid id)
    {
        var video = await GetByIdAsync(id);
        if (video == null)
            return "Video project not found.";

            var filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                video.VideoPath
            );

            if (!File.Exists(filePath))
                return "Video file not found.";

            return filePath;
    }
    #region Private Methods
    private static string EscapeWin(string path)
    {
        return Path.GetFullPath(path)
            .Replace("\\", "/")
            .Replace(":", "\\:");
    }

    private async Task<string> ConvertSrtToAss(string srtPath, Guid projectId, string title, string fontName, bool isShort)
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
        int fontSize = 27;
        if(isShort){
            fontSize = 16;
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

            $"Style: Default,{fontName},{fontSize},&H00FFFFFF,&H000000FF,&H00000000,&H00000000," +
                "1,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1\n\n";

        assContent = Regex.Replace(assContent, @"\[V4\+ Styles\][\s\S]*?\[Events\]", "[Events]");
        assContent = styleBlock + assContent;
        if(!isShort)
        {
            assContent = assContent.Replace(
                    "[Events]",
                    "[Events]\nDialogue: 0,0:00:00.50,0:00:02.30,Default,,0,0,0,,{\\fad(500,500)\\an5}" + title  + "\\N{\\fs18}-- lyrics --\n"
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