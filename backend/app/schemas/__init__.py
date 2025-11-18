from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class TagBase(BaseModel):
    name: str


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class NoteBase(BaseModel):
    date: date
    content: str = ""


class NoteCreate(NoteBase):
    tag_ids: List[int] = []


class NoteUpdate(BaseModel):
    content: Optional[str] = None
    tag_ids: Optional[List[int]] = None


class Note(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime
    tags: List[Tag] = []

    model_config = ConfigDict(from_attributes=True)


class SearchResult(BaseModel):
    notes: List[Note]
    total: int


class ExportData(BaseModel):
    notes: List[Note]
    tags: List[Tag]
    exported_at: datetime


class ExportSelectedRequest(BaseModel):
    dates: List[str]
