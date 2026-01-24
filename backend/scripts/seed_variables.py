
from sqlalchemy.orm import Session
from app.models.dictionary import Modalite, Variable, VariableDataType


def init_variables(db: Session):
    """
    Initialise les variables du dictionnaire de données.
    """
    # Vérifier si les variables existent déjà
    var_age_exists = db.query(Variable).filter(Variable.slug == "age").first()
    var_sexe_exists = db.query(Variable).filter(Variable.slug == "sexe").first()
    
    if not var_age_exists and not var_sexe_exists:
        print("Création des variables du dictionnaire...")
        
        # 1. Variable Age (Numérique)
        var_age = Variable(
            slug="age", 
            label="Âge du répondant", 
            data_type=VariableDataType.NUMBER,
            is_quota=True,
            ui_config={"min": 18, "max": 99}
        )

        # 2. Variable Sexe (Liste)
        var_sexe = Variable(
            slug="sexe", 
            label="Sexe", 
            data_type=VariableDataType.LIST,
            is_quota=True
        )

        db.add(var_age)
        db.add(var_sexe)
        db.commit()

        # Modalités Sexe
        db.add_all([
            Modalite(variable_id=var_sexe.id, value="1", label="Masculin"),
            Modalite(variable_id=var_sexe.id, value="2", label="Féminin")
        ])
        db.commit()
        
        print("Variables créées !")
    else:
        print("Les variables existent déjà. Rien à faire.")
