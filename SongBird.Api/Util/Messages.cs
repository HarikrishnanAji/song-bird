using System;

namespace SongBird.Api.Util;

public class Messages
{
    public static string LrcUrlTemplate => "https://lrclib.net/api/get?artist_name={0}&track_name={1}";
    public static string RegEx =>@"\[(\d{2}):(\d{2})\.(\d{2})\](.*)";
}
