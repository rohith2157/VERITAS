package com.veritas.backend.repository;

import com.veritas.backend.model.RubricRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RubricRuleRepository extends JpaRepository<RubricRule, Long> {
    List<RubricRule> findByAssignmentId(Long assignmentId);
}

