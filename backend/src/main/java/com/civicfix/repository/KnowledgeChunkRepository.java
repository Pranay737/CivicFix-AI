package com.civicfix.repository;

import com.civicfix.domain.KnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, Long> {
    List<KnowledgeChunk> findByDocumentId(Long documentId);
    void deleteByDocumentId(Long documentId);

    @Query("SELECT c FROM KnowledgeChunk c JOIN c.document d WHERE d.active = true")
    List<KnowledgeChunk> findAllActiveChunks();
}
