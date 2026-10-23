"""PubChem PUG REST & PUG-View API Connector.

Provides methods for resolving compounds, fetching properties,
safety data, pharmacology, similarity/substructure search,
bioassay data, and 2D structure images.
"""

import json
import time
from pathlib import Path
from typing import Any

import requests

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_PUG_REST_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
_PUG_VIEW_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view"
_IMAGE_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid"
_RATE_LIMIT_DELAY_S = 0.25  # PubChem allows ~5 req/sec
_MAX_RETRIES = 3


class PubChemConnector:
    """Connector for PubChem PUG REST and PUG-View APIs.

    Usage:
        connector = PubChemConnector()
        cid_data = connector.resolve(name="aspirin")
        props = connector.get_properties(cid=2244)
        similar = connector.similarity_search(smiles="CC(=O)OC1=CC=CC=C1C(=O)O")
    """

    def __init__(self) -> None:
        self._session = requests.Session()
        self._session.headers.update({
            "User-Agent": "AIStudio-ScienceGallery-PubChemSearch/1.0",
            "Accept": "application/json",
        })
        self._last_request_time = 0.0

    def _throttle(self) -> None:
        elapsed = time.monotonic() - self._last_request_time
        if elapsed < _RATE_LIMIT_DELAY_S:
            time.sleep(_RATE_LIMIT_DELAY_S - elapsed)
        self._last_request_time = time.monotonic()

    def _get(self, url: str, params: dict | None = None) -> Any:
        for attempt in range(1, _MAX_RETRIES + 1):
            self._throttle()
            try:
                resp = self._session.get(url, params=params, timeout=60)
                if resp.status_code == 429:
                    time.sleep(2 ** attempt)
                    continue
                resp.raise_for_status()
                return resp.json()
            except requests.exceptions.RequestException:
                if attempt == _MAX_RETRIES:
                    raise
                time.sleep(2 ** attempt)
        raise RuntimeError("Max retries exhausted")

    # ------------------------------------------------------------------
    # Compound Resolution
    # ------------------------------------------------------------------

    def resolve(
        self, name: str | None = None, inchi: str | None = None
    ) -> dict[str, Any]:
        """Resolve a chemical name or InChI to CID, SMILES, InChIKey.

        Args:
            name: Chemical or trade name.
            inchi: InChI string.

        Returns:
            Dict with cid, canonical_smiles, inchikey, iupac_name.
        """
        if name:
            url = f"{_PUG_REST_BASE}/compound/name/{requests.utils.quote(name)}/property/MolecularFormula,CanonicalSMILES,InChIKey,IUPACName/JSON"
        elif inchi:
            url = f"{_PUG_REST_BASE}/compound/inchi/property/MolecularFormula,CanonicalSMILES,InChIKey,IUPACName/JSON"
            return self._get(url, params={"inchi": inchi})
        else:
            raise ValueError("Provide either name or inchi")
        return self._get(url)

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    def get_properties(self, cid: int) -> dict[str, Any]:
        """Fetch computed properties for a compound.

        Returns: MW, XLogP, TPSA, HBD, HBA, rotatable bonds, complexity, etc.
        """
        props = "MolecularWeight,MolecularFormula,CanonicalSMILES,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,HeavyAtomCount,Complexity,ExactMass,MonoisotopicMass,Charge"
        url = f"{_PUG_REST_BASE}/compound/cid/{cid}/property/{props}/JSON"
        return self._get(url)

    def get_synonyms(self, cid: int) -> dict[str, Any]:
        """Fetch synonyms and trade names."""
        url = f"{_PUG_REST_BASE}/compound/cid/{cid}/synonyms/JSON"
        return self._get(url)

    # ------------------------------------------------------------------
    # Safety & Pharmacology (PUG-View)
    # ------------------------------------------------------------------

    def get_safety(self, cid: int) -> dict[str, Any]:
        """Retrieve GHS hazard statements and safety data."""
        url = f"{_PUG_VIEW_BASE}/data/compound/{cid}/JSON"
        return self._get(url, params={"heading": "Safety and Hazards"})

    def get_pharmacology(self, cid: int) -> dict[str, Any]:
        """Fetch FDA pharmacology, mechanism of action, therapeutic uses."""
        url = f"{_PUG_VIEW_BASE}/data/compound/{cid}/JSON"
        return self._get(url, params={"heading": "Pharmacology and Biochemistry"})

    def get_view_heading(self, cid: int, heading: str) -> dict[str, Any]:
        """Retrieve any specific heading from PUG-View."""
        url = f"{_PUG_VIEW_BASE}/data/compound/{cid}/JSON"
        return self._get(url, params={"heading": heading})

    # ------------------------------------------------------------------
    # Structure Images
    # ------------------------------------------------------------------

    def get_image_url(self, cid: int, size: int = 300) -> str:
        """Return the URL for a 2D structure image."""
        return f"{_IMAGE_BASE}/{cid}/PNG?image_size={size}x{size}"

    # ------------------------------------------------------------------
    # Structure Searches
    # ------------------------------------------------------------------

    def similarity_search(
        self, smiles: str, threshold: float = 0.8, max_results: int = 20
    ) -> dict[str, Any]:
        """Find structurally similar compounds via Tanimoto similarity."""
        url = (
            f"{_PUG_REST_BASE}/compound/similarity/smiles/"
            f"{requests.utils.quote(smiles)}/JSON"
        )
        return self._get(url, params={
            "Threshold": int(threshold * 100),
            "MaxRecords": max_results,
        })

    def substructure_search(
        self, smiles: str, max_results: int = 20
    ) -> dict[str, Any]:
        """Find compounds containing a specific substructure."""
        url = (
            f"{_PUG_REST_BASE}/compound/substructure/smiles/"
            f"{requests.utils.quote(smiles)}/JSON"
        )
        return self._get(url, params={"MaxRecords": max_results})

    # ------------------------------------------------------------------
    # BioAssays
    # ------------------------------------------------------------------

    def get_assays(self, cid: int) -> dict[str, Any]:
        """Retrieve bioassay and target interaction data."""
        url = f"{_PUG_REST_BASE}/compound/cid/{cid}/assaysummary/JSON"
        return self._get(url)

    # ------------------------------------------------------------------
    # Cross-references
    # ------------------------------------------------------------------

    def get_xrefs(self, cid: int, xref_type: str) -> dict[str, Any]:
        """Fetch cross-reference identifiers (PatentID, PubMedID, etc.)."""
        url = f"{_PUG_REST_BASE}/compound/cid/{cid}/xrefs/{xref_type}/JSON"
        return self._get(url)

    # ------------------------------------------------------------------
    # Property Range Search
    # ------------------------------------------------------------------

    def range_search(
        self, feature: str, min_val: float, max_val: float
    ) -> dict[str, Any]:
        """Find CIDs within a property range."""
        url = f"{_PUG_REST_BASE}/compound/fastsearch/property/{feature}/JSON"
        return self._get(url, params={
            "RangeMin": min_val,
            "RangeMax": max_val,
        })
