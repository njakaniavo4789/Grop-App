"""
Modèle de prédiction de rendement pour la riziculture malgache.

Features d'entrée :
- region         : région Madagascar (one-hot encodé)
- altitude_m     : altitude en mètres
- area_hectares  : surface
- soil_type      : type de sol (one-hot)
- irrigation     : culture irriguée ou pluviale (bool)
- sri_method     : utilisation de la méthode SRI (bool)
- rainfall_mm    : pluviométrie annuelle (mm)
- temp_avg_c     : température moyenne (°C)
- n_fertilizer   : azote appliqué (kg/ha)
- p_fertilizer   : phosphore appliqué (kg/ha)

Sortie : rendement prédit en kg/ha

En l'absence de données d'entraînement réelles, ce module retourne
des estimations basées sur des règles expertes calibrées sur les
statistiques FOFIFA/FAO pour Madagascar.
"""
import logging

logger = logging.getLogger(__name__)

# Moyennes de rendement par région/système (kg/ha) — source : MAEP/FAO 2022
BASELINE_YIELDS = {
    'irrigated': {
        'analamanga': 3800, 'vakinankaratra': 3500, 'alaotra_mangoro': 4200,
        'boeny': 3200, 'sofia': 2900, 'default': 3200,
    },
    'rainfed': {
        'analamanga': 2200, 'vakinankaratra': 2000, 'alaotra_mangoro': 2500,
        'boeny': 1800, 'sofia': 1600, 'default': 2000,
    },
}

# Multiplicateurs selon le type de sol
SOIL_MULTIPLIERS = {
    'alluvial': 1.15,
    'volcanic': 1.10,
    'clay': 1.05,
    'loam': 1.08,
    'laterite': 0.90,
    'sandy': 0.80,
}

# Multiplicateur SRI
SRI_MULTIPLIER = 1.60  # Gain moyen documenté avec SRI à Madagascar


def predict(features: dict) -> dict:
    """
    Retourne une prédiction de rendement riz basée sur des règles expertes.
    À remplacer par un modèle XGBoost entraîné dès que les données sont disponibles.

    Args:
        features: dict avec les clés décrites en en-tête de module

    Returns:
        dict { predicted_yield_kg_ha, confidence_score, feature_importance, recommendation }
    """
    region = features.get('region', 'default')
    irrigation = bool(features.get('irrigation', False))
    sri_method = bool(features.get('sri_method', False))
    soil_type = features.get('soil_type', 'laterite')
    rainfall_mm = features.get('rainfall_mm', 1200)
    n_fertilizer = features.get('n_fertilizer', 0)

    # 1. Rendement de base selon région et système d'irrigation
    system = 'irrigated' if irrigation else 'rainfed'
    baselines = BASELINE_YIELDS[system]
    base_yield = baselines.get(region, baselines['default'])

    # 2. Ajustement sol
    soil_mult = SOIL_MULTIPLIERS.get(soil_type, 1.0)
    yield_estimate = base_yield * soil_mult

    # 3. Ajustement SRI
    if sri_method:
        yield_estimate *= SRI_MULTIPLIER

    # 4. Ajustement pluviométrie (pour culture pluviale)
    if not irrigation:
        if rainfall_mm < 800:
            yield_estimate *= 0.75
        elif rainfall_mm > 1500:
            yield_estimate *= 1.05

    # 5. Ajustement fertilisation azotée
    if n_fertilizer > 0:
        n_bonus = min(n_fertilizer / 100, 0.30)  # Max +30% pour N
        yield_estimate *= (1 + n_bonus)

    # Score de confiance (modèle expert = confiance modérée)
    confidence = 0.65 if not sri_method else 0.60  # SRI = plus de variabilité

    # Feature importance simplifiée
    feature_importance = {
        'irrigation_system': 0.35,
        'region': 0.20,
        'soil_type': 0.15,
        'sri_method': 0.12,
        'rainfall_mm': 0.10,
        'n_fertilizer': 0.08,
    }

    # Recommandations automatiques
    recommendations = _generate_recommendations(features, yield_estimate)

    return {
        'predicted_yield_kg_ha': round(yield_estimate, 1),
        'confidence_score': confidence,
        'feature_importance': feature_importance,
        'recommendation': recommendations,
        'model_type': 'expert_rules',  # Sera 'xgboost' après entraînement
    }


def _generate_recommendations(features: dict, yield_estimate: float) -> str:
    tips = []

    if not features.get('irrigation') and features.get('rainfall_mm', 1200) < 1000:
        tips.append(
            "Pluviométrie insuffisante détectée. Envisagez un système d'irrigation "
            "d'appoint pour sécuriser la culture."
        )

    if not features.get('sri_method'):
        tips.append(
            "L'adoption de la méthode SRI (Système de Riziculture Intensive) "
            "peut augmenter le rendement de 40-80% avec moins d'eau et de semences."
        )

    if features.get('soil_type') == 'laterite':
        tips.append(
            "Sol latéritique : apportez du compost organique (5-10 t/ha) pour améliorer "
            "la rétention d'eau et la fertilité."
        )

    if features.get('n_fertilizer', 0) < 30:
        tips.append(
            "La fertilisation azotée est faible. Une application de 60-90 kg N/ha en "
            "fractionné (tallage + initiation paniculaire) est recommandée."
        )

    if yield_estimate < 2000:
        tips.append(
            "Rendement prédit faible. Consultez un technicien MAEP local pour un "
            "diagnostic terrain et l'accès aux variétés améliorées FOFIFA."
        )

    return '\n'.join(f"• {t}" for t in tips) if tips else "Conditions favorables détectées."
