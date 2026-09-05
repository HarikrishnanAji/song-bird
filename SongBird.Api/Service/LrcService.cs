using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using SongBird.Api.Data.Models;
using SongBird.Api.Service.Interface;
using SongBird.Api.Util;

namespace SongBird.Api.Service;

public class LrcService : ILrcService
{
    private readonly HttpClient _httpClient;

    public LrcService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    private static readonly Regex regex = new Regex(Messages.RegEx);


    public List<LyricLine> Parse(string path)
    {
        var lines = File.ReadAllLines(path);
        var result = new List<LyricLine>();
        foreach (var line in lines)
        {
            var matches = regex.Matches(line);
            if (matches.Count == 0)
                continue;
            var text = Regex.Replace(line, @"\[(\d{2}):(\d{2})\.(\d{2})\]", "").Trim();
            foreach (Match m in matches)
            {
                int min = int.Parse(m.Groups[1].Value);
                int sec = int.Parse(m.Groups[2].Value);
                int cs = int.Parse(m.Groups[3].Value);

                result.Add(new LyricLine
                {
                    Timestamp = new TimeSpan(0, 0, min, sec, cs * 10),
                    Text = text
                });
            }
        }
        return result.OrderBy(x => x.Timestamp).ToList();
    }
    public async Task<string> SaveAsSrt(Guid projectId, List<LyricLine> lines)
    {
        var folder = Path.Combine($"Storage/{projectId}", "Lrc");
        Directory.CreateDirectory(folder);

        var path = Path.Combine(folder, $"{projectId}.srt");

        if (File.Exists(path))
            File.Delete(path);

        using var writer = new StreamWriter(path, false, Encoding.UTF8);

        for (int i = 0; i < lines.Count; i++)
        {
            var start = lines[i].Timestamp;
            var end = (i + 1 < lines.Count)
                ? lines[i + 1].Timestamp
                : start.Add(TimeSpan.FromSeconds(4));

            writer.WriteLine(i + 1);
            writer.WriteLine($"{FormatTime(start)} --> {FormatTime(end)}");
            writer.WriteLine(lines[i].Text);
            writer.WriteLine();
        }

        return path;
    }
    public async Task<string> GetLrc(string artist, string title)
    {
        try
        {
            var url = string.Format(Messages.LrcUrlTemplate, artist, title);
            var response = await _httpClient.GetStringAsync(url);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var data = JsonSerializer.Deserialize<LrcApiResponse>(response, options);
            if (data == null || string.IsNullOrWhiteSpace(data.SyncedLyrics))
                return "Data not found";
            return data.SyncedLyrics ?? "";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching LRC: {ex.Message}");
            return ex.Message;
        }
    }

    public async Task<string> SaveLrc(Guid projectId, string lrcContent)
    {
        var folder = Path.Combine($"Storage/{projectId}", "Lrc");
        if (!Directory.Exists(folder))
            Directory.CreateDirectory(folder);
        var path = Path.Combine(folder, $"{projectId}.lrc");
        await File.WriteAllTextAsync(path, lrcContent);
        return path;
    }
    private string FormatTime(TimeSpan time)
    {
        return $"{time.Hours:00}:{time.Minutes:00}:{time.Seconds:00},{time.Milliseconds:000}";
    }
}
