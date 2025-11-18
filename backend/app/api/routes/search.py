from typing import List, Optional

from app.models.database import Note as NoteModel
from app.models.database import get_db
from app.schemas import Note, SearchResult
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("/", response_model=SearchResult)
def search_notes(
    q: Optional[str] = Query(None, min_length=1, description="Search query"),
    tag_id: Optional[int] = Query(None, description="Filter by tag ID"),
    db: Session = Depends(get_db),
):
    """
    Search notes by content or filter by tag.
    Returns notes that match the search query and/or tag filter.
    """
    query = db.query(NoteModel)

    # Filter by tag if provided
    if tag_id:
        query = query.filter(NoteModel.tags.any(id=tag_id))

    # Search in content (case-insensitive)
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(NoteModel.content.ilike(search_pattern))

    # Get results ordered by date (newest first)
    notes = query.order_by(NoteModel.date.desc()).all()

    return SearchResult(notes=notes, total=len(notes))
