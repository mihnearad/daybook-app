from datetime import datetime

from app.models.database import Note as NoteModel
from app.models.database import Tag as TagModel
from app.models.database import get_db
from app.schemas import ExportData, ExportSelectedRequest
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/", response_model=ExportData)
def export_all_data(db: Session = Depends(get_db)):
    """
    Export all notes and tags as JSON.
    This can be used for backup or data portability.
    """
    notes = db.query(NoteModel).order_by(NoteModel.date).all()
    tags = db.query(TagModel).order_by(TagModel.name).all()

    export_data = ExportData(notes=notes, tags=tags, exported_at=datetime.utcnow())

    return export_data


@router.get("/markdown")
def export_as_markdown(db: Session = Depends(get_db)):
    """
    Export all notes as a single markdown file.
    """
    notes = db.query(NoteModel).order_by(NoteModel.date).all()

    markdown_content = "# DayBook Export\n\n"
    markdown_content += (
        f"Exported on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC\n\n"
    )
    markdown_content += "---\n\n"

    for note in notes:
        markdown_content += f"## {note.date.strftime('%Y-%m-%d')}\n\n"

        if note.tags:
            tags_str = ", ".join([f"#{tag.name}" for tag in note.tags])
            markdown_content += f"**Tags:** {tags_str}\n\n"

        markdown_content += f"{note.content}\n\n"
        markdown_content += "---\n\n"

    return JSONResponse(
        content={
            "filename": f"daybook_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.md",
            "content": markdown_content,
        }
    )


@router.post("/markdown/selected")
def export_selected_as_markdown(
    request: ExportSelectedRequest, db: Session = Depends(get_db)
):
    """
    Export selected notes as a single markdown file.
    Accepts a list of date strings and returns only those notes.
    """
    from datetime import datetime as dt

    # Convert date strings to date objects and query
    notes = (
        db.query(NoteModel)
        .filter(NoteModel.date.in_([dt.strptime(d, "%Y-%m-%d").date() for d in request.dates]))
        .order_by(NoteModel.date)
        .all()
    )

    markdown_content = "# DayBook Export (Selected Notes)\n\n"
    markdown_content += (
        f"Exported on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC\n\n"
    )
    markdown_content += f"**Number of notes:** {len(notes)}\n\n"
    markdown_content += "---\n\n"

    for note in notes:
        markdown_content += f"## {note.date.strftime('%Y-%m-%d')}\n\n"

        if note.tags:
            tags_str = ", ".join([f"#{tag.name}" for tag in note.tags])
            markdown_content += f"**Tags:** {tags_str}\n\n"

        markdown_content += f"{note.content}\n\n"
        markdown_content += "---\n\n"

    return JSONResponse(
        content={
            "filename": f"daybook_selected_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.md",
            "content": markdown_content,
        }
    )
