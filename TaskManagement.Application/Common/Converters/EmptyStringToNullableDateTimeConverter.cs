using System.Text.Json;
using System.Text.Json.Serialization;

namespace TaskManagement.Application.Common.Converters;

/// <summary>
/// Deserializes empty JSON strings ("") to null for Nullable<DateTime> properties.
/// Handles date string parsing and converts unspecified kinds to UTC.
/// </summary>
public class EmptyStringToNullableDateTimeConverter : JsonConverter<DateTime?>
{
    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (string.IsNullOrWhiteSpace(str))
            {
                return null;
            }

            if (DateTime.TryParse(str, out var dt))
            {
                return dt.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(dt, DateTimeKind.Utc)
                    : dt.ToUniversalTime();
            }

            throw new JsonException($"Unable to convert \"{str}\" to {nameof(DateTime)}.");
        }

        throw new JsonException($"Unexpected token type '{reader.TokenType}' when parsing nullable DateTime.");
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
        {
            writer.WriteStringValue(value.Value.ToString("O"));
        }
        else
        {
            writer.WriteNullValue();
        }
    }
}

