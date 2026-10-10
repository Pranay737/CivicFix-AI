package com.civicfix.repository;

import com.civicfix.domain.KnowledgeDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"chunks"})
    List<KnowledgeDocument> findAllByActiveTrue();
    Page<KnowledgeDocument> findAll(Pageable pageable);
}
