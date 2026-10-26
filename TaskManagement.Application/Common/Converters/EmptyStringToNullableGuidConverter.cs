using System.Text.Json;
using System.Text.Json.Serialization;

namespace TaskManagement.Application.Common.Converters;

/// <summary>
/// Deserializes empty JSON strings ("") to null for Nullable<Guid> properties.
/// Prevents System.Text.Json deserialization errors when forms send empty string values.
/// </summary>
public class EmptyStringToNullableGuidConverter : JsonConverter<Guid?>
{
    public override Guid? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
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

            if (Guid.TryParse(str, out var guid))
            {
                return guid;
            }

            throw new JsonException($"Unable to convert \"{str}\" to {nameof(Guid)}.");
        }

        throw new JsonException($"Unexpected token type '{reader.TokenType}' when parsing nullable Guid.");
    }

    public override void Write(Utf8JsonWriter writer, Guid? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
        {
            writer.WriteStringValue(value.Value.ToString());
        }
        else
        {
            writer.WriteNullValue();
        }
    }
}

