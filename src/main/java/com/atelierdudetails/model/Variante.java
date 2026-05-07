package com.atelierdudetails.model;

public class Variante {

    private String nom;
    private String couleur; // code hexadecimal type "#d4af37"
    private int stock;

    public Variante() {}

    public String getNom() {
        return nom;
    }

    public String getCouleur() {
        return couleur;
    }

    public int getStock() {
        return stock;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setCouleur(String couleur) {
        this.couleur = couleur;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }
}
