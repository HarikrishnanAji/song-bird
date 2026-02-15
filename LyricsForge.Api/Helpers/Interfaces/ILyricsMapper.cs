using System;
using LyricsForge.Api.Models;

namespace LyricsForge.Api.Helpers.Interfaces;

public interface ILyricsMapper
{
    List<LyricTiming> MapLines(string lyricsText, List<WordTimestamp> words);
}
