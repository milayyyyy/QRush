package org.qrush.ticketing_system.dto;

import java.time.LocalDateTime;

/**
 * Response payload returned after processing a ticket scan request.
 */
public record TicketScanResponse(
        String status,
        String message,
        Long ticketId,
        Long eventId,
        String ticketNumber,
        String attendeeName,
        String attendeeEmail,
        String eventTitle,
        LocalDateTime eventStart,
        LocalDateTime eventEnd,
        String gate,
        Integer reEntryCount,
        boolean alreadyCheckedIn,
        LocalDateTime scannedAt,
        LocalDateTime previousScanAt
) {
}
