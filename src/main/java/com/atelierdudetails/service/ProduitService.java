package com.atelierdudetails.service;

import com.atelierdudetails.model.Produit;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProduitService {

    // La liste en mémoire — chargée une seule fois au démarrage
    private List<Produit> produits = new ArrayList<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    // @PostConstruct = exécuté automatiquement après que Spring ait créé ce service
    @PostConstruct
    public void chargerProduits() {
        try {
            // getResourceAsStream cherche dans src/main/resources/
            InputStream flux = getClass()
                    .getClassLoader()
                    .getResourceAsStream("data/produits.json");

            if (flux == null) {
                System.err.println("ERREUR : fichier data/produits.json introuvable !");
                return;
            }

            produits = objectMapper.readValue(flux, new TypeReference<List<Produit>>() {});
            System.out.println("[Atelier] " + produits.size() + " produits chargés.");

        } catch (Exception e) {
            System.err.println("[Atelier] Erreur lecture produits.json : " + e.getMessage());
        }
    }

    public List<Produit> getTousProduits() {
        return produits;
    }

    public Optional<Produit> getProduitById(Long id) {
        return produits.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst();
    }

    public List<Produit> getProduitsByCategorie(String categorie) {
        List<Produit> resultat = new ArrayList<>();
        for (Produit p : produits) {
            if (p.getCategorie().equalsIgnoreCase(categorie)) {
                resultat.add(p);
            }
        }
        return resultat;
    }
}
