using System;
using SongBird.Api.Util;

namespace SongBird.Api.Data.Models;

public class ApiResponse<T>
{
    public string Message { get; set; }
    public T? Data { get; set; }
    public int StatusCode { get; set; }
    public ApiResponse(string message, T? data, int statusCode)
    {
        Message = message;
        Data = data;
        StatusCode = statusCode;
    }

    public static ApiResponse<T> Success(
        string message,
        T? data,
        int? statusCode = (int)ResponseStatus.Success)
        => new(message, data, default);
    public static ApiResponse<T> BadRequest(
        string message,
        int? statusCode = (int)ResponseStatus.BadRequest)
        => new(message, default, default);
    public static ApiResponse<T> Failure(
        string message = Errors.INTERNAL_SERVER_ERROR,
        int? statusCode = (int)ResponseStatus.Failure)
        => new(message, default, default);
}
