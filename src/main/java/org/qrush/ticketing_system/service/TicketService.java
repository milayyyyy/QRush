package org.qrush.ticketing_system.service;

import org.qrush.ticketing_system.dto.BookTicketRequest;
import org.qrush.ticketing_system.dto.TicketScanRequest;
import org.qrush.ticketing_system.dto.TicketScanResponse;
import org.qrush.ticketing_system.entity.AttendanceLogEntity;
import org.qrush.ticketing_system.entity.EventEntity;
import org.qrush.ticketing_system.entity.TicketEntity;
import org.qrush.ticketing_system.entity.UserEntity;
import org.qrush.ticketing_system.repository.AttendanceLogRepository;
import org.qrush.ticketing_system.repository.EventRepository;
import org.qrush.ticketing_system.repository.TicketRepository;
import org.qrush.ticketing_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.IntStream;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private static final String TICKET_ID_REQUIRED = "Ticket ID must not be null";
    private static final String USER_ID_REQUIRED = "User ID must not be null";
    private static final String EVENT_ID_REQUIRED = "Event ID must not be null";
    private static final String UPDATED_TICKET_REQUIRED = "Updated ticket must not be null";

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         EventRepository eventRepository,
                         AttendanceLogRepository attendanceLogRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.attendanceLogRepository = attendanceLogRepository;
    }

    public List<TicketEntity> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<TicketEntity> getTicketById(Long id) {
        return ticketRepository.findById(Objects.requireNonNull(id, TICKET_ID_REQUIRED));
    }

    public TicketEntity createTicket(TicketEntity ticket) {
        return ticketRepository.save(Objects.requireNonNull(ticket, "Ticket must not be null"));
    }

    public List<TicketEntity> bookTickets(BookTicketRequest request) {
        Objects.requireNonNull(request, "Ticket booking request must not be null");
        Long userId = Objects.requireNonNull(request.getUserId(), USER_ID_REQUIRED);
        Long eventId = Objects.requireNonNull(request.getEventId(), EVENT_ID_REQUIRED);

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        int quantity = Math.max(1, request.getQuantity());
        String ticketType = Optional.ofNullable(request.getTicketType()).filter(type -> !type.isBlank())
                .orElse("REGULAR");

        return IntStream.range(0, quantity)
            .mapToObj(index -> createTicketEntity(user, event, ticketType))
            .map(ticketRepository::save)
            .toList();
    }

    private TicketEntity createTicketEntity(UserEntity user, EventEntity event, String ticketType) {
        TicketEntity ticket = new TicketEntity();
        ticket.setUser(user);
        ticket.setEvent(event);
        ticket.setTicketType(ticketType);
        ticket.setStatus("ACTIVE");
        ticket.setPrice(event.getTicketPrice());
        ticket.setPurchaseDate(LocalDateTime.now());
        ticket.setQrCode(UUID.randomUUID().toString());
        return ticket;
    }

    public TicketEntity updateTicket(Long id, TicketEntity updatedTicket) {
        Objects.requireNonNull(id, TICKET_ID_REQUIRED);
        Objects.requireNonNull(updatedTicket, UPDATED_TICKET_REQUIRED);
        return ticketRepository.findById(id).map(ticket -> {
            ticket.setUser(updatedTicket.getUser());
            ticket.setEvent(updatedTicket.getEvent());
            ticket.setQrCode(updatedTicket.getQrCode());
            ticket.setPrice(updatedTicket.getPrice());
            ticket.setPurchaseDate(updatedTicket.getPurchaseDate());
            ticket.setTicketType(updatedTicket.getTicketType());
            ticket.setStatus(updatedTicket.getStatus());
            return ticketRepository.save(ticket);
        }).orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + id));
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(Objects.requireNonNull(id, TICKET_ID_REQUIRED));
    }

    public TicketScanResponse scanTicket(TicketScanRequest request) {
        Objects.requireNonNull(request, "Ticket scan request must not be null");

        String qrCode = Optional.ofNullable(request.qrCode())
                .map(String::trim)
                .orElse("");
        if (qrCode.isEmpty()) {
            throw new IllegalArgumentException("QR code must not be empty");
        }

        String gate = Optional.ofNullable(request.gate())
                .map(String::trim)
                .filter(gateValue -> !gateValue.isEmpty())
                .orElse("Main Gate");

        LocalDateTime scannedAt = LocalDateTime.now();

        Optional<TicketEntity> ticketOptional = ticketRepository.findByQrCode(qrCode);
        if (ticketOptional.isEmpty()) {
            return new TicketScanResponse(
                    "invalid",
                    "No ticket matches the scanned code.",
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    gate,
                    0,
                    false,
                    scannedAt,
                    null
            );
        }

        TicketEntity ticket = ticketOptional.get();

        boolean alreadyCheckedIn = Optional.ofNullable(ticket.getStatus())
                .map(status -> status.equalsIgnoreCase("CHECKED_IN") || status.equalsIgnoreCase("USED"))
                .orElse(false);

        AttendanceLogEntity latestLog = attendanceLogRepository
                .findTopByTicket_TicketIDOrderByStartTimeDesc(ticket.getTicketID())
                .orElse(null);

        AttendanceLogEntity logEntry = new AttendanceLogEntity();
        logEntry.setTicket(ticket);
        logEntry.setEvent(ticket.getEvent());
        logEntry.setUser(ticket.getUser());
        logEntry.setStartTime(scannedAt);
        logEntry.setGate(gate);

        int reEntryCount;
        String status;
        String message;

        if (alreadyCheckedIn) {
            status = "duplicate";
            message = "Ticket was already checked in.";
            int previousReEntry = Optional.ofNullable(latestLog)
                    .map(AttendanceLogEntity::getReEntry)
                    .orElse(0);
            reEntryCount = previousReEntry + 1;
            logEntry.setStatus("duplicate");
            logEntry.setReEntry(reEntryCount);
        } else {
            status = "valid";
            message = "Ticket verified successfully.";
            reEntryCount = 0;
            logEntry.setStatus("valid");
            logEntry.setReEntry(reEntryCount);
            ticket.setStatus("CHECKED_IN");
            ticketRepository.save(ticket);
        }

        attendanceLogRepository.save(logEntry);

        return new TicketScanResponse(
                status,
                message,
                ticket.getTicketID(),
                ticket.getEvent().getEventID(),
                formatTicketNumber(ticket),
                ticket.getUser().getName(),
                ticket.getUser().getEmail(),
                ticket.getEvent().getName(),
                ticket.getEvent().getStartDate(),
                ticket.getEvent().getEndDate(),
                gate,
                reEntryCount,
                alreadyCheckedIn,
                scannedAt,
                Optional.ofNullable(latestLog).map(AttendanceLogEntity::getStartTime).orElse(null)
        );
    }

    private String formatTicketNumber(TicketEntity ticket) {
        if (ticket == null || ticket.getTicketID() == null) {
            return "";
        }
        String prefix = Objects.toString(ticket.getTicketType(), "TICKET");
        return "%s-%06d".formatted(prefix.replaceAll("\\s+", "").toUpperCase(), ticket.getTicketID());
    }
}
