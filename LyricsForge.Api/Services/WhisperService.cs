using System;
using LyricsForge.Api.Models;
using LyricsForge.Api.Services.Interfaces;
using Whisper.net;

namespace LyricsForge.Api.Services;

public class WhisperService: IWhisperService
{
    private readonly string _modelPath = "AIModels/ggml-tiny.bin";

    public async Task<List<WordTimestamp>> TranscribeAsync(string audioPath)
    {
        var result = new List<WordTimestamp>();
        using var whisperFactory = WhisperFactory.FromPath(_modelPath);
        using var processor = whisperFactory.CreateBuilder()
            .WithLanguage("en")
            .Build();

        using var fileStream = File.OpenRead(audioPath);
        await foreach (var word in processor.ProcessAsync(fileStream))
        {
            result.Add(new WordTimestamp
            {
                Word = word.Text,
                Start = word.Start.TotalSeconds,
                End = word.End.TotalSeconds
            });
        }

        return result;
    }
}
