# Ontology README / Index

## Overview

This modular OWL ontology for Madagascar agriculture integrates genealogical relations for tracking crop varieties and livestock pedigrees.

## File Structure

```
Ontology made by IA/
├── agri-core.ttl              # Core ontology with bridge axioms
├── agri-crops.ttl             # Crops module (Cereals, Legumes, Fruits, Vegetables, Root Crops, Cash Crops)
├── agri-practices.ttl         # Agricultural practices (Irrigation, Fertilization, Pest Management, etc.)
├── agri-resources.ttl         # Agricultural resources (Land, Soil, Water, Climate, Tools)
├── agri-outputs.ttl           # Agricultural outputs (Food Products, Fibers, Biofuels, Animal Products)
├── agri-livestock.ttl         # Livestock module (Cattle, Zebu, Poultry, Small Ruminants)
├── gen-genealogy.ttl          # Genealogical relations (hasParent, isHybridOf, descendsFrom, etc.)
├── agri-examples.ttl          # Example individuals demonstrating genealogical links
├── agriculture-ontology.owl   # Main OWL/XML file for Protégé import
└── agriculture-ontology-complete.ttl  # Complete Turtle file for visualization
```

## Namespace Prefixes

| Prefix | Namespace |
|--------|----------|
| agri: | http://example.org/agri/ |
| gen: | http://example.org/gen/ |
| agrovoc: | http://aims.fao.org/aos/agrovoc/ |
| foaf: | http://xmlns.com/foaf/0.1/ |
| crm: | http://www.cidoc-crm.org/cidoc-crm/ |

## Loading into Protégé

1. Open Protégé
2. Go to File > Import
3. Select `agriculture-ontology.owl` (OWL/XML format recommended)
4. Or import individual Turtle modules as needed

## External Vocabulary Alignment

- **AGROVOC**: Reused for agricultural terms (crops, practices, resources)
- **FOAF**: Reused for agent/person relations
- **CIDOC CRM**: Reused for historical/activity relations

## Key Genealogical Relations

```
gen:hasParent    → Direct parent relationship
gen:hasOffspring → Direct child relationship  
gen:hasFather    → Male parent
gen:hasMother    → Female parent
gen:isHybridOf   → Parentage for hybrids (minimum 2 parents)
gen:descendsFrom → Ancestral lineage (transitive)
```

## Example Lineages

### Rice Hybrid Lineage
```
Fiaramanitra-Rice (Gen 2)
  ├── isHybridOf: Bemasoha-Rice (Gen 1)
  │     ├── isHybridOf: Makalioka-Variety
  │     └── isHybridOf: Tsipory-Variety
  └── isHybridOf: Tsipory-Variety
```

### Zebu Crossbred Pedigree
```
Fahavalon-002 (Gen 2)
  ├── hasFather: ToamasinaBull-001
  └── hasMother: MahazoRaha-Crossbred1 (Gen 1)
        ├── hasFather: ToamasinaBull-001
        └── hasMother: AntsirabeCow-001
```

## Bilingual Labels

All classes and properties have bilingual labels:
- English (@en)
- French (@fr)
- Malagasy (@mg) where applicable

## Extension Points

The ontology can be extended by:
1. Adding new crop varieties
2. Adding new livestock breeds
3. Creating regional variants
4. Adding more specific practices
5. Linking to GeoNames for location data
6. Integrating with crop trait ontologies (TO-AD)

## Contact

Developed for Madagascar agricultural research.
