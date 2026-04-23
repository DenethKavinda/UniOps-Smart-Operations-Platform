package com.campus.incident;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentAttachmentRepository extends JpaRepository<IncidentAttachment, Long> {

    long countByIncidentTicketId(Long incidentTicketId);

    List<IncidentAttachment> findByIncidentTicketIdOrderByCreatedAtAsc(Long incidentTicketId);
}
