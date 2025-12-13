namespace TicketSystem.Api.Application;

using TicketSystem.Api.Domain;

public record CreateTicketRequest(
    string Title,
    string? Description,
    Priority? Priority,
    bool? IsFlagged
);
