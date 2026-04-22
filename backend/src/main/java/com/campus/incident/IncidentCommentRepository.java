package com.campus.incident;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentCommentRepository extends JpaRepository<IncidentComment, Long> {

    List<IncidentComment> findByIncidentTicketIdOrderByCreatedAtAsc(Long incidentTicketId);
}
