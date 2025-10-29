package com.carrie.hazellabev2.entities;

import java.time.LocalDateTime;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // 👈 importante también aquí
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String batchCode;
    private String description;
    private String chemCode;
    private Date expDate;
    private Date elabDate;
    private int cost;
    private int stock;
    private int stockCritico;
    private String proveedor;

    @ManyToOne(fetch = jakarta.persistence.FetchType.EAGER)
    @JoinColumn(name = "categoria_id")
    private Categoria category;

    private String image;
    private Boolean activeStatus;
    private LocalDateTime creationDate;
    private Boolean destacado = false;
}
