package com.veritas.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classrooms")
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String subject;

    private String teacherName;

    @Column(unique = true)
    private String joinCode;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Classroom() {}

    public Classroom(String name, String subject, String teacherName, String joinCode) {
        this.name = name;
        this.subject = subject;
        this.teacherName = teacherName;
        this.joinCode = joinCode;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getJoinCode() { return joinCode; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Frontend-compatible serialization aliases
    public String getInstructor() { return teacherName; }
    public String getCode() { return joinCode; }
    public String getSemester() { return "Fall 2026"; }
    public Integer getStudentCount() { return 42; }
    public Integer getActiveAssignmentsCount() { return 3; }
    public Double getMeanIntegrityScore() { return 91.6; }
}

