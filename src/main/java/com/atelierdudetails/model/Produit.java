package com.atelierdudetails.model;

public class Produit {

    private Long id;
    private String nom;
    private String categorie;   // "bracelet", "collier", "foulard"
    private double prix;
    private String description;
    private String image;
    private int stock;

    // Constructeur vide obligatoire pour que Jackson puisse désérialiser le JSON
    public Produit() {}

    // --- Getters ---

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getCategorie() {
        return categorie;
    }

    public double getPrix() {
        return prix;
    }

    public String getDescription() {
        return description;
    }

    public String getImage() {
        return image;
    }

    public int getStock() {
        return stock;
    }

    // --- Setters ---

    public void setId(Long id) {
        this.id = id;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public void setPrix(double prix) {
        this.prix = prix;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }
}
