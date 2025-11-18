from datetime import date
from typing import List

from app.models.database import Note as NoteModel
from app.models.database import Tag as TagModel
from app.models.database import get_db
from app.schemas import Note, NoteCreate, NoteUpdate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("/", response_model=List[Note])
def get_all_notes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all notes with pagination"""
    notes = (
        db.query(NoteModel)
        .order_by(NoteModel.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return notes


@router.get("/{note_date}", response_model=Note)
def get_note_by_date(note_date: date, db: Session = Depends(get_db)):
    """Get note for a specific date"""
    note = db.query(NoteModel).filter(NoteModel.date == note_date).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No note found for date {note_date}",
        )
    return note


@router.post("/", response_model=Note, status_code=status.HTTP_201_CREATED)
def create_note(note_data: NoteCreate, db: Session = Depends(get_db)):
    """Create a new note for a specific date"""
    # Check if note already exists for this date
    existing_note = db.query(NoteModel).filter(NoteModel.date == note_data.date).first()
    if existing_note:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Note already exists for date {note_data.date}",
        )

    # Create note
    note = NoteModel(date=note_data.date, content=note_data.content)

    # Add tags if provided
    if note_data.tag_ids:
        tags = db.query(TagModel).filter(TagModel.id.in_(note_data.tag_ids)).all()
        note.tags = tags

    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{note_date}", response_model=Note)
def update_note(
    note_date: date, note_update: NoteUpdate, db: Session = Depends(get_db)
):
    """Update an existing note"""
    note = db.query(NoteModel).filter(NoteModel.date == note_date).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No note found for date {note_date}",
        )

    # Update content if provided
    if note_update.content is not None:
        note.content = note_update.content

    # Update tags if provided
    if note_update.tag_ids is not None:
        tags = db.query(TagModel).filter(TagModel.id.in_(note_update.tag_ids)).all()
        note.tags = tags

    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_date}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_date: date, db: Session = Depends(get_db)):
    """Delete a note"""
    note = db.query(NoteModel).filter(NoteModel.date == note_date).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No note found for date {note_date}",
        )

    db.delete(note)
    db.commit()
    return None
