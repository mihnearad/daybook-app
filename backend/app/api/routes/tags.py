from typing import List

from app.models.database import Tag as TagModel
from app.models.database import get_db
from app.schemas import Tag, TagCreate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/tags", tags=["tags"])


@router.get("/", response_model=List[Tag])
def get_all_tags(db: Session = Depends(get_db)):
    """Get all tags"""
    tags = db.query(TagModel).order_by(TagModel.name).all()
    return tags


@router.post("/", response_model=Tag, status_code=status.HTTP_201_CREATED)
def create_tag(tag_data: TagCreate, db: Session = Depends(get_db)):
    """Create a new tag"""
    # Check if tag already exists
    existing_tag = db.query(TagModel).filter(TagModel.name == tag_data.name).first()
    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tag '{tag_data.name}' already exists",
        )

    tag = TagModel(name=tag_data.name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    """Delete a tag"""
    tag = db.query(TagModel).filter(TagModel.id == tag_id).first()
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag with id {tag_id} not found",
        )

    db.delete(tag)
    db.commit()
    return None
