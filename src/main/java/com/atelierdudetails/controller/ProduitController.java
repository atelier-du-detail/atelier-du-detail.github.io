package com.atelierdudetails.controller;

import com.atelierdudetails.model.Produit;
import com.atelierdudetails.service.ProduitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// @RestController = chaque méthode retourne automatiquement du JSON
@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    // Injection par constructeur (bonne pratique Spring)
    private final ProduitService produitService;

    public ProduitController(ProduitService produitService) {
        this.produitService = produitService;
    }

    // GET /api/produits
    @GetMapping
    public List<Produit> getTousProduits() {
        return produitService.getTousProduits();
    }

    // GET /api/produits/1
    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Long id) {
        Optional<Produit> produit = produitService.getProduitById(id);
        if (produit.isPresent()) {
            return ResponseEntity.ok(produit.get());
        }
        return ResponseEntity.notFound().build();
    }

    // GET /api/produits/categorie/bracelet
    @GetMapping("/categorie/{categorie}")
    public List<Produit> getProduitsByCategorie(@PathVariable String categorie) {
        return produitService.getProduitsByCategorie(categorie);
    }
}
