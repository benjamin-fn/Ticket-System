namespace TicketSystem.Api.Application;

using TicketSystem.Api.Domain;

public record ChangeStatusRequest(TicketStatus Status);
