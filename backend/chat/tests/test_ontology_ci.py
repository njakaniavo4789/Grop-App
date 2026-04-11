"""Tests pytest de l'ontologie RDF — version CI de test_ontology.py.

Ces tests vérifient le graphe RDF, les keywords domaine, le mapping
classe→tag et le système de pedigree des variétés de riz.
"""
import pytest


class TestOntologyGraph:
    def test_graph_loads(self):
        """Le graphe RDF doit se charger et contenir plus de 1000 triplets."""
        from rag.ontology_graph import get_graph
        g = get_graph()
        assert g is not None
        assert len(g) > 1000, f"Seulement {len(g)} triplets — graphe incomplet ?"

    def test_domain_keywords_french_present(self):
        """Les keywords français doivent être présents et suffisamment nombreux."""
        from rag.ontology_graph import get_domain_keywords
        kw = get_domain_keywords()
        assert 'fr' in kw
        assert len(kw['fr']) > 50, f"Seulement {len(kw['fr'])} keywords FR"

    def test_domain_keywords_malagasy_present(self):
        """Les keywords malgaches doivent être présents."""
        from rag.ontology_graph import get_domain_keywords
        kw = get_domain_keywords()
        assert 'mg' in kw
        assert len(kw['mg']) > 20, f"Seulement {len(kw['mg'])} keywords MG"

    def test_domain_keywords_english_present(self):
        """Les keywords anglais doivent être présents."""
        from rag.ontology_graph import get_domain_keywords
        kw = get_domain_keywords()
        assert 'en' in kw
        assert len(kw['en']) > 50, f"Seulement {len(kw['en'])} keywords EN"

    @pytest.mark.parametrize("word", ["riz", "irrigation", "sol", "variété"])
    def test_expected_french_keywords(self, word):
        """Des mots agricoles fondamentaux doivent apparaître dans les keywords FR."""
        from rag.ontology_graph import get_domain_keywords
        kw = get_domain_keywords()
        found = any(word in label for label in kw.get('fr', []))
        assert found, f"Mot '{word}' absent des keywords FR"

    @pytest.mark.parametrize("label,expected_tag", [
        ("Bemasoha Rice Hybrid", "varieties"),
        ("Fiaramanitra Rice Hybrid", "varieties"),
        ("Makalioka Rice Variety", "varieties"),
    ])
    def test_class_tag_mapping(self, label, expected_tag):
        """Les classes variétales doivent être mappées au tag 'varieties'."""
        from rag.ontology_graph import get_class_tag
        tag = get_class_tag(label)
        assert tag == expected_tag, f"'{label}' → tag={tag}, attendu {expected_tag}"

    def test_pedigree_makalioka_found(self):
        """La variété Makalioka doit être trouvée dans le graphe."""
        from rag.ontology_graph import get_pedigree
        p = get_pedigree("Makalioka Rice Variety")
        assert p['found'] is True
        assert bool(p['pedigree_code'])

    def test_pedigree_bemasoha_is_hybrid_f1(self):
        """Bemasoha doit être un hybride F1 avec 2 parents développé par FOFIFA."""
        from rag.ontology_graph import get_pedigree
        p = get_pedigree("Bemasoha Rice Hybrid")
        assert p['is_hybrid'] is True
        assert len(p['parents']) == 2, f"Attendu 2 parents, obtenu {len(p['parents'])}"
        assert p['generation'] == 1, f"Attendu F1, obtenu F{p['generation']}"
        assert p['bred_by'] == 'FOFIFA'

    def test_pedigree_fiaramanitra_is_f2(self):
        """Fiaramanitra doit être un hybride F2."""
        from rag.ontology_graph import get_pedigree
        p = get_pedigree("Fiaramanitra Rice Hybrid")
        assert p['generation'] == 2, f"Attendu F2, obtenu F{p['generation']}"

    def test_pedigree_unknown_entity_returns_not_found(self):
        """Une entité inconnue doit retourner found=False sans exception."""
        from rag.ontology_graph import get_pedigree
        p = get_pedigree("VariétéInexistante123")
        assert p['found'] is False

    def test_related_concepts_not_empty(self):
        """get_related_concepts doit retourner des concepts pour une variété connue."""
        from rag.ontology_graph import get_related_concepts
        related = get_related_concepts("Makalioka Rice Variety")
        assert len(related) > 0, "Aucun concept lié trouvé pour Makalioka"

    def test_facts_block_contains_fofifa(self):
        """Le bloc de faits pour Bemasoha doit mentionner FOFIFA et les parents."""
        from rag.ontology_graph import get_facts_block
        facts = get_facts_block("Bemasoha Rice Hybrid")
        assert len(facts) > 50
        assert 'Parents' in facts
        assert 'FOFIFA' in facts
        assert 'pedigree' in facts.lower() or 'Pedigree' in facts
