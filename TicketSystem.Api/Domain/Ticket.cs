using System;
using System.Collections.Generic;

namespace TicketSystem.Api.Domain;

public class Ticket
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = default!;
    public string Description { get; set; } = string.Empty;
    public TicketStatus Status { get; set; } = TicketStatus.Open;

    
    public Priority Priority { get; set; } = Priority.Medium;

    public string OwnerId { get; set; } = string.Empty;

    public bool IsFlagged { get; set; } = false;

    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<string> Tags { get; set; } = new();
}
