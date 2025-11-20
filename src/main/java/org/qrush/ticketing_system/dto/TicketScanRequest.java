package org.qrush.ticketing_system.dto;

/**
 * Request payload for scanning and validating a ticket QR code.
 */
public record TicketScanRequest(
        String qrCode,
        Long staffUserId,
        String gate
) {
}
