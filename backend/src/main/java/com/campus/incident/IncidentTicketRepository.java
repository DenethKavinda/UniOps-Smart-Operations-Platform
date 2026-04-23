package com.campus.incident;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {

    long countByStatus(IncidentStatus status);

    List<IncidentTicket> findByCreatedByEmailIgnoreCaseOrderByCreatedAtDesc(String createdByEmail);

    List<IncidentTicket> findByAssignedToEmailIgnoreCaseOrderByCreatedAtDesc(String assignedToEmail);

    List<IncidentTicket> findAllByOrderByCreatedAtDesc();

    List<IncidentTicket> findTop5ByOrderByCreatedAtDesc();
}
