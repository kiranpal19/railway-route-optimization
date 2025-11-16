from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from pathlib import Path

# Configuration
TITLE = "RAILWAY ROUTE OPTIMIZING SYSTEM"
COLLEGE = "GURU TEGH BAHADUR 4TH CENTENARY ENGINEERING COLLEGE\nG-8 AREA, RAJOURI GARDEN, NEW DELHI – 11064"
STUDENT_NAME = "Kiranpal Kaur"
ROLL_NO = "09123802723"
HOD = "S. Pradeep Singh"
MENTOR = "Ms. Shraddha Kumar"
DEGREE = "Bachelor of Technology in Computer Science & Engineering"
BATCH = "2023 – 2027"
DATE = "06/11/2025"
PLACE = "New Delhi"

OUT_DIR = Path("report")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_PATH = OUT_DIR / "Route_Optimizing_System_Report.docx"


def add_run_u_bold(paragraph, text):
    run = paragraph.add_run(text)
    run.font.bold = True
    # underline
    r = run._r
    u = OxmlElement('w:u')
    u.set(qn('w:val'), 'single')
    r.rPr.append(u)


def add_title_page(doc: Document):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(COLLEGE)
    run.bold = True
    run.font.size = Pt(13)

    doc.add_paragraph().add_run("")
    doc.add_paragraph().add_run("")

    # Logo placeholder
    ph = doc.add_paragraph("[Insert College Logo Here]")
    ph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph().add_run("")

    q = doc.add_paragraph()
    q.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run_u_bold(q, "Project Report")
    doc.add_paragraph().add_run("")
    q2 = doc.add_paragraph()
    q2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run_u_bold(q2, "On")

    q3 = doc.add_paragraph()
    q3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_run_u_bold(q3, TITLE)

    for _ in range(2):
        doc.add_paragraph().add_run("")

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p2.add_run(DEGREE)
    run.font.size = Pt(12)

    p3 = doc.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p3.add_run(BATCH)

    for _ in range(2):
        doc.add_paragraph().add_run("")

    p4 = doc.add_paragraph()
    p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p4.add_run(f"Submitted by: ").bold = True
    add_run_u_bold(p4, STUDENT_NAME)
    p4.add_run("\nEnrollment no.: ")
    p4.add_run(ROLL_NO)

    for _ in range(1):
        doc.add_paragraph().add_run("")

    # HOD/Mentor row
    row = doc.add_paragraph()
    row.alignment = WD_ALIGN_PARAGRAPH.CENTER
    row.add_run("HOD (CSE DEPARTMENT):    ")
    row.add_run("MENTOR:")
    row2 = doc.add_paragraph()
    row2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    row2.add_run(HOD + "                ")
    row2.add_run(MENTOR)

    doc.add_page_break()


def add_acknowledgement(doc: Document):
    doc.add_heading('ACKNOWLEDGEMENT', level=1)
    body = (
        "I would like to acknowledge the contributions of the following people, without whose help and guidance this report would not have been completed. "
        "I acknowledge the support of our teacher Ms. Shraddha Kumar (Professor), with respect and gratitude, whose expertise, guidance, support, encouragement, and enthusiasm have made this report possible.\n\n"
        "Their feedback vastly improved the quality of this report and provided an enthralling experience.\n\n"
        "I am indeed proud and fortunate to be supervised by her.\n\n"
        "I am thankful to Prof. Pardeep Singh (H.O.D. CSE department), Guru Tegh Bahadur 4th Centenary Engineering College New Delhi for his constant encouragement, valuable suggestions, and moral support and blessings.\n\n"
        "I shall remain indebted to the faculty and staff members of Guru Tegh Bahadur 4th Centenary Engineering College, New Delhi."
    )
    doc.add_paragraph(body)

    # Submitted blocks
    table = doc.add_table(rows=2, cols=2)
    table.style = 'Table Grid'
    table.autofit = True
    table.cell(0,0).text = "Submitted By-"
    table.cell(0,1).text = "Submitted To-"
    table.cell(1,0).text = f"{STUDENT_NAME}\nRoll No. {ROLL_NO}"
    table.cell(1,1).text = f"{MENTOR}"
    doc.add_page_break()


def add_declaration(doc: Document):
    doc.add_heading('DECLARATION', level=1)
    p = doc.add_paragraph(
        "I hereby declare that the minor project entitled \"RAILWAY ROUTE OPTIMIZING SYSTEM\" submitted to Guru Tegh Bahadur 4th Centenary Engineering College, in partial fulfilment of the requirements for the award of the degree of Bachelor of Engineering in Computer Science and Engineering, is an authentic record of my own work carried out during the academic session 2023–2027 under the supervision of Ms. Shraddha Kumar (Professor).\n\n"
        "I further declare that this project report has not been submitted to any other university or institution for the award of any degree or diploma, and all sources of information used have been duly acknowledged in the report."
    )
    doc.add_paragraph(f"Name of the Student: {STUDENT_NAME}")
    doc.add_paragraph(f"Roll No.: {ROLL_NO}")
    doc.add_paragraph(f"Date: {DATE}")
    doc.add_paragraph(f"Place: {PLACE}")
    doc.add_paragraph("\n_______________________________\n")
    doc.add_page_break()


def add_toc_placeholder(doc: Document):
    doc.add_heading('TABLE OF CONTENTS', level=1)
    doc.add_paragraph('[Insert Table of Contents here: In Word, References > Table of Contents > Automatic]')
    doc.add_page_break()


def add_section(doc: Document, title: str, paragraphs: int = 6, placeholders: bool = False):
    doc.add_heading(title, level=1)
    # create enough paragraphs to reach ~30 pages overall; keep text concise but plentiful
    lorem = (
        "This section presents details related to the topic. The system addresses route planning as a graph problem. "
        "It models stations as nodes and connections as edges with weights for distance, time, and cost. "
        "Design trade-offs, data assumptions, and implementation notes are discussed in depth to support replicability and evaluation."
    )
    for _ in range(paragraphs):
        doc.add_paragraph(lorem)
    if placeholders:
        doc.add_paragraph('[Insert Screenshot Placeholder]')
        doc.add_paragraph('[Insert Code Snippet Placeholder]')
        doc.add_paragraph('[Insert Data Sample Placeholder]')
    doc.add_page_break()


def build_report():
    doc = Document()

    # Title, ack, declaration, toc
    add_title_page(doc)
    add_acknowledgement(doc)
    add_declaration(doc)
    add_toc_placeholder(doc)

    # Core chapters (tuned paragraph counts to approach ~30 pages depending on default Word layout)
    add_section(doc, '1. Introduction', paragraphs=6)
    add_section(doc, '2. Literature Review', paragraphs=8)
    add_section(doc, '3. System Requirements', paragraphs=5)
    add_section(doc, '4. System Architecture', paragraphs=7, placeholders=True)
    add_section(doc, '5. Data Model and APIs', paragraphs=6, placeholders=True)
    add_section(doc, '6. Design and Algorithms', paragraphs=8, placeholders=True)
    add_section(doc, '7. Implementation Details', paragraphs=7, placeholders=True)
    add_section(doc, '8. Data Preparation and Bulk Generation', paragraphs=5, placeholders=True)
    add_section(doc, '9. Testing Strategy and Results', paragraphs=6, placeholders=True)
    add_section(doc, '10. Discussion', paragraphs=4)
    add_section(doc, '11. Future Work', paragraphs=4)
    add_section(doc, '12. Conclusion', paragraphs=3)

    # References and Appendices
    doc.add_heading('References', level=1)
    doc.add_paragraph('[1] E. W. Dijkstra, A note on two problems in connexion with graphs, Numerische Mathematik, 1959.')
    doc.add_paragraph('[2] P. E. Hart, N. J. Nilsson, and B. Raphael, A Formal Basis for the Heuristic Determination of Minimum Cost Paths, IEEE, 1968.')
    doc.add_paragraph('[3] Leaflet.js Documentation. https://leafletjs.com')
    doc.add_paragraph('[4] React Documentation. https://react.dev')
    doc.add_paragraph('[5] Tailwind CSS Documentation. https://tailwindcss.com')
    doc.add_page_break()

    doc.add_heading('Appendix A: API Schema', level=1)
    doc.add_paragraph('[Insert API schema and sample requests/responses]')
    doc.add_page_break()

    doc.add_heading('Appendix B: CSV/JSON Samples', level=1)
    doc.add_paragraph('[Insert sample of stations.csv, connections.csv and JSON export]')
    doc.add_page_break()

    doc.add_heading('Appendix C: Selected Code Listings', level=1)
    doc.add_paragraph('[Insert selected frontend and backend code excerpts with explanation]')

    doc.save(str(OUT_PATH))
    print(f"Report written to {OUT_PATH}")


if __name__ == '__main__':
    build_report()
