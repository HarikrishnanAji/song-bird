using System;

namespace LyricsForge.Api.Helpers.Interfaces;

public interface IProcessRunner
{
    Task RunAsync(string fileName, string arguments);
}
