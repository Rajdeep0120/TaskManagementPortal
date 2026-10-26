using System.Text.Json;
using FluentAssertions;
using TaskManagement.Application.Common.Converters;
using TaskManagement.Application.DTOs.Tasks;
using Xunit;

namespace TaskManagement.Tests;

public class JsonConverterTests
{
    private readonly JsonSerializerOptions _options;

    public JsonConverterTests()
    {
        _options = new JsonSerializerOptions();
        _options.Converters.Add(new EmptyStringToNullableGuidConverter());
        _options.Converters.Add(new EmptyStringToNullableDateTimeConverter());
    }

    [Fact]
    public void EmptyString_ForNullableGuid_DeserializesToNull()
    {
        // Arrange
        var json = """{"AssignedToUserId": ""}""";

        // Act
        var result = JsonSerializer.Deserialize<CreateTaskRequest>(json, _options);

        // Assert
        result.Should().NotBeNull();
        result!.AssignedToUserId.Should().BeNull();
    }

    [Fact]
    public void ValidGuidString_ForNullableGuid_DeserializesCorrectly()
    {
        // Arrange
        var guid = Guid.NewGuid();
        var json = $$"""{"AssignedToUserId": "{{guid}}"}""";

        // Act
        var result = JsonSerializer.Deserialize<CreateTaskRequest>(json, _options);

        // Assert
        result.Should().NotBeNull();
        result!.AssignedToUserId.Should().Be(guid);
    }

    [Fact]
    public void EmptyString_ForNullableDateTime_DeserializesToNull()
    {
        // Arrange
        var json = """{"DueDate": ""}""";

        // Act
        var result = JsonSerializer.Deserialize<CreateTaskRequest>(json, _options);

        // Assert
        result.Should().NotBeNull();
        result!.DueDate.Should().BeNull();
    }

    [Fact]
    public void ValidDateString_ForNullableDateTime_DeserializesCorrectly()
    {
        // Arrange
        var json = """{"DueDate": "2026-10-31"}""";

        // Act
        var result = JsonSerializer.Deserialize<CreateTaskRequest>(json, _options);

        // Assert
        result.Should().NotBeNull();
        result!.DueDate.Should().Be(new DateTime(2026, 10, 31, 0, 0, 0, DateTimeKind.Utc));
    }
}
