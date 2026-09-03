#!/usr/bin/env python3
"""Прайс-каталог PDF: обложка, разделы, таблица артикул / название / габариты / цена от."""

from __future__ import annotations

import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "src/data/catalog.json").read_text(encoding="utf-8"))
OUT = ROOT / "public/downloads/mebel-servis-katalog.pdf"
FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

INK = colors.HexColor("#161814")
MUTED = colors.HexColor("#6c7066")
COPPER = colors.HexColor("#c45c32")
LINE = colors.HexColor("#d2c9b4")
PAPER = colors.HexColor("#efe8d8")
WHITE = colors.HexColor("#faf7f0")
HEAD = colors.HexColor("#3a3d36")

pdfmetrics.registerFont(TTFont("Body", FONT))


def esc(value: object) -> str:
    text = "" if value is None else str(value)
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def money(n) -> str:
    if n is None:
        return "по запросу"
    return f"от {int(n):,}".replace(",", " ") + " ₽"


def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(MUTED)
    canvas.setFont("Body", 8)
    canvas.drawString(16 * mm, 10 * mm, "ООО «Мебель-Сервис» · Нижний Новгород · цены ориентировочные, опт — по запросу")
    canvas.drawRightString(doc.pagesize[0] - 16 * mm, 10 * mm, str(doc.page))
    canvas.restoreState()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    company = DATA["company"]
    categories = DATA["categories"]
    products = DATA["products"]
    by_cat = {c["id"]: [] for c in categories}
    for p in products:
        by_cat.setdefault(p["category"], []).append(p)

    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontName="Body",
        fontSize=26,
        leading=32,
        textColor=INK,
        alignment=TA_LEFT,
        spaceAfter=8,
    )
    kicker = ParagraphStyle(
        "Kicker",
        fontName="Body",
        fontSize=9,
        textColor=COPPER,
        letterSpacing=1.2,
        spaceAfter=10,
    )
    lead = ParagraphStyle(
        "Lead",
        fontName="Body",
        fontSize=11,
        leading=16,
        textColor=HEAD,
        spaceAfter=6,
    )
    h1 = ParagraphStyle(
        "Sec",
        fontName="Body",
        fontSize=14,
        leading=18,
        textColor=INK,
        spaceBefore=4,
        spaceAfter=8,
    )
    cell = ParagraphStyle(
        "Cell",
        fontName="Body",
        fontSize=8,
        leading=11,
        textColor=INK,
    )
    cell_r = ParagraphStyle("CellR", parent=cell, alignment=TA_RIGHT)
    th = ParagraphStyle("Th", parent=cell, textColor=WHITE, fontName="Body")
    th_r = ParagraphStyle("ThR", parent=th, alignment=TA_RIGHT)
    note = ParagraphStyle("Note", parent=lead, fontSize=8, textColor=MUTED)

    story = [
        Paragraph("КАТАЛОГ · ПРАЙС", kicker),
        Paragraph("Мебель-Сервис", title),
        Paragraph(
            "Металлическая и корпусная мебель для объектов: казармы, общежития, "
            "образование, гостиницы, производство. Собственное производство в Нижнем Новгороде, более 4 000 м².",
            lead,
        ),
        Spacer(1, 8),
        Paragraph(esc(company["legal"]), lead),
        Paragraph(esc(company["address"]), lead),
        Paragraph(" · ".join(esc(p) for p in company["phones"]), lead),
        Paragraph(esc(company["email"]), lead),
        Paragraph(f"ИНН {esc(company['inn'])} · ОГРН {esc(company['ogrn'])}", note),
        Spacer(1, 14),
        Paragraph(
            f"В каталоге {len(products)} позиций в {len(categories)} разделах. "
            "Цены указаны «от» и ориентировочные; для оптовой партии готовим коммерческое предложение.",
            lead,
        ),
        Spacer(1, 10),
    ]

    toc_rows = [[
        Paragraph("Раздел", th),
        Paragraph("Позиций", th_r),
    ]]
    for c in categories:
        toc_rows.append([
            Paragraph(esc(c["name"]), cell),
            Paragraph(str(len(by_cat.get(c["id"], []))), cell_r),
        ])
    toc = Table(toc_rows, colWidths=[210 * mm, 40 * mm], repeatRows=1)
    toc.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COPPER),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.3, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
    ]))
    story.append(toc)
    story.append(PageBreak())

    page_w = landscape(A4)[0]
    usable = page_w - 32 * mm
    cols = [28 * mm, 92 * mm, 48 * mm, 52 * mm, 30 * mm]

    for c in categories:
        items = by_cat.get(c["id"], [])
        if not items:
            continue
        story.append(Paragraph(esc(c["name"]), h1))
        story.append(Paragraph(esc(c.get("text") or ""), note))
        rows = [[
            Paragraph("Артикул", th),
            Paragraph("Название", th),
            Paragraph("Габариты, мм", th),
            Paragraph("Материал", th),
            Paragraph("Цена", th_r),
        ]]
        for p in items:
            rows.append([
                Paragraph(esc(p.get("sku") or "—"), cell),
                Paragraph(esc(p.get("name") or "—"), cell),
                Paragraph(esc(p.get("sizes") or "—"), cell),
                Paragraph(esc((p.get("material") or "—")[:80]), cell),
                Paragraph(money(p.get("price")), cell_r),
            ])
        table = Table(rows, colWidths=cols, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("GRID", (0, 0), (-1, -1), 0.25, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER]),
        ]))
        story.append(table)
        story.append(Spacer(1, 12))

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=landscape(A4),
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=16 * mm,
        title="Каталог Мебель-Сервис",
        author=company["legal"],
    )
    doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
