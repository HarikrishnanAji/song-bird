using System;
using LyricsForge.Api.Helpers.Interfaces;
using LyricsForge.Api.Models;

namespace LyricsForge.Api.Helpers;

public class LyricsMapper : ILyricsMapper
{
    public List<LyricTiming> MapLines(string lyricsText, List<WordTimestamp> words)
    {
        var lines = lyricsText.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var result = new List<LyricTiming>();
        int wordIndex = 0;
        foreach (var line in lines)
        {
            var lineWords = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (wordIndex >= words.Count)
                break;

            var start = words[wordIndex].Start;

            wordIndex += lineWords.Length - 1;
            if (wordIndex >= words.Count)
                wordIndex = words.Count - 1;

            var end = words[wordIndex].End;

            result.Add(new LyricTiming
            {
                Text = line.Trim(),
                Start = start,
                End = end
            });

            wordIndex++;
        }
        return result;
    }
}
