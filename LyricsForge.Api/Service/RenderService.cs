using System;
using LyricsForge.Api.Data.Repository.Interface;
using LyricsForge.Api.DTOs;
using LyricsForge.Api.Models;
using LyricsForge.Api.Service.Interface;
using Xabe.FFmpeg;

namespace LyricsForge.Api.Service;

public class RenderService:IRenderService
{
     private readonly IVideoProjectRepository _videoProjectRepository;
     private readonly ILyricsLineRepository _lyricsLineRepository;

    public RenderService(IVideoProjectRepository videoProjectRepository, ILyricsLineRepository lyricsLineRepository)
    {
        _videoProjectRepository = videoProjectRepository;
        _lyricsLineRepository = lyricsLineRepository;
    }
    public async Task RenderAsync(Guid projectId)
    {
        var project = await _videoProjectRepository.GetProjectWithLyricsyIdAsync(projectId);

        project.Status = "Processing";
        await _videoProjectRepository.UpdateAsync(project);

        var srtPath = GenerateSrt(project);
        var outputPath = Path.Combine("Storage", $"{projectId}_output.mp4");

        var conversion = FFmpeg.Conversions.New()
            .AddParameter($"-i \"{project.BackgroundPath}\"", ParameterPosition.PreInput)
            .AddParameter($"-i \"{project.AudioPath}\"", ParameterPosition.PreInput)
            .AddParameter($"-vf subtitles=\"{srtPath}\"")
            .AddParameter("-c:a copy")
            .SetOutput(outputPath);

        await conversion.Start();

        project.OutputPath = outputPath;
        project.Status = "Completed";

        await _videoProjectRepository.UpdateAsync(project);
    }
    public async Task<VideoProject> GetVideoProjectByIdAsync(Guid id)
    {
        return await _videoProjectRepository.GetByIdAsync(id);
    }
    public async Task AddRangeLyricsLinesAsync(Guid id,IEnumerable<LyricsLine> lines)
    {
        foreach (var line in lines)
        {
            line.LyricsLineId = Guid.NewGuid();
            line.ProjectId = id;
        }
        await _lyricsLineRepository.AddRangeAsync(lines);
    }
    public async Task AddVideoProjectAsync(Guid id,string title, string audioPath, string bgPath)
    {
        var project = new VideoProject
        {
            Id = id,
            Title = title,
            AudioPath = audioPath,
            BackgroundPath = bgPath
        };

        await _videoProjectRepository.AddAsync(project);
    }
  
    public async Task<VideoProject> GetVideoProjectWithLyricsByIdAsync(Guid id)
    {
        return await _videoProjectRepository.GetProjectWithLyricsyIdAsync(id);
    }

    #region Private Methods
    private string GenerateSrt(VideoProject project)
    {
        var path = Path.Combine("Storage", $"{project.Id}.srt");
        using var writer = new StreamWriter(path);

        int index = 1;
        foreach (var line in project.LyricsLines.OrderBy(x => x.StartTime))
        {
            writer.WriteLine(index++);
            writer.WriteLine($"{ToSrtTime(line.StartTime)} --> {ToSrtTime(line.EndTime)}");
            writer.WriteLine(line.Text);
            writer.WriteLine();
        }

        return path;
    }

    private string ToSrtTime(double seconds)
    {
        var time = TimeSpan.FromSeconds(seconds);
        return $"{time:hh\\:mm\\:ss\\,fff}";
    }
    #endregion
}
