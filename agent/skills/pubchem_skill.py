"""PubChem Skill for Managed Agent.

Handles querying properties, finding similar compounds, retrieving safety data, etc.
"""

from agent.connectors.pubchem_api import PubChemConnector

connector = PubChemConnector()

def get_compound_properties(name: str) -> dict:
    """Gets properties of a compound by name."""
    try:
        resolved = connector.resolve(name=name)
        cid = resolved["PropertyTable"]["Properties"][0]["CID"]
        props = connector.get_properties(cid)
        return {"cid": cid, "properties": props}
    except Exception as e:
        return {"error": str(e)}

def find_similar_compounds(smiles: str, threshold: float = 0.8) -> dict:
    """Finds compounds similar to the given SMILES string."""
    try:
        return connector.similarity_search(smiles=smiles, threshold=threshold)
    except Exception as e:
        return {"error": str(e)}

def get_compound_safety(name: str) -> dict:
    """Retrieves safety and hazard data for a compound."""
    try:
        resolved = connector.resolve(name=name)
        cid = resolved["PropertyTable"]["Properties"][0]["CID"]
        safety = connector.get_safety(cid)
        return {"cid": cid, "safety": safety}
    except Exception as e:
        return {"error": str(e)}

def search_compounds_by_property_range(property_name: str, min_val: float, max_val: float) -> dict:
    """Searches for compounds within a property range."""
    try:
        return connector.range_search(feature=property_name, min_val=min_val, max_val=max_val)
    except Exception as e:
        return {"error": str(e)}
