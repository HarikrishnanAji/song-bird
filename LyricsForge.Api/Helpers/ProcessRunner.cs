using System;
using System.Diagnostics;
using LyricsForge.Api.Helpers.Interfaces;

namespace LyricsForge.Api.Helpers;

public class ProcessRunner:IProcessRunner
{
    public async Task RunAsync(string fileName, string arguments)
    {
        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };
        process.Start();
        await process.WaitForExitAsync();
        if (process.ExitCode != 0)
        {
            var error = await process.StandardError.ReadToEndAsync();
            throw new Exception($"Process exited with code {process.ExitCode}: {error}");
        }
    }
}
